from django.urls import path
from . import views

urlpatterns = [
    path('goals/', views.create_goal, name='create_goal'),
    path('goals/<int:id>/graph/', views.get_graph, name='get_graph'),
    path('skills/<int:id>/expand/', views.expand_skill, name='expand_skill'),
    path('subtopics/<int:id>/toggle/', views.toggle_subtopic, name='toggle_subtopic'),
    path('goals/<int:id>/path/', views.save_path, name='save_path'),
    path('subtopics/explanation/', views.get_explanation, name='get_explanation'),
    path('sessions/start/', views.start_session, name='start_session'),
    path('sessions/<int:id>/evaluate/', views.evaluate_session_answer, name='evaluate_session_answer'),
    path('progress/<int:user_id>/', views.get_progress, name='get_progress'),
    path('goals/<int:id>/summary/', views.get_summary, name='get_summary'),
    path('leaderboard/', views.get_leaderboard, name='leaderboard'),
]
