import os
import json
import requests
import google.generativeai as genai
from dotenv import load_dotenv
from datetime import datetime
import hashlib
from .mongo_client import mongo_brain

class RateLimitError(Exception):
    pass

load_dotenv()

# Setup Providers
try:
    import anthropic
    anthropic_client = anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY', 'dummy'))
except (ImportError, Exception):
    anthropic_client = None
genai.configure(api_key=os.environ.get('GEMINI_API_KEY', 'dummy'))
gemini_model = genai.GenerativeModel('gemini-flash-lite-latest')

# Debug Log for Environment Keys
gemini_key = os.environ.get('GEMINI_API_KEY')
if gemini_key:
    print(f"DEBUG: GEMINI_API_KEY is loaded. Starts with: {gemini_key[:5]}...")
else:
    print("DEBUG: CRITICAL ERROR - GEMINI_API_KEY is NOT loaded in environment!")

def log_conversation(session_id, role, content):
    mongo_brain.conversations.update_one(
        {'session_id': session_id},
        {'$push': {'messages': {'role': role, 'content': content}}, '$setOnInsert': {'created_at': datetime.utcnow()}},
        upsert=True
    )

def call_claude(system: str, user: str) -> str:
    msg = anthropic_client.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=2048,
        system=system,
        messages=[{"role": "user", "content": user}]
    )
    return msg.content[0].text

def call_gemini(system: str, user: str, json_mode: bool = False) -> str:
    # Adding a small retry loop for robustness
    import time
    for attempt in range(3):
        try:
            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
            
            gen_config = {}
            if json_mode:
                gen_config["response_mime_type"] = "application/json"
            
            response = gemini_model.generate_content(
                f"{system}\n\n{user}",
                safety_settings=safety_settings,
                generation_config=gen_config
            )
            
            # Check if response was blocked
            if not response.parts:
                # If blocked, log it and retry or fail
                print(f"Gemini BLOCKED response for prompt. Safety info: {response.candidates[0].safety_ratings if response.candidates else 'No candidates'}")
                raise ValueError("AI_SAFETY_BLOCK")
                
            return response.text
        except Exception as e:
            err_msg = str(e).lower()
            if "429" in err_msg or "quota" in err_msg or "rate limit" in err_msg:
                print(f"RATE LIMIT DETECTED: {e}")
                raise RateLimitError("AI Quota Exhausted (429)")
            
            if attempt == 2: 
                print(f"Gemini call failed after 3 attempts. Raw Error: {e}")
                raise e
            time.sleep(1.5 ** attempt)

def call_llm(system: str, user: str, json_mode: bool = False) -> str:
    prompt_hash = hashlib.md5((system + "\n" + user).encode('utf-8')).hexdigest()
    
    cached = mongo_brain.llm_cache.find_one({'prompt_hash': prompt_hash})
    if cached:
        return cached['response']
        
    provider = os.environ.get('LLM_PROVIDER', 'gemini').lower()
    try:
        if provider == 'claude' and anthropic_client:
            response_text = call_claude(system, user)
        else:
            response_text = call_gemini(system, user, json_mode=json_mode)
        
        # Cache successful responses
        mongo_brain.llm_cache.insert_one({
            'prompt_hash': prompt_hash,
            'system': system,
            'user': user,
            'response': response_text,
            'created_at': datetime.utcnow()
        })
        return response_text
    except Exception as e:
        # Emergency Fallback
        if provider == 'claude':
            print(f"Claude failed ({str(e)}), falling back to Gemini...")
            response_text = call_gemini(system, user, json_mode=json_mode)
        elif provider == 'gemini' and anthropic_client:
            print(f"Gemini failed ({str(e)}), falling back to Claude...")
            try:
                response_text = call_claude(system, user)
            except:
                raise e
        else:
            err_msg = str(e).lower()
            if '429' in err_msg or 'quota' in err_msg or 'rate limit' in err_msg:
                raise RateLimitError(f"AI Quota Exhausted: {e}")
            raise e
            raise e
        
    mongo_brain.llm_cache.insert_one({
        'prompt_hash': prompt_hash,
        'system': system,
        'user': user,
        'response': response_text,
        'created_at': datetime.utcnow()
    })
    
    return response_text

