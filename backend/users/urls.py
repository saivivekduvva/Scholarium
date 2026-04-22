from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, ProfileView

from django.http import HttpResponse
from django.core.management import call_command
import io

def migrate_db(request):
    output = io.StringIO()
    try:
        call_command('migrate', interactive=False, stdout=output)
        return HttpResponse(f"Migration Successful!<br><pre>{output.getvalue()}</pre>")
    except Exception as e:
        return HttpResponse(f"Migration Failed!<br><pre>{str(e)}</pre>", status=500)

urlpatterns = [
    path('migrate-db-emergency/', migrate_db),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('profile/', ProfileView.as_view(), name='user_profile'),
]
