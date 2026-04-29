from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, ProfileView, DeleteAccountView, SetupAdminView, VerifyEmailView

urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('profile/', ProfileView.as_view(), name='user_profile'),
    path('setup-admin/', SetupAdminView.as_view(), name='setup_admin'),
    path('delete-account/', DeleteAccountView.as_view(), name='delete_account'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),
]
