# Scholarium Agent Engine v1.0.1
import json
import hashlib
import time
import logging
from datetime import datetime
from .mongo_client import mongo_brain
from .llm_service import call_llm, RateLimitError
from .utils import log_conversation, parse_json_response as _parse_json

def find_similar_goal(new_goal_title: str, existing_goals: list) -> str:
    """
    Returns the title of the similar goal if found, else None.
    existing_goals is a list of strings (titles).
    """
    if not existing_goals:
        return None
        
    # 1. Check for exact match first (case-insensitive)
    for g in existing_goals:
        if g.strip().lower() == new_goal_title.strip().lower():
            return g
        
    system = "You are a semantic matching expert. Compare the NEW goal with the list of EXISTING goals."
    user = f"""NEW Goal: {new_goal_title}
    EXISTING Goals: {json.dumps(existing_goals)}
    
    If the NEW goal is semantically the same as one of the EXISTING goals (e.g. 'Learn Python' and 'Study Python Programming'), return ONLY the exact title from the EXISTING list.
    If there is no close match, return ONLY the word 'NONE'.
    Do not provide any explanation."""
    
    try:
        resp = call_llm(system, user).strip()
        if resp.upper() == 'NONE' or resp == '':
            return None
        # Verify it's actually in the list (case insensitive search just in case)
        for g in existing_goals:
            if g.lower() == resp.lower():
                return g
        return None
    except Exception as e:
        logging.error(f"Error in find_similar_goal: {e}")
        return None

def generate_roadmap(goal: str) -> dict:
    system = """You are a curriculum and graph layout expert for Scholarium. 
    Break down the goal into a logical sequence of skills (DAG).
    Return a JSON object containing both the list of skills and the visual graph layout (React Flow format).
    
    Nodes must have: id, type: 'skillNode', data: { label: 'name', description: 'desc' }, position {x, y}.
    Edges must have: id, source, target.
    
    Arrange the nodes logically from left to right (foundational to advanced).
    
    CRITICAL: The 'name' in the skills list MUST EXACTLY MATCH the 'label' in the graph nodes for each corresponding ID.
    CRITICAL: RETURN ONLY VALID JSON. NO CONVERSATIONAL TEXT."""
    
    user = f"""Goal: {goal}
    Return JSON format: 
    {{
        "skills": [
            {{ "id": "s1", "name": "Skill Name", "description": "Short description", "estimated_hours": 5 }}
        ],
        "graph": {{
            "nodes": [
                {{ "id": "s1", "type": "skillNode", "data": {{ "label": "Skill Name", "description": "Short description" }}, "position": {{ "x": 0, "y": 0 }} }}
            ],
            "edges": []
        }}
    }}"""
    try:
        resp = call_llm(system, user, json_mode=True)
        return _parse_json(resp)
    except Exception as e:
        logging.error(f"Error in generate_roadmap for goal '{goal}': {e}")
        raise e

def expand_subtopics(skill_name: str) -> dict:
    system = """You are an expert Curriculum Architect. Your goal is to break down a complex skill into exactly 4-5 logically sequenced, UNIQUE subtopics.
    
    RULES:
    1. NO DUPLICATES: Every subtopic must have a unique title.
    2. LOGICAL FLOW: Order from foundational to advanced.
    3. DESCRIPTION: Provide a brief summary (20-30 words) for each subtopic.
    4. LIMIT: Generate exactly 4-5 subtopics per skill.
    
    Return ONLY valid JSON."""
    
    user = f"""Skill: {skill_name}
    Return JSON format: 
    {{
        "subtopics": [
            {{ 
                "title": "Subtopic Name", 
                "description": "Short summary of focus...", 
                "duration_mins": 30
            }}
        ]
    }}"""
    try:
        resp = call_llm(system, user, json_mode=True)
        return _parse_json(resp)
    except Exception as e:
        logging.error(f"Error in expand_subtopics for {skill_name}: {e}")
        raise e