def _parse_json(text: str) -> dict:
    """Robustly parse JSON from LLM response, handling markdown blocks and conversational filler."""
    text = text.strip()
    
    # Try to find the first '{' and last '}'
    start_index = text.find('{')
    end_index = text.rfind('}')
    
    if start_index != -1 and end_index != -1 and end_index > start_index:
        json_str = text[start_index:end_index+1]
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            # If substring fails, maybe it was a fragmented JSON or had internal backticks
            pass

    # Fallback to existing cleaning logic if indices didn't work or parse failed
    if text.startswith('```json'):
        text = text[7:]
    elif text.startswith('```'):
        text = text[3:]
    if text.endswith('```'):
        text = text[:-3]
    
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError as e:
        print(f"FAILED TO PARSE JSON. RAW TEXT:\n{text}\n")
        raise e

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

def generate_roadmap(goal: str) -> dict:
    system = """You are a curriculum and graph layout expert for Scholarium. 
    Break down the goal into a logical sequence of skills (DAG).
    Return a JSON object containing both the list of skills and the visual graph layout (React Flow format).
    
    Nodes must have: id, type: 'skillNode', data: { label: 'name', description: 'desc' }, position {x, y}.
    Edges must have: id, source, target.
    
    Arrange the nodes logically from left to right (foundational to advanced).
    
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
        
        # If it's a parse error or safety block, purge cache and try one more time without cache
        prompt_hash = hashlib.md5((system + "\n" + user).encode('utf-8')).hexdigest()
        mongo_brain.llm_cache.delete_one({'prompt_hash': prompt_hash})
        
        print(f"Error in generate_roadmap: {e}. Purged cache. Retrying once...")
        try:
            resp = call_llm(system + " (CRITICAL: ONLY JSON, NO TEXT)", user, json_mode=True)
            return _parse_json(resp)
        except Exception as e2:
            print(f"Final failure in generate_roadmap for goal '{goal}': {e2}")
            raise ValueError(f"AI Generation Error: {str(e2)}")

def expand_subtopics(skill_name: str) -> dict:
    system = """You are an expert Curriculum Architect. Your goal is to break down a complex skill into exactly 5-7 logically sequenced, UNIQUE subtopics.
    
    RULES:
    1. NO DUPLICATES: Every subtopic must have a unique title.
    2. LOGICAL FLOW: Order from foundational to advanced.
    3. DESCRIPTION: Provide a brief summary (20-30 words) for each subtopic.
    4. LIMIT: Generate exactly 5-7 subtopics per skill.
    
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
            
        # Purge cache and retry once for parsing/model errors
        prompt_hash = hashlib.md5((system + "\n" + user).encode('utf-8')).hexdigest()
        mongo_brain.llm_cache.delete_one({'prompt_hash': prompt_hash})
        print(f"Error in expand_subtopics: {e}. Purged cache. Retrying...")
        
        try:
            resp = call_llm(system + " (CRITICAL: ONLY JSON, NO TEXT)", user, json_mode=True)
            return _parse_json(resp)
        except Exception as e2:
            print(f"Final failure in expand_subtopics for {skill_name}: {e2}")
            raise ValueError(f"Curriculum Generation Error: {str(e2)}")

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
    import time
    salt = time.time()
    user = f"""Topic: {skill}
    Difficulty: advanced
    Context: {context_str}
    Salt: {salt} (Generate completely unique and fresh questions)
    
    Generate exactly 4 challenging, random, and highly-varied multiple-choice questions.
    Return JSON format: 
    {{
        "questions": [
            {{
                "prompt": "Rigorous, technical question...", 
                "options": ["Nuanced A", "Nuanced B", "Nuanced C", "Nuanced D"], 
                "correct_option": 0
            }}
        ]
    }}"""
    try:
        resp = call_llm(system, user, json_mode=True)
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
        print(f"Error generating explanation: {e}")
        return "Failed to generate explanation. Please try again."
