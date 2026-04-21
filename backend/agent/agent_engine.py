import os
import json
import anthropic
import google.generativeai as genai
from dotenv import load_dotenv
from datetime import datetime
import hashlib
from .mongo_client import evaluations_col, conversations_col, llm_cache_col

class RateLimitError(Exception):
    pass

load_dotenv()

# Setup Providers
try:
    anthropic_client = anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY', 'dummy'))
except Exception:
    anthropic_client = None
genai.configure(api_key=os.environ.get('GEMINI_API_KEY', 'dummy'))
gemini_model = genai.GenerativeModel('gemini-flash-lite-latest')

def log_conversation(session_id, role, content):
    conversations_col.update_one(
        {'session_id': session_id},
        {'$push': {'messages': {'role': role, 'content': content}}, '$setOnInsert': {'created_at': datetime.utcnow()}},
        upsert=True
    )

def call_claude(system: str, user: str) -> str:
    msg = anthropic_client.messages.create(
        model="claude-3-sonnet-20240229", # Using widely available sonnet or standard
        max_tokens=2048,
        system=system,
        messages=[{"role": "user", "content": user}]
    )
    return msg.content[0].text

def call_gemini(system: str, user: str) -> str:
    response = gemini_model.generate_content(f"{system}\n\n{user}")
    return response.text

def call_llm(system: str, user: str) -> str:
    prompt_hash = hashlib.md5((system + "\n" + user).encode('utf-8')).hexdigest()
    
    cached = llm_cache_col.find_one({'prompt_hash': prompt_hash})
    if cached:
        return cached['response']
        
    provider = os.environ.get('LLM_PROVIDER', 'claude').lower()
    try:
        if provider == 'gemini':
            response_text = call_gemini(system, user)
        else:
            response_text = call_claude(system, user)
    except Exception as e:
        if '429' in str(e) or 'quota' in str(e).lower() or getattr(e, 'code', None) == 429:
            raise RateLimitError(str(e))
        raise e
        
    llm_cache_col.insert_one({
        'prompt_hash': prompt_hash,
        'system': system,
        'user': user,
        'response': response_text,
        'created_at': datetime.utcnow()
    })
    
    return response_text

def _parse_json(text: str) -> dict:
    # Clean markdown block if present
    text = text.strip()
    if text.startswith('```json'):
        text = text[7:]
    elif text.startswith('```'):
        text = text[3:]
    if text.endswith('```'):
        text = text[:-3]
    return json.loads(text.strip())

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
        print(f"Error in find_similar_goal: {e}")
        return None

def identify_skills(goal: str) -> dict:
    system = """You are a skill decomposition expert for Scholarium. 
    Break down the goal into a logical sequence of skills. 
    For each skill, identify its prerequisites and estimate the time required to master it.
    Return ONLY valid JSON."""
    
    user = f"""Goal: {goal}
    Return JSON: {{
        "skills": [
            {{
                "id": "unique_id_string", 
                "name": "Skill Name", 
                "description": "Short description", 
                "prerequisites": ["prereq_id_1"],
                "estimated_hours": 5
            }}
        ]
    }}"""
    try:
        resp = call_llm(system, user)
        return _parse_json(resp)
    except Exception as e:
        print(f"Error parsing identify_skills: {e}")
        raise ValueError("Failed to parse JSON")

def generate_graph_layout(skills: list) -> dict:
    system = "You are a graph layout expert. Return ONLY valid JSON."
    user = f"Skills: {json.dumps(skills)}\nReturn JSON with nodes and edges for a DAG.\nEach node: {{\"id\": \"id\", \"label\": \"name\", \"position\": {{\"x\": 0, \"y\": 0}}, \"data\": {{\"description\": \"desc\"}}}}.\nEach edge: {{\"id\": \"e1-2\", \"source\": \"id1\", \"target\": \"id2\"}}.\nFormat: {{\"nodes\": [], \"edges\": []}}"
    try:
        resp = call_llm(system, user)
        return _parse_json(resp)
    except Exception as e:
        print(f"Error parsing generate_graph_layout: {e}")
        raise ValueError("Failed to parse JSON")

