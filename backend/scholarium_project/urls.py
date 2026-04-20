from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def home(request):
    return HttpResponse("Scholarium Backend is Running 🚀")

urlpatterns = [
    path('', home),  # 👈 this fixes your 404
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/', include('agent.urls')),
]