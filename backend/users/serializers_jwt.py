from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import exceptions

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        if not self.user.is_email_verified:
            raise exceptions.PermissionDenied(
                'Your email address is not verified. Please check your inbox for the verification link.'
            )
            
        return data
