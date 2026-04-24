import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scholarium_project.settings')
django.setup()

from django.db import connection
from agent.models import Subtopic

def check():
    with connection.cursor() as cursor:
        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'agent_subtopic'")
        columns = [row[0] for row in cursor.fetchall()]
        print(f"Columns in agent_subtopic: {columns}")
        
        if 'explanation' in columns:
            print("SUCCESS: 'explanation' column exists.")
        else:
            print("ERROR: 'explanation' column MISSING!")

if __name__ == "__main__":
    try:
        check()
    except Exception as e:
        print(f"DB Error: {e}")