def generate_practice(skill: str, difficulty: str, context: list = None) -> dict:
    system = """You are a friendly and encouraging tutor for Scholarium. 
    Your goal is to assess the learner's basic understanding with clear, foundational questions.
    
    Rules for question generation:
    1. ACCESSIBLE DIFFICULTY: Focus on core concepts and fundamental principles. Avoid overly complex edge cases.
    2. BE CLEAR: Use simple, easy-to-understand language.
    3. RELEVANT DISTRACTORS: Distractors should be plausible but clearly incorrect for someone who knows the basics.
    4. VARIETY: Ensure questions cover the essential aspects of the subtopic.
    
    Return ONLY valid JSON."""
    
    context_str = json.dumps(context) if context else "No additional context."
    salt = time.time()
    user = f"""Topic: {skill}
    Difficulty: beginner
    Context: {context_str}
    Salt: {salt} (Generate completely unique and fresh questions)
    
    Generate exactly 5 clear, random, and varied multiple-choice questions.
    Return JSON format: 
    {{
        "questions": [
            {{
                "prompt": "Clear, foundational question...", 
                "options": ["Option A", "Option B", "Option C", "Option D"], 
                "correct_option": 0
            }}
        ]
    }}"""
    try:
        resp = call_llm(system, user, json_mode=True)
        return _parse_json(resp)
    except Exception as e:
        logging.error(f"Error in generate_practice for {skill}: {e}")
        raise e

def generate_roadmap_quiz(goal_title: str, completed_subtopics: list) -> dict:
    system = """You are a master educator for Scholarium. 
    Your task is to create a comprehensive roadmap-wide quiz.
    
    RULES:
    1. DIFFICULTY: Questions must be in the EASY to MEDIUM range. Focus on clarity and core concepts.
    2. RELEVANCE: Questions MUST ONLY be based on the provided list of completed subtopics.
    3. VARIETY: Ensure the 7 questions cover a range of the completed subtopics.
    4. FORMAT: Return exactly 7 Multiple Choice Questions.
    5. JSON: Return ONLY valid JSON.
    
    Each question should have:
    - prompt: The question text.
    - options: A list of 4 options.
    - correct_option: Index (0-3) of the correct answer.
    - related_concept: The specific subtopic title this question belongs to.
    """
    
    subtopics_str = ", ".join(completed_subtopics)
    user = f"""Goal: {goal_title}
    Completed Subtopics: {subtopics_str}
    
    Generate 7 multiple-choice questions based on these subtopics.
    Return JSON format:
    {{
        "questions": [
            {{
                "prompt": "...",
                "options": ["...", "...", "...", "..."],
                "correct_option": 0,
                "related_concept": "Subtopic Name"
            }}
        ]
    }}"""
    
    try:
        resp = call_llm(system, user, json_mode=True)
        return _parse_json(resp)
    except Exception as e:
        logging.error(f"Error in generate_roadmap_quiz: {e}")
        raise ValueError(f"Quiz Generation Error: {str(e)}")

def evaluate_roadmap_quiz(quiz_session_id: int, questions: list, user_answers: list) -> dict:
    system = """You are an expert technical mentor. Your goal is to evaluate a learner's quiz performance and provide actionable gap analysis.
    
    RULES:
    1. SCORING: For each question, determine if it is Correct or Wrong.
    2. CONCEPT MAPPING: For each wrong answer, identify why they missed it.
    3. GAP ANALYSIS: Summarize the weak concepts and provide revision priorities.
    4. TONE: Be direct, clear, and actionable.
    
    Return ONLY valid JSON."""
    
    evaluation_data = []
    for q, a in zip(questions, user_answers):
        evaluation_data.append({
            "question": q['prompt'],
            "correct_option": q['correct_option'],
            "user_option": a,
            "concept": q['related_concept']
        })
        
    user = f"""Evaluation Data: {json.dumps(evaluation_data)}
    
    Analyze the results and return JSON format:
    {{
        "correct_count": 0,
        "wrong_count": 0,
        "accuracy_percentage": 0.0,
        "results": [
            {{ "is_correct": true/false, "feedback": "Brief feedback" }}
        ],
        "gap_analysis": {{
            "weak_concepts": ["Concept A", "Concept B"],
            "revision_priority": ["Concept A is priority because..."],
            "summary": "Overall summary of what to learn next."
        }}
    }}"""
    
    try:
        resp = call_llm(system, user, json_mode=True)
        data = _parse_json(resp)
        
        # Store evaluation in Mongo for history
        mongo_brain.evaluations.insert_one({
            'quiz_session_id': quiz_session_id,
            'type': 'roadmap_quiz',
            'data': data,
            'timestamp': datetime.utcnow()
        })
        
        return data
    except Exception as e:
        logging.error(f"Error in evaluate_roadmap_quiz: {e}")
        raise ValueError(f"Quiz Evaluation Error: {str(e)}")

