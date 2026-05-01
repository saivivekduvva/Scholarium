import os
import hashlib
import time
import logging
from datetime import datetime
from dotenv import load_dotenv
import google.generativeai as genai
from .mongo_client import mongo_brain

load_dotenv()

class RateLimitError(Exception):
    """Custom exception for LLM rate limits."""
    pass

# Setup Providers
try:
    import anthropic
    anthropic_client = anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY', 'dummy'))
except (ImportError, Exception):
    anthropic_client = None

# Configure Gemini
genai.configure(api_key=os.environ.get('GEMINI_API_KEY', 'dummy'))
gemini_model = genai.GenerativeModel('gemini-3-flash-preview')

def call_claude(system: str, user: str) -> str:
    """Make a call to the Anthropic Claude model."""
    if not anthropic_client:
        raise ValueError("Anthropic client is not configured.")
        
    msg = anthropic_client.messages.create(
        model="claude-3-sonnet-20240229",
        max_tokens=2048,
        system=system,
        messages=[{"role": "user", "content": user}]
    )
    return msg.content[0].text

def call_gemini(system: str, user: str, json_mode: bool = False) -> str:
    """Make a call to the Google Gemini model with retries."""
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
            
            if not response.parts:
                logging.warning(f"Gemini BLOCKED response. Safety info: {response.candidates[0].safety_ratings if response.candidates else 'No candidates'}")
                raise ValueError("AI_SAFETY_BLOCK")
                
            return response.text
        except Exception as e:
            err_msg = str(e).lower()
            if any(key in err_msg for key in ["429", "quota", "rate limit"]):
                logging.error(f"RATE LIMIT DETECTED: {e}")
                raise RateLimitError("AI Quota Exhausted (429)")
            
            if attempt == 2: 
                logging.error(f"Gemini call failed after 3 attempts. Raw Error: {e}")
                raise e
            time.sleep(1.5 ** attempt)

def call_llm(system: str, user: str, json_mode: bool = False) -> str:
    """
    Primary interface for LLM calls. Handles caching, provider selection, and fallbacks.
    """
    prompt_hash = hashlib.md5((system + "\n" + user).encode('utf-8')).hexdigest()
    
    # Check Cache
    cached = mongo_brain.llm_cache.find_one({'prompt_hash': prompt_hash})
    if cached:
        return cached['response']
        
    provider = os.environ.get('LLM_PROVIDER', 'gemini').lower()
    response_text = None
    
    try:
        if provider == 'claude' and anthropic_client:
            response_text = call_claude(system, user)
        else:
            response_text = call_gemini(system, user, json_mode=json_mode)
            
    except Exception as e:
        # Emergency Fallback
        if provider == 'claude':
            logging.warning(f"Claude failed, falling back to Gemini: {e}")
            response_text = call_gemini(system, user, json_mode=json_mode)
        elif provider == 'gemini' and anthropic_client:
            logging.warning(f"Gemini failed, falling back to Claude: {e}")
            try:
                response_text = call_claude(system, user)
            except:
                raise e
        else:
            err_msg = str(e).lower()
            if any(key in err_msg for key in ["429", "quota", "rate limit"]):
                raise RateLimitError(f"AI Quota Exhausted: {e}")
            raise e

    # Cache successful responses
    if response_text:
        mongo_brain.llm_cache.update_one(
            {'prompt_hash': prompt_hash},
            {
                '$set': {
                    'system': system,
                    'user': user,
                    'response': response_text,
                    'created_at': datetime.utcnow()
                }
            },
            upsert=True
        )
    
    return response_text
