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
anthropic_client = anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY', 'dummy'))
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

def identify_skills(goal: str) -> dict:
    system = "You are a skill decomposition expert for Scholarium. Return ONLY valid JSON."
    user = f"Goal: {goal}\nReturn JSON: {{\"skills\": [{{\"id\": \"unique_id_string\", \"name\": \"name\", \"description\": \"desc\", \"prerequisites\": [\"id1\"]}}]}}"
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
    system = "You are a curriculum designer for Scholarium. Return ONLY valid JSON."
    user = f"Skill: {skill_name}\nReturn JSON: {{\"subtopics\": [{{\"title\": \"t\", \"description\": \"d\", \"duration_mins\": 30}}]}}"
    try:
        resp = call_llm(system, user)
        return _parse_json(resp)
    except RateLimitError as e:
        print(f"Rate limit hit in expand_subtopics: {e}")
        raise e
    except Exception as e:
        print(f"Error parsing expand_subtopics: {e}")
        raise ValueError("Failed to parse JSON")

def generate_practice(skill: str, difficulty: str) -> dict:
    system = "You are an expert tutor and examiner. Generate high-quality, thought-provoking questions that test deep understanding and application of concepts, not just rote memorization. Provide scenario-based questions where possible. Return ONLY valid JSON."
    user = f"Skill: {skill}, difficulty: {difficulty}\nGenerate complex scenario-based questions.\nReturn JSON: {{\"questions\": [{{\"id\": \"q1\", \"prompt\": \"scenario or question text\", \"type\": \"mcq\"|\"short\", \"options\": [\"A\", \"B\"], \"correct\": \"A\"}}]}}"
    try:
        resp = call_llm(system, user)
        return _parse_json(resp)
    except Exception as e:
        print(f"Error parsing generate_practice: {e}")
        raise ValueError("Failed to parse JSON")

def evaluate_answer(session_id: int, skill: str, question: str, answer: str) -> dict:
    system = "You are a strict but fair evaluator. Return ONLY valid JSON."
    user = f"Skill: {skill}\nQuestion: {question}\nAnswer: {answer}\nReturn JSON: {{\"score\": 0, \"verdict\": \"pass\"|\"fail\", \"strengths\": [\"\"], \"gaps\": [\"\"], \"next_step\": \"\"}}"
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