def evaluate_answer(session_id: int, skill: str, question: str, answer: str) -> dict:
    system = """You are a supportive and helpful technical mentor. 
    Your goal is to provide encouraging feedback that helps the learner grow.
    
    CRITICAL RULES:
    1. BINARY SCORING: For Multiple Choice Questions, the score MUST be 100 if correct and 0 if wrong. No in-between.
    2. TEXT SCORING: For text answers, use 100 for correct, 50 for partially correct, and 0 for wrong. Avoid random values.
    3. BE SUPPORTIVE: Use a positive, encouraging tone.
    4. NO LENGTH BIAS: Judge only on the technical accuracy.
    
    Return ONLY valid JSON."""
    
    user = f"""Topic: {skill}
    Question: {question}
    Student Answer: {answer}
    
    Return JSON format: 
    {{
        "score": 0-100, 
        "verdict": "pass" | "fail", 
        "strengths": ["list 1-2 things they did well"], 
        "gaps": ["list 1-2 things they can improve"], 
        "next_step": "Encouraging advice for next time"
    }}"""
    try:
        resp = call_llm(system, user, json_mode=True)
        mongo_brain.evaluations.insert_one({
            'session_id': session_id,
            'skill': skill,
            'question': question,
            'user_answer': answer,
            'llm_raw_response': resp
        })
        return _parse_json(resp)
    except Exception as e:
        logging.error(f"Error parsing evaluate_answer: {e}")
        raise ValueError("Failed to parse JSON")

def generate_summary(user_id: int, checkpoints: list) -> str:
    system = "You are a career coach writing a Scholarium learner report."
    user = f"User checkpoints: {json.dumps(checkpoints)}. Write a 3-sentence capability summary."
    try:
        return call_llm(system, user)
    except Exception as e:
        logging.error(f"Error generating summary: {e}")
        return "Failed to generate summary."

def get_subtopic_explanation(skill_name: str, subtopic_title: str, context_subtopics: list = None) -> str:
    # LLM Only Strategy (Wikipedia Scrape Removed as per user request)
    system = """You are a technical educator for Scholarium.
    
    STRICT RULES:
    1. RELEVANCE: Only talk about the specific subtopic.
    2. CONCISE: Keep the explanation clear-cut and strictly UNDER 350 WORDS.
    3. NO HALLUCINATIONS: Stay strictly within the technical bounds.
    4. FORMATTING: Use clean Markdown, bold headers, and short code examples if needed.
    5. REFERENCES: At the end of the explanation, provide 2-3 reference links (e.g., official docs, MDN, Wikipedia) for further reading."""
    
    context_str = ", ".join(context_subtopics) if context_subtopics else "No other topics provided."
    user = f"""Skill: {skill_name}
    Specific Subtopic to explain: {subtopic_title}
    
    Context (Other subtopics in this skill - DO NOT EXPLAIN THESE): {context_str}
    
    Write a clear-cut explanation for '{subtopic_title}' only (under 350 words). Include 2-3 reference links."""
    
    try:
        return call_llm(system, user)
    except Exception as e:
        logging.error(f"Error generating explanation: {e}")
        return "Failed to generate explanation. Please try again."
