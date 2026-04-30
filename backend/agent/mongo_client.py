from pymongo import MongoClient
import os
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

def get_mongo_client():
    uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/scholarium_logs')
    
    # If the URI looks like a standard mongodb+srv string, ensure password is encoded
    if "://" in uri and "@" in uri:
        try:
            # Basic split to isolate the user:pass part
            prefix, rest = uri.split("://", 1)
            user_pass_part, host_part = rest.rsplit("@", 1)
            
            if ":" in user_pass_part:
                user, password = user_pass_part.split(":", 1)
                # Only encode if it's not already encoded (doesn't contain %)
                if "%" not in password:
                    encoded_password = urllib.parse.quote_plus(password)
                    uri = f"{prefix}://{user}:{encoded_password}@{host_part}"
        except Exception:
            pass # Fallback to original URI if parsing fails
            
    return MongoClient(uri)

class MongoBrain:
    _instance = None

    @classmethod
    def get_db(cls):
        if cls._instance is None:
            cls._instance = get_mongo_client()
        return cls._instance['scholarium_logs']

    @property
    def conversations(self):
        return self.get_db()['ai_conversations']

    @property
    def graphs(self):
        return self.get_db()['skill_graphs']

    @property
    def evaluations(self):
        return self.get_db()['raw_evaluations']

    @property
    def llm_cache(self):
        return self.get_db()['llm_cache']

mongo_brain = MongoBrain()


