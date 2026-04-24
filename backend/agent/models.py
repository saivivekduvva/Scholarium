from django.db import models
from users.models import User

class Goal(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('completed', 'Completed')
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals', null=True, blank=True) # Allow null for now to simplify initial testing if needed
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)

class SkillNode(models.Model):
    STATUS_CHOICES = [
        ('locked', 'Locked'),
        ('active', 'Active'),
        ('done', 'Done')
    ]
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='nodes')
    skill_name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    x_pos = models.FloatField(default=0.0)
    y_pos = models.FloatField(default=0.0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='locked')
    estimated_hours = models.IntegerField(default=1)

class LearningPath(models.Model):
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='paths')
    ordered_skill_ids = models.JSONField(default=list)
    estimated_hours = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class Session(models.Model):
    STATUS_CHOICES = [
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed')
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions', null=True, blank=True)
    skill_node = models.ForeignKey(SkillNode, on_delete=models.CASCADE, related_name='sessions')
    score = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ongoing')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

class Checkpoint(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='checkpoints', null=True, blank=True)
    skill_name = models.CharField(max_length=255)
    proficiency = models.IntegerField(default=0)
    last_assessed = models.DateTimeField(auto_now=True)

class Subtopic(models.Model):
    skill_node = models.ForeignKey(SkillNode, on_delete=models.CASCADE, related_name='subtopics')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    duration_mins = models.IntegerField(default=30)
    is_studied = models.BooleanField(default=False)
    explanation = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

