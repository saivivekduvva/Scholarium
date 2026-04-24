import sys, os
sys.path.append('c:\\Users\\saivi\\Downloads\\Scholarium\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scholarium_project.settings')
import django
django.setup()

from agent.agent_engine import expand_subtopics

try:
    print("Testing expansion for 'Python Basics'...")
    res = expand_subtopics('Python Basics')
    print("SUCCESS!")
    print(res)
except Exception as e:
    print(f"FAILED WITH ERROR: {e}")
