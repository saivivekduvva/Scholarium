from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    name = models.CharField(max_length=255, blank=True)
    avatar_url = models.URLField(blank=True, null=True)
    is_email_verified = models.BooleanField(default=True) # Default True to avoid blocking current users
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username