def expand_subtopics(skill_name: str) -> dict:
    system = """You are an expert Curriculum Architect. Your goal is to break down a complex skill into exactly 6-8 logically sequenced, UNIQUE subtopics.
    
    RULES:
    1. NO DUPLICATES: Every subtopic must have a unique title and distinct focus.
    2. LOGICAL FLOW: Order them from foundational to advanced.
    3. PRECISION: Use exact technical terms.
    4. VARIETY: Cover different facets of the skill (Theory, Application, Tools).
    
    Return ONLY valid JSON."""
    user = f"Skill: {skill_name}\nReturn JSON: {{\"subtopics\": [{{ \"title\": \"Subtopic Name\", \"description\": \"Detailed focus\", \"duration_mins\": 30 }}]}}"
    try:
        resp = call_llm(system, user)
        return _parse_json(resp)
    except RateLimitError as e:
        print(f"Rate limit hit in expand_subtopics: {e}")
        raise e
    except Exception as e:
        print(f"Error parsing expand_subtopics: {e}")
        raise ValueError("Failed to parse JSON")

def generate_practice(skill: str, difficulty: str, context: list = None) -> dict:
    system = """You are a friendly and encouraging tutor for Scholarium. 
    Your goal is to rigorously assess the learner's deep understanding with challenging, high-quality questions.
    
    Rules for question generation:
    1. HIGH DIFFICULTY: Focus on nuances, edge cases, and deep conceptual understanding. Avoid trivial questions.
    2. BE PRECISE: Use technical terminology correctly.
    3. NO OBVIOUS ANSWERS: Distractors should be plausible and require careful thought.
    4. VARIETY: Ensure questions cover different aspects of the subtopic.
    
    Return ONLY valid JSON."""
    
    context_str = json.dumps(context) if context else "No additional context."
    user = f"""Topic: {skill}
    Difficulty: advanced
    Context: {context_str}
    
    Generate 5 challenging multiple-choice questions.
    Return JSON format: 
    {
        "questions": [
            {
                "prompt": "Rigorous, technical question...", 
                "options": ["Nuanced A", "Nuanced B", "Nuanced C", "Nuanced D"], 
                "correct_option": 0
            }
        ]
    }"""
    try:
        resp = call_llm(system, user)
        return _parse_json(resp)
    except Exception as e:
        print(f"Error parsing generate_practice: {e}")
        raise ValueError("Failed to parse JSON")

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
        resp = call_llm(system, user)
        evaluations_col.insert_one({
            'session_id': session_id,
            'skill': skill,
            'question': question,
            'user_answer': answer,
            'llm_raw_response': resp
        })
        return _parse_json(resp)
    except Exception as e:
        print(f"Error parsing evaluate_answer: {e}")
        raise ValueError("Failed to parse JSON")

def generate_summary(user_id: int, checkpoints: list) -> str:
    system = "You are a career coach writing a Scholarium learner report."
    user = f"User checkpoints: {json.dumps(checkpoints)}. Write a 3-sentence capability summary."
    try:
        return call_llm(system, user)
    except Exception as e:
        print(f"Error generating summary: {e}")
        return "Failed to generate summary."

def get_subtopic_explanation(skill_name: str, subtopic_title: str, context_subtopics: list = None) -> str:
    system = """You are a world-class technical educator for Scholarium. 
    Your goal is to write a highly relevant, accurate, and deep explanation for a specific subtopic.
    
    STRICT RULES:
    1. RELEVANCE: Only talk about the specific subtopic. Do NOT drift into advanced topics or unrelated frameworks unless they are absolutely necessary for the core concept.
    2. CONTEXT BOUNDARIES: You are given a list of other subtopics in this skill. DO NOT explain those other topics; stay within your specific boundary.
    3. NO HALLUCINATIONS: If the skill is 'Java' and subtopic is 'Intro', do not talk about 'Spring' or 'Hibernate'.
    4. FORMATTING: Use clean Markdown, bold headers, and high-quality code examples.
    5. STRUCTURE: Start with a high-level overview, followed by core details, and end with a practical example."""
    
    context_str = ", ".join(context_subtopics) if context_subtopics else "No other topics provided."
    user = f"""Skill: {skill_name}
    Specific Subtopic to explain: {subtopic_title}
    
    Context (Other subtopics in this skill - DO NOT EXPLAIN THESE): {context_str}
    
    Write a comprehensive, professional explanation for '{subtopic_title}' only."""
    
    try:
        return call_llm(system, user)
    except Exception as e:
        print(f"Error generating explanation: {e}")
        return "Failed to generate explanation. Please try again."
