from django.contrib import admin
from .models import Goal, SkillNode, LearningPath, Session, Checkpoint, Subtopic

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'status', 'created_at')
    list_filter = ('status', 'user')
    search_fields = ('title', 'description')

@admin.register(SkillNode)
class SkillNodeAdmin(admin.ModelAdmin):
    list_display = ('skill_name', 'goal', 'status', 'estimated_hours')
    list_filter = ('status', 'goal')
    search_fields = ('skill_name', 'description')

@admin.register(LearningPath)
class LearningPathAdmin(admin.ModelAdmin):
    list_display = ('goal', 'created_at')

@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'skill_node', 'score', 'status', 'created_at')
    list_filter = ('status', 'user')

@admin.register(Checkpoint)
class CheckpointAdmin(admin.ModelAdmin):
    list_display = ('user', 'skill_name', 'proficiency', 'last_assessed')
    list_filter = ('user',)
    search_fields = ('skill_name',)

@admin.register(Subtopic)
class SubtopicAdmin(admin.ModelAdmin):
    list_display = ('title', 'skill_node', 'is_studied', 'duration_mins')
    list_filter = ('is_studied', 'skill_node')
    search_fields = ('title', 'description')
