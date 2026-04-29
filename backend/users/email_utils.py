import secrets
from datetime import timedelta
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from .models import EmailVerificationToken

def generate_verification_token(user):
    # Expire old tokens if any
    EmailVerificationToken.objects.filter(user=user).delete()
    
    token = secrets.token_urlsafe(32)
    expires_at = timezone.now() + timedelta(hours=24)
    
    return EmailVerificationToken.objects.create(
        user=user,
        token=token,
        expires_at=expires_at
    )

def send_verification_email(user):
    token_obj = generate_verification_token(user)
    
    # Construct verification link
    # In production, use the actual domain from settings or request
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    verification_link = f"{frontend_url}/verify-email/{token_obj.token}"
    
    subject = "Scholarium — Verify your email address"
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Scholarium <noreply@scholarium.com>')
    to_email = [user.email]
    
    # Render templates
    context = {
        'username': user.username,
        'VERIFICATION_LINK': verification_link
    }
    
    text_content = render_to_string('emails/verification_email.txt', context)
    html_content = render_to_string('emails/verification_email.html', context)
    
    email = EmailMultiAlternatives(subject, text_content, from_email, to_email)
    email.attach_alternative(html_content, "text/html")
    
    try:
        email.send()
        return True
    except Exception as e:
        print(f"FAILED to send email: {str(e)}")
        return False
