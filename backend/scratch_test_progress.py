import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'scholarium_project.settings')
django.setup()

from agent.views import get_progress
from django.test import RequestFactory
from users.models import User

# Create a user
user, created = User.objects.get_or_create(username='testuser')

# Mock request
factory = RequestFactory()
request = factory.get('/api/progress/1/')
request.user = user

try:
    response = get_progress(request, user_id=1)
    print(f"Status: {response.status_code}")
    print(f"Data: {response.data}")
except Exception as e:
    import traceback
    print(f"Error: {e}")
    traceback.print_exc()
