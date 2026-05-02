from rest_framework import serializers
from .models import Goal, SkillNode, Session, Checkpoint, Subtopic, QuizSession, QuizAnalytics

class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = '__all__'

class SkillNodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillNode
        fields = '__all__'

class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = '__all__'


class CheckpointSerializer(serializers.ModelSerializer):
    class Meta:
        model = Checkpoint
        fields = '__all__'

class SubtopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtopic
        fields = '__all__'


class QuizSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizSession
        fields = '__all__'

class QuizAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAnalytics
        fields = '__all__'
