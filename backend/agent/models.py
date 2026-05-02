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


class QuizSession(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy_medium', 'Easy to Medium'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_sessions')
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='quiz_sessions')
    completed_subtopics_snapshot = models.JSONField(default=list)
    question_count = models.IntegerField(default=7)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='easy_medium')
    correct_count = models.IntegerField(default=0)
    wrong_count = models.IntegerField(default=0)
    accuracy = models.FloatField(default=0.0)
    result_summary = models.TextField(blank=True)
    
    # Gap Analysis fields
    weak_concepts = models.JSONField(default=list)
    revision_priority = models.JSONField(default=list)
    gap_summary = models.TextField(blank=True)
    
    # Store the actual questions generated for this session
    questions_json = models.JSONField(default=list)
    user_answers = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)

class QuizAnalytics(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_analytics')
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='quiz_analytics')
    
    last_quizzes = models.JSONField(default=list) # List of latest quiz stats
    accuracy_over_time = models.JSONField(default=list) # List of {date, accuracy}
    subtopic_coverage = models.JSONField(default=dict) # subtopic title -> {correct: X, wrong: Y}
    recommendation_insight = models.TextField(blank=True)
    
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'goal')
