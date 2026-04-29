import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scholarium_project.settings')
django.setup()

from agent.models import Goal, SkillNode

def debug_skills():
    print("--- GOALS ---")
    for g in Goal.objects.all():
        print(f"Goal ID: {g.id}, Title: {g.title}, User: {g.user}")
        
    print("\n--- SKILL NODES ---")
    for s in SkillNode.objects.all():
        print(f"ID: {s.id}, Goal ID: {s.goal_id}, Name: {s.skill_name}")

if __name__ == "__main__":
    debug_skills()
