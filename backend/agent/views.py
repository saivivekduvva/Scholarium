from django.db import models
import json
from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from datetime import date, timedelta
from .models import Goal, SkillNode, LearningPath, Session, Checkpoint, Subtopic, XPActivity
from .serializers import GoalSerializer, SessionSerializer, CheckpointSerializer, SubtopicSerializer
from .agent_engine import identify_skills, generate_graph_layout, expand_subtopics, generate_practice, evaluate_answer, generate_summary, RateLimitError, get_subtopic_explanation
from .mongo_client import graphs_col

def award_xp(user, amount, activity_type):
    # 1. Create XPActivity record
    XPActivity.objects.create(user=user, amount=amount, activity_type=activity_type)
    
    # 2. Update total XP
    user.total_xp += amount
    
    # 3. Update Streak
    today = date.today()
    if user.last_activity_date:
        if user.last_activity_date == today - timedelta(days=1):
            # Consecutive day!
            user.streak_count += 1
        elif user.last_activity_date < today - timedelta(days=1):
            # Streak broken
            user.streak_count = 1
    else:
        # First activity ever
        user.streak_count = 1
        
    user.last_activity_date = today
    user.save()

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def create_goal(request):
    if request.method == 'GET':
        goals = Goal.objects.filter(user=request.user).order_by('-created_at')
        return Response(GoalSerializer(goals, many=True).data)

    # POST logic
    title = request.data.get('title')
    description = request.data.get('description', '')

    # Check for similar goals first
    existing_titles = list(Goal.objects.filter(user=request.user).values_list('title', flat=True))
    similar_title = find_similar_goal(title, existing_titles)

    if similar_title:
        existing_goal = Goal.objects.get(title=similar_title, user=request.user)
        # Fetch its graph from Mongo
        graph = graphs_col.find_one({'goal_id': existing_goal.id}, sort=[('created_at', -1)])
        if graph:
            graph['_id'] = str(graph['_id'])
            return Response({
                'goal': GoalSerializer(existing_goal).data, 
                'graph': graph['graph_json'],
                'is_duplicate': True 
            }, status=status.HTTP_200_OK)
    
    goal = Goal.objects.create(title=title, description=description, user=request.user, status='active')
    
    try:
        skills_data = identify_skills(title)
        skills_list = skills_data.get('skills', [])
        
        # Save SkillNodes
        for skill in skills_list:
            SkillNode.objects.create(
                goal=goal,
                skill_name=skill.get('name', 'Unknown'),
                description=skill.get('description', ''),
                estimated_hours=skill.get('estimated_hours', 1)
            )
            
        # Generate Graph
        graph_data = generate_graph_layout(skills_list)
        
        # Save to MongoDB
        graphs_col.insert_one({
            'goal_id': goal.id,
            'graph_json': graph_data,
            'version': 1,
            'created_at': datetime.utcnow()
        })
        
        return Response({'goal': GoalSerializer(goal).data, 'graph': graph_data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_graph(request, id):
    goal = get_object_or_404(Goal, pk=id, user=request.user)
    graph = graphs_col.find_one({'goal_id': goal.id}, sort=[('created_at', -1)])
    if not graph:
        return Response({'error': 'Graph not found'}, status=status.HTTP_404_NOT_FOUND)
    
    graph['_id'] = str(graph['_id'])
    return Response(graph['graph_json'])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def expand_skill(request, id):
    skill_name = request.data.get('skill_name')
    if not skill_name:
        return Response({'error': 'skill_name required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        node = SkillNode.objects.get(skill_name=skill_name, goal__user=request.user)
        existing_subtopics = node.subtopics.all()
        
        if existing_subtopics.exists():
            return Response({'subtopics': SubtopicSerializer(existing_subtopics, many=True).data})
            
        subtopics_data = expand_subtopics(skill_name)
        subtopics_list = subtopics_data.get('subtopics', [])
        
        created_subtopics = []
        for st in subtopics_list:
            created_subtopics.append(Subtopic.objects.create(
                skill_node=node,
                title=st.get('title', 'Unknown Topic'),
                description=st.get('description', ''),
                duration_mins=st.get('duration_mins', 30)
            ))
            
        return Response({'subtopics': SubtopicSerializer(created_subtopics, many=True).data})
    except SkillNode.DoesNotExist:
        return Response({'error': 'Skill not found'}, status=status.HTTP_404_NOT_FOUND)
    except RateLimitError as e:
        return Response({'error': 'AI is rate limited'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_subtopic(request, id):
    try:
        subtopic = Subtopic.objects.get(pk=id, skill_node__goal__user=request.user)
        subtopic.is_studied = not subtopic.is_studied
        subtopic.save()
        if subtopic.is_studied:
            award_xp(request.user, 10, 'subtopic_complete')
            
        return Response({'status': 'success', 'is_studied': subtopic.is_studied, 'xp_earned': 10 if subtopic.is_studied else 0})
    except Subtopic.DoesNotExist:
        return Response({'error': 'Subtopic not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_explanation(request):
    skill_name = request.data.get('skill_name')
    subtopic_title = request.data.get('subtopic_title')
    if not skill_name or not subtopic_title:
        return Response({'error': 'skill_name and subtopic_title required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get other subtopics in this skill for context
    try:
        node = SkillNode.objects.get(skill_name=skill_name, goal__user=request.user)
        all_subtopics = list(node.subtopics.values_list('title', flat=True))
    except SkillNode.DoesNotExist:
        all_subtopics = []

    explanation = get_subtopic_explanation(skill_name, subtopic_title, all_subtopics)
    
    # Generate direct pro source links
    query = subtopic_title.replace(' ', '+')
    pro_sources = [
        {"name": "GeeksforGeeks", "url": f"https://www.geeksforgeeks.org/search/{query}", "icon": "gfg"},
        {"name": "Programiz", "url": f"https://www.programiz.com/search/{query}", "icon": "programiz"}
    ]
    
    return Response({
        'explanation': explanation,
        'pro_sources': pro_sources
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_path(request, id):
    goal = get_object_or_404(Goal, pk=id, user=request.user)
    ordered_ids = request.data.get('ordered_skill_ids', [])
    path = LearningPath.objects.create(goal=goal, ordered_skill_ids=ordered_ids)
    return Response({'status': 'success', 'path_id': path.id})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_session(request):
    skill_name = request.data.get('skill_name')
    subtopic_title = request.data.get('subtopic_title')
    difficulty = request.data.get('difficulty', 'beginner')
        
    node = get_object_or_404(SkillNode, skill_name=skill_name, goal__user=request.user)
    session = Session.objects.create(user=request.user, skill_node=node)
    
    # Get subtopics for context
    subtopics = list(node.subtopics.values('title', 'description'))
    
    try:
        # Use subtopic_title as the primary subject if provided, else fall back to skill_name
        subject = subtopic_title if subtopic_title else node.skill_name
        practice = generate_practice(subject, difficulty, subtopics)
        return Response({'session_id': session.id, 'practice': practice})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def evaluate_session_answer(request, id):
    session = get_object_or_404(Session, pk=id, user=request.user)
    question = request.data.get('question')
    answer = request.data.get('answer')
    
    try:
        result = evaluate_answer(session.id, session.skill_node.skill_name, question, answer)
        score = result.get('score', 0)
        
        session.score = score
        session.save()
        
        checkpoint, _ = Checkpoint.objects.get_or_create(
            user=session.user, 
            skill_name=session.skill_node.skill_name,
            defaults={'proficiency': 0}
        )
        
        checkpoint.proficiency = max(checkpoint.proficiency, score)
        checkpoint.save()
        
        # Award XP for session passing
        xp_earned = 0
        if score >= 70:
            xp_earned = 50
            award_xp(session.user, xp_earned, 'session_pass')
        
        return Response({**result, 'xp_earned': xp_earned})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_progress(request, user_id):
    sessions = Session.objects.filter(user=request.user)
    checkpoints = Checkpoint.objects.filter(user=request.user)
    return Response({
        'sessions': SessionSerializer(sessions, many=True).data,
        'checkpoints': CheckpointSerializer(checkpoints, many=True).data
    })

from django.db.models import Sum
from users.models import User

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_leaderboard(request):
    # XP earned this week (last 7 days)
    last_week = date.today() - timedelta(days=7)
    
    from django.db.models.functions import Coalesce
    
    top_users = User.objects.annotate(
        weekly_xp=Coalesce(Sum('xp_activities__amount', filter=models.Q(xp_activities__created_at__gte=last_week)), 0)
    ).order_by('-weekly_xp', '-total_xp')[:10]
    
    leaderboard = []
    for user in top_users:
        leaderboard.append({
            'username': user.username,
            'weekly_xp': user.weekly_xp,
            'avatar_url': getattr(user, 'avatar_url', None), # Safe access
            'total_xp': user.total_xp
        })
        
    return Response(leaderboard)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_summary(request, id): 
    checkpoints = list(Checkpoint.objects.filter(user=request.user).values('skill_name', 'proficiency'))
    summary = generate_summary(request.user.id, checkpoints)
    return Response({'summary': summary})
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_subtopic_mastered(request):
    skill_name = request.data.get('skill_name')
    subtopic_title = request.data.get('subtopic_title')
    
    try:
        subtopic = Subtopic.objects.get(
            title=subtopic_title, 
            skill_node__skill_name=skill_name, 
            skill_node__goal__user=request.user
        )
        if not subtopic.is_studied:
            subtopic.is_studied = True
            subtopic.save()
            award_xp(request.user, 50, 'subtopic_mastery') # Premium bonus for passing quiz
            
        return Response({'status': 'success', 'xp_earned': 50})
    except Subtopic.DoesNotExist:
        return Response({'error': 'Subtopic not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
