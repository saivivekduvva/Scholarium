import logging
import json
from datetime import datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .agent_engine import (
    generate_roadmap, expand_subtopics, generate_practice, 
    evaluate_answer, 
    RateLimitError, 
    get_subtopic_explanation, find_similar_goal as find_similar_goal_ai,
    generate_roadmap_quiz, evaluate_roadmap_quiz
)
from .models import Goal, SkillNode, Session, Checkpoint, Subtopic, QuizSession, QuizAnalytics
from .serializers import (
    GoalSerializer, SessionSerializer, CheckpointSerializer, SubtopicSerializer,
    QuizSessionSerializer, QuizAnalyticsSerializer
)
from .mongo_client import mongo_brain
import re

def get_skill_node(skill_name, goal_id, user):
    """Resiliently find a SkillNode by name, with relaxed fallback."""
    skill_clean = skill_name.strip()
    
    # 1. Try exact (case-insensitive) match
    if goal_id:
        node = SkillNode.objects.filter(
            skill_name__iexact=skill_clean, 
            goal_id=goal_id, 
            goal__user=user
        ).first()
    else:
        node = SkillNode.objects.filter(
            skill_name__iexact=skill_clean, 
            goal__user=user
        ).first()
        
    if node:
        return node
        
    # 2. Try relaxed match (strip punctuation and spaces)
    def clean_str(s): return re.sub(r'[^a-zA-Z0-9]', '', s).lower()
    target_clean = clean_str(skill_clean)
    
    if goal_id:
        all_nodes = SkillNode.objects.filter(goal_id=goal_id, goal__user=user)
    else:
        all_nodes = SkillNode.objects.filter(goal__user=user)
        
    for n in all_nodes:
        if clean_str(n.skill_name) == target_clean:
            return n
            
    return None



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
        
        # Map skills by ID for easier lookup
        skill_map = {str(s.get('id')): s for s in skills_list}
        
        # Save SkillNodes based on graph nodes for guaranteed frontend matching
        for node_data in graph_data.get('nodes', []):
            node_id = str(node_data.get('id'))
            skill_info = skill_map.get(node_id, {})
            
            SkillNode.objects.create(
                goal=goal,
                skill_name=node_data.get('data', {}).get('label', skill_info.get('name', 'Unknown')),
                description=node_data.get('data', {}).get('description', skill_info.get('description', '')),
                estimated_hours=skill_info.get('estimated_hours', 1)
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
        node = get_skill_node(skill_name, id, request.user)
        if not node:
            raise SkillNode.DoesNotExist
            
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
    except RateLimitError:
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
    # Get other subtopics in this skill for context
    try:
        node = get_skill_node(skill_name, goal_id, request.user)
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
def start_session(request):
    skill_name = request.data.get('skill_name')
    subtopic_title = request.data.get('subtopic_title')
    difficulty = request.data.get('difficulty', 'beginner')
    goal_id = request.data.get('goal_id')
        
    node = get_skill_node(skill_name, goal_id, request.user)
    if not node:
        return Response({'error': 'Skill not found'}, status=404)
        
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
def get_user_stats(request):
    try:
        user = request.user
        goals = Goal.objects.filter(user=user)
        total_goals = goals.count()
        
        completed_goals = 0
        for goal in goals:
            skill_nodes = goal.nodes.all()
            if skill_nodes.exists():
                skill_names = [sn.skill_name for sn in skill_nodes]
                checkpoints = Checkpoint.objects.filter(user=user, skill_name__in=skill_names)
                # A goal is completed if all its skills have a checkpoint >= 80
                if checkpoints.count() == len(skill_names) and checkpoints.count() > 0 and all(cp.proficiency >= 80 for cp in checkpoints):
                    completed_goals += 1
        
        practice_count = Session.objects.filter(user=user).count()
        roadmap_quiz_count = QuizSession.objects.filter(user=user).count()
        total_quizzes = practice_count + roadmap_quiz_count
        
        from django.db.models import Sum
        mastery_points = Checkpoint.objects.filter(user=user).aggregate(Sum('proficiency'))['proficiency__sum'] or 0
        
        return Response({
            'total_goals': total_goals,
            'completed_goals': completed_goals,
            'total_quizzes': total_quizzes,
            'practice_sessions': practice_count,
            'roadmap_quizzes': roadmap_quiz_count,
            'total_mastery_points': mastery_points
        })
    except Exception as e:
        logging.error(f"ERROR in get_user_stats: {str(e)}", exc_info=True)
        return Response({
            'total_goals': 0,
            'completed_goals': 0,
            'total_quizzes': 0,
            'total_mastery_points': 0
        })



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_subtopic_mastered(request):
    skill_name = request.data.get('skill_name')
    subtopic_title = request.data.get('subtopic_title')
    
    goal_id = request.data.get('goal_id')
    
    try:
        node = get_skill_node(skill_name, goal_id, request.user)
        if not node:
            return Response({'error': 'Skill not found'}, status=404)
            
        subtopic = Subtopic.objects.get(
            title__iexact=subtopic_title.strip(), 
            skill_node=node
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

            # Check if all other skills in the goal are completed
            all_goal_skills = node.goal.nodes.all()
            skill_names = [sn.skill_name for sn in all_goal_skills]
            goal_checkpoints = Checkpoint.objects.filter(user=request.user, skill_name__in=skill_names, proficiency=100)
            
            if goal_checkpoints.count() == len(skill_names):
                node.goal.status = 'completed'
                node.goal.save()
            
        return Response({'status': 'success', 'xp_earned': 50})
    except Subtopic.DoesNotExist:
        return Response({'error': 'Subtopic not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz_status(request):
    goal_id = request.query_params.get('goal_id')
    if not goal_id:
        return Response({'error': 'goal_id required'}, status=400)
    
    goal = Goal.objects.filter(pk=goal_id, user=request.user).first()
    if not goal:
        return Response({'can_take_quiz': False, 'completed_subtopics_count': 0, 'message': 'Goal not found'})
        
    completed_count = Subtopic.objects.filter(skill_node__goal=goal, is_studied=True).count()
    
    return Response({
        'can_take_quiz': completed_count > 0,
        'completed_subtopics_count': completed_count
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_roadmap_quiz(request):
    goal_id = request.data.get('goal_id')
    if not goal_id:
        return Response({'error': 'goal_id required'}, status=400)
    
    goal = get_object_or_404(Goal, pk=goal_id, user=request.user)
    completed_subtopics = list(Subtopic.objects.filter(skill_node__goal=goal, is_studied=True).values_list('title', flat=True))
    
    if not completed_subtopics:
        return Response({'error': 'No completed subtopics to base quiz on'}, status=400)
    
    try:
        quiz_data = generate_roadmap_quiz(goal.title, completed_subtopics)
        
        if not quiz_data or not quiz_data.get('questions'):
            return Response({'error': 'AI failed to generate quiz questions. Please try again.'}, status=500)

        session = QuizSession.objects.create(
            user=request.user,
            goal=goal,
            completed_subtopics_snapshot=completed_subtopics,
            questions_json=quiz_data.get('questions', [])
        )
        
        return Response({
            'session_id': session.id,
            'questions': session.questions_json
        })
    except Exception as e:
        logging.error(f"Quiz Generation Error for goal {goal_id}: {str(e)}", exc_info=True)
        return Response({'error': f'AI Generation Error: {str(e)}'}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_roadmap_quiz(request, id):
    session = get_object_or_404(QuizSession, pk=id, user=request.user)
    user_answers = request.data.get('answers') # List of indices
    
    if user_answers is None or len(user_answers) != len(session.questions_json):
        return Response({'error': 'Invalid answers format or count'}, status=400)
    
    try:
        evaluation = evaluate_roadmap_quiz(session.id, session.questions_json, user_answers)
        
        # Update session
        session.correct_count = evaluation.get('correct_count', 0)
        session.wrong_count = evaluation.get('wrong_count', 0)
        session.accuracy = evaluation.get('accuracy_percentage', 0.0)
        session.user_answers = user_answers
        
        gap_analysis = evaluation.get('gap_analysis', {})
        session.weak_concepts = gap_analysis.get('weak_concepts', [])
        session.revision_priority = gap_analysis.get('revision_priority', [])
        session.gap_summary = gap_analysis.get('summary', '')
        session.save()
        
        # Update Analytics
        analytics, _ = QuizAnalytics.objects.get_or_create(user=request.user, goal=session.goal)
        
        # Keep last 5 quizzes
        last_quizzes = list(analytics.last_quizzes)
        last_quizzes.append({
            'session_id': session.id,
            'accuracy': session.accuracy,
            'date': datetime.now().isoformat()
        })
        analytics.last_quizzes = last_quizzes[-5:]
        
        # Accuracy over time
        accuracy_history = list(analytics.accuracy_over_time)
        accuracy_history.append({
            'date': datetime.now().date().isoformat(),
            'accuracy': session.accuracy
        })
        analytics.accuracy_over_time = accuracy_history
        
        # Concept coverage
        coverage = dict(analytics.subtopic_coverage)
        for i, q in enumerate(session.questions_json):
            concept = q.get('related_concept', 'General')
            is_correct = user_answers[i] == q.get('correct_option')
            
            if concept not in coverage:
                coverage[concept] = {'correct': 0, 'wrong': 0}
            
            if is_correct:
                coverage[concept]['correct'] += 1
            else:
                coverage[concept]['wrong'] += 1
        analytics.subtopic_coverage = coverage
        
        # Simple recommendation insight
        if session.weak_concepts:
            analytics.recommendation_insight = f"You are doing well but need more practice in: {', '.join(session.weak_concepts[:2])}."
        else:
            analytics.recommendation_insight = "Great job! You have a solid grasp of the completed topics."
            
        analytics.save()
        
        return Response({
            'result': evaluation,
            'analytics': QuizAnalyticsSerializer(analytics).data
        })
    except Exception as e:
        logging.error(f"Quiz Submission Error for session {id}: {str(e)}", exc_info=True)
        return Response({'error': f"Submission failed: {str(e)}"}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_quiz_analytics(request):
    goal_id = request.query_params.get('goal_id')
    if not goal_id:
        return Response({'error': 'goal_id required'}, status=400)
    
    goal = get_object_or_404(Goal, pk=goal_id, user=request.user)
    analytics = QuizAnalytics.objects.filter(user=request.user, goal=goal).first()
    
    if not analytics:
        return Response({'message': 'No quiz data yet'}, status=200)
        
    return Response(QuizAnalyticsSerializer(analytics).data)
