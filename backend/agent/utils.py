import json
import logging
from datetime import datetime
from .mongo_client import mongo_brain

def log_conversation(session_id, role, content):
    """Log a conversation message to MongoDB."""
    mongo_brain.conversations.update_one(
        {'session_id': session_id},
        {
            '$push': {'messages': {'role': role, 'content': content}}, 
            '$setOnInsert': {'created_at': datetime.utcnow()}
        },
        upsert=True
    )

def parse_json_response(text: str) -> dict:
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
        logging.error(f"FAILED TO PARSE JSON. RAW TEXT:\n{text}\n")
        raise e
