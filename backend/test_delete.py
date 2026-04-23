import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scholarium_project.settings')
django.setup()

from users.models import User
from agent.models import Goal, SkillNode, LearningPath

try:
    user = User.objects.create_user(username='testdeletemsg', email='test@test.com', password='test')
    print("User created")
    goal = Goal.objects.create(user=user, title='Test Goal')
    print("Goal created")
    node = SkillNode.objects.create(goal=goal, skill_name='Test Skill')
    print("Node created")
    path = LearningPath.objects.create(goal=goal, ordered_skill_ids=[node.id])
    print("Path created")
    
    print("Attempting to delete user...")
    user.delete()
    print("User successfully deleted!")
except Exception as e:
    import traceback
    print("ERROR:", e)
    traceback.print_exc()
