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
        if "quota" in str(e).lower() or "429" in str(e) or "RateLimitError" in str(type(e)):
            raise ValueError("AI_QUOTA_EXHAUSTED")
        
        # If it's a parse error or safety block, try one more time
        logging.warning(f"Error in generate_roadmap: {e}. Retrying once...")
        try:
            resp = call_llm(system + " (CRITICAL: ONLY JSON, NO TEXT)", user, json_mode=True)
            return _parse_json(resp)
        except Exception as e2:
            logging.error(f"Final failure in generate_roadmap for goal '{goal}': {e2}")
            raise ValueError(f"AI Generation Error: {str(e2)}")

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
        if "quota" in str(e).lower() or "429" in str(e) or "RateLimitError" in str(type(e)):
            raise ValueError("AI_QUOTA_EXHAUSTED")
            
        # Retry once for parsing/model errors
        logging.warning(f"Error in expand_subtopics: {e}. Retrying...")
        
        try:
            resp = call_llm(system + " (CRITICAL: ONLY JSON, NO TEXT)", user, json_mode=True)
            return _parse_json(resp)
        except Exception as e2:
            logging.error(f"Final failure in expand_subtopics for {skill_name}: {e2}")
            raise ValueError(f"Curriculum Generation Error: {str(e2)}")

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
        if "quota" in str(e).lower() or "429" in str(e) or "RateLimitError" in str(type(e)):
            raise ValueError("AI_QUOTA_EXHAUSTED")
            
        logging.warning(f"Error in generate_practice for {skill}: {e}. Retrying once...")
        try:
            resp = call_llm(system + " (CRITICAL: ONLY JSON, NO TEXT)", user, json_mode=True)
            return _parse_json(resp)
        except Exception as e2:
            logging.error(f"Final failure in generate_practice for {skill}: {e2}")
            raise ValueError(f"Practice Generation Error: {str(e2)}")

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
