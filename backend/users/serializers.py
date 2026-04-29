import threading
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'name', 'avatar_url', 'is_email_verified')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            name=validated_data.get('name', '')
        )
        
        # Trigger verification email in background
        try:
            from .email_utils import send_verification_email
            thread = threading.Thread(target=send_verification_email, args=(user,))
            thread.daemon = True
            thread.start()
        except Exception as e:
            print(f"Error starting email thread: {str(e)}")
            
        return user
