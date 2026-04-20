from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/scholarium_logs')
client = MongoClient(MONGO_URI)
db = client['scholarium_logs']

conversations_col = db['ai_conversations']
graphs_col = db['skill_graphs']
evaluations_col = db['raw_evaluations']
llm_cache_col = db['llm_cache']
