from django.urls import path
from . import views

urlpatterns = [
    path('goals/', views.create_goal),
    path('goals/<int:id>/', views.delete_goal),
    path('goals/<int:id>/graph/', views.get_graph),
    path('goals/<int:id>/save-path/', views.save_path),
    path('session/start/', views.start_session),
    path('session/evaluate/<int:id>/', views.evaluate_session_answer),
    path('progress/<int:user_id>/', views.get_progress),
    path('summary/<int:id>/', views.get_summary),
    path('subtopics/explanation/', views.get_explanation),
    path('subtopic/complete/', views.mark_subtopic_mastered),
    path('skills/<int:id>/expand/', views.expand_skill),
    path('subtopics/<int:id>/toggle/', views.toggle_subtopic),
]
