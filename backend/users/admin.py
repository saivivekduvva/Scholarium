from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Removing 'name' from list_display temporarily to see if it fixes the 500 error on the User list view.
    # If the 500 error goes away, it means the 'name' column is missing in the production database.
    list_display = ('username', 'email', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('name', 'email', 'avatar_url')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Extra Fields', {'fields': ('name', 'avatar_url')}),
    )
