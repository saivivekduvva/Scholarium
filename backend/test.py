import os
import sys

# Add django setup if needed
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scholarium_project.settings')
django.setup()

from agent.agent_engine import expand_subtopics

try:
    print(expand_subtopics("Machine Learning"))
except Exception as e:
    print(f"Exception caught: {e}")
