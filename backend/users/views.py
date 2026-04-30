from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer

User = get_user_model()

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers_jwt import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
from .serializers import RegisterSerializer, UserSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class ProfileView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class SetupAdminView(APIView):
    permission_classes = (AllowAny,)
    
    def get(self, request):
        token = request.query_params.get('token')
        if token != 'supersecret':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
            
        # Run migrations automatically
        from django.core.management import call_command
        try:
            call_command('migrate', interactive=False)
            migration_status = "Migrations successful. "
        except Exception as e:
            migration_status = f"Migration failed: {str(e)}. "

        User = get_user_model()
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
            return Response({'status': f'{migration_status}Admin created: username=admin, password=admin123'})
        return Response({'status': f'{migration_status}Admin already exists'})

class VerifyEmailView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        from .models import EmailVerificationToken
        try:
            token_obj = EmailVerificationToken.objects.get(token=token)
            
            if not token_obj.is_valid():
                return Response({'error': 'Token has expired'}, status=status.HTTP_400_BAD_REQUEST)
            
            user = token_obj.user
            user.is_email_verified = True
            user.save()
            
            # Delete token to prevent reuse
            token_obj.delete()
            
            return Response({'status': 'Email verified successfully'})
            
        except EmailVerificationToken.DoesNotExist:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

class ResendVerificationView(APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        username = request.data.get('username')
        if not username:
            return Response({'error': 'Username is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(username=username)
            if user.is_email_verified:
                return Response({'error': 'Email is already verified'}, status=status.HTTP_400_BAD_REQUEST)
            
            from .email_utils import send_verification_email
            import threading
            thread = threading.Thread(target=send_verification_email, args=(user,))
            thread.daemon = True
            thread.start()
            
            return Response({'status': 'Verification email sent successfully'})
            
        except User.DoesNotExist:
            # We return success even if user doesn't exist for security reasons (email enumeration)
            # but in this case, since it's username based and we are friendly, maybe just return error?
            # Actually, let's just return success to be consistent.
            return Response({'status': 'If an account exists, a verification email has been sent.'})

class DeleteAccountView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def delete(self, request):
        try:
            user = request.user
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            import traceback
            print(f"ERROR deleting account: {str(e)}")
            print(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
