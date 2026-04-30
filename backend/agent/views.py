import json
import logging
from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Goal, SkillNode, LearningPath, Session, Checkpoint, Subtopic
from .serializers import GoalSerializer, SessionSerializer, CheckpointSerializer, SubtopicSerializer
from .agent_engine import (
    generate_roadmap, expand_subtopics, generate_practice, 
    evaluate_answer, generate_summary, RateLimitError, 
    get_subtopic_explanation, find_similar_goal as find_similar_goal_ai
)
from .mongo_client import mongo_brain



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
    similar_title = find_similar_goal_ai(title, existing_titles)

    if similar_title:
        existing_goal = Goal.objects.get(title=similar_title, user=request.user)
        # Fetch its graph from Mongo
        graph = mongo_brain.graphs.find_one({'goal_id': existing_goal.id}, sort=[('created_at', -1)])
        if graph:
            graph['_id'] = str(graph['_id'])
            return Response({
                'goal': GoalSerializer(existing_goal).data, 
                'graph': graph['graph_json'],
                'is_duplicate': True 
            }, status=status.HTTP_200_OK)
    
    try:
        roadmap = generate_roadmap(title)
        skills_list = roadmap.get('skills', [])
        graph_data = roadmap.get('graph', {'nodes': [], 'edges': []})
        
        # Only create the goal if we successfully got a roadmap
        goal = Goal.objects.create(title=title, description=description, user=request.user, status='active')
        
        # Save SkillNodes
        for skill in skills_list:
            SkillNode.objects.create(
                goal=goal,
                skill_name=skill.get('name', 'Unknown'),
                description=skill.get('description', ''),
                estimated_hours=skill.get('estimated_hours', 1)
            )
            
        # Save to MongoDB
        mongo_brain.graphs.insert_one({
            'goal_id': goal.id,
            'graph_json': graph_data,
            'version': 1,
            'created_at': datetime.utcnow()
        })
        
        return Response({'goal': GoalSerializer(goal).data, 'graph': graph_data}, status=status.HTTP_201_CREATED)
    except Exception as e:
        if str(e) == "AI_QUOTA_EXHAUSTED":
            return Response({'error': 'AI Quota Exhausted. Please wait a minute and try again.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
        logging.error(f"ERROR creating goal: {str(e)}", exc_info=True)
        return Response({'error': f"Failed to generate curriculum: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_goal(request, id):
    goal = get_object_or_404(Goal, pk=id, user=request.user)
    goal.delete()
    # Note: Cascading deletes will handle SkillNodes, but we should ideally clean up Mongo too
    mongo_brain.graphs.delete_many({'goal_id': id})
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_graph(request, id):
    goal = get_object_or_404(Goal, pk=id, user=request.user)
    graph = mongo_brain.graphs.find_one({'goal_id': goal.id}, sort=[('created_at', -1)])
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
        # Use goal_id to scope the search and perform case-insensitive matching
        node = SkillNode.objects.get(
            skill_name__iexact=skill_name.strip(), 
            goal_id=id, 
            goal__user=request.user
        )
        force_refresh = request.data.get('force_refresh', False)
        
        if force_refresh:
            node.subtopics.all().delete()
        elif node.subtopics.exists():
            return Response({'subtopics': SubtopicSerializer(node.subtopics.all(), many=True).data})
            
        subtopics_data = expand_subtopics(skill_name)
        subtopics_list = subtopics_data.get('subtopics', [])
        
        created_subtopics = []
        seen_titles = set()
        for st in subtopics_list:
            title = st.get('title', 'Unknown Topic').strip()
            if title.lower() in seen_titles:
                continue
            seen_titles.add(title.lower())
            
            explanation = st.get('full_explanation', '')
            refs = st.get('references', [])
            if refs:
                explanation += "\n\n### References\n" + "\n".join([f"- {r}" for r in refs])

            created_subtopics.append(Subtopic.objects.create(
                skill_node=node,
                title=title,
                description=st.get('description', ''),
                duration_mins=st.get('duration_mins', 30),
                explanation=explanation
            ))
            
        return Response({'subtopics': SubtopicSerializer(created_subtopics, many=True).data})
    except SkillNode.DoesNotExist:
        return Response({'error': 'Skill not found'}, status=status.HTTP_404_NOT_FOUND)
    except RateLimitError as e:
        return Response({'error': 'AI is rate limited'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
    except Exception as e:
        if str(e) == "AI_QUOTA_EXHAUSTED":
            return Response({'error': 'AI Quota Exhausted. Please wait a minute and try again.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_subtopic(request, id):
    try:
        subtopic = Subtopic.objects.get(pk=id, skill_node__goal__user=request.user)
        subtopic.is_studied = not subtopic.is_studied
        subtopic.save()
        if subtopic.is_studied:
            # Check if all subtopics for this skill node are studied
            node = subtopic.skill_node
            all_studied = not node.subtopics.filter(is_studied=False).exists()
            if all_studied:
                checkpoint, _ = Checkpoint.objects.get_or_create(
                    user=request.user,
                    skill_name=node.skill_name,
                    defaults={'proficiency': 0}
                )
                checkpoint.proficiency = 100
                checkpoint.save()
            
        return Response({'status': 'success', 'is_studied': subtopic.is_studied})
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
    goal_id = request.data.get('goal_id')
    
    # Get other subtopics in this skill for context
    try:
        if goal_id:
            node = SkillNode.objects.get(skill_name__iexact=skill_name.strip(), goal_id=goal_id, goal__user=request.user)
        else:
            # Fallback for legacy calls
            node = SkillNode.objects.filter(skill_name__iexact=skill_name.strip(), goal__user=request.user).first()
            if not node:
                raise SkillNode.DoesNotExist
                
        subtopic = Subtopic.objects.get(title__iexact=subtopic_title.strip(), skill_node=node)
        
        if subtopic.explanation:
            explanation = subtopic.explanation
        else:
            all_subtopics = list(node.subtopics.values_list('title', flat=True))
            explanation = get_subtopic_explanation(skill_name, subtopic_title, all_subtopics)
            subtopic.explanation = explanation
            subtopic.save()
    except SkillNode.DoesNotExist:
        return Response({'error': 'Skill not found'}, status=status.HTTP_404_NOT_FOUND)
    except Subtopic.DoesNotExist:
        # Fallback if subtopic doesn't exist in DB yet
        explanation = get_subtopic_explanation(skill_name, subtopic_title, [])
    
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
    goal_id = request.data.get('goal_id')
        
    if goal_id:
        node = get_object_or_404(SkillNode, skill_name__iexact=skill_name.strip(), goal_id=goal_id, goal__user=request.user)
    else:
        node = get_object_or_404(SkillNode, skill_name__iexact=skill_name.strip(), goal__user=request.user)
        
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
        session.status = 'completed'
        from django.utils import timezone
        session.completed_at = timezone.now()
        session.save()
        
        checkpoint, _ = Checkpoint.objects.get_or_create(
            user=session.user, 
            skill_name=session.skill_node.skill_name,
            defaults={'proficiency': 0}
        )
        
        checkpoint.proficiency = max(checkpoint.proficiency, score)
        checkpoint.save()
        
        return Response(result)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_progress(request, user_id):
    try:
        sessions = Session.objects.filter(user=request.user)
        checkpoints = Checkpoint.objects.filter(user=request.user)
        return Response({
            'sessions': SessionSerializer(sessions, many=True).data,
            'checkpoints': CheckpointSerializer(checkpoints, many=True).data
        })
    except Exception as e:
        logging.error(f"ERROR in get_progress: {str(e)}", exc_info=True)
        # Return empty data gracefully instead of 500 to prevent frontend crashes
        return Response({
            'sessions': [],
            'checkpoints': []
        })


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
    
    goal_id = request.data.get('goal_id')
    
    try:
        if goal_id:
            subtopic = Subtopic.objects.get(
                title__iexact=subtopic_title.strip(), 
                skill_node__skill_name__iexact=skill_name.strip(), 
                skill_node__goal_id=goal_id,
                skill_node__goal__user=request.user
            )
        else:
            subtopic = Subtopic.objects.get(
                title__iexact=subtopic_title.strip(), 
                skill_node__skill_name__iexact=skill_name.strip(), 
                skill_node__goal__user=request.user
            )
        if not subtopic.is_studied:
            subtopic.is_studied = True
            subtopic.save()
            # XP Awarding placeholder removed
            
        # Check if all subtopics for this skill node are studied
        node = subtopic.skill_node
        all_studied = not node.subtopics.filter(is_studied=False).exists()
        if all_studied:
            checkpoint, _ = Checkpoint.objects.get_or_create(
                user=request.user,
                skill_name=node.skill_name,
                defaults={'proficiency': 0}
            )
            checkpoint.proficiency = 100
            checkpoint.save()
            
        return Response({'status': 'success', 'xp_earned': 50})
    except Subtopic.DoesNotExist:
        return Response({'error': 'Subtopic not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
