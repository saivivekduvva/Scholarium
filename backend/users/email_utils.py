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
    try:
        token_obj = generate_verification_token(user)
        
        # Construct verification link
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        verification_link = f"{frontend_url}/verify-email/{token_obj.token}"
        
        # Check if API key is configured
        api_key = getattr(settings, 'EMAIL_HOST_PASSWORD', '')
        is_debug = getattr(settings, 'DEBUG', False)

        if not api_key:
            if is_debug:
                print("\n" + "="*60)
                print("DEBUG MODE: RESEND_API_KEY is not set.")
                print(f"Verification link for {user.email}:")
                print(verification_link)
                print("="*60 + "\n")
                # We still try to send it, but Django might fail if SMTP is not working.
                # However, if we want to ensure it "works" in console, we can override backend temporarily.
                from django.core import mail
                connection = mail.get_connection(backend='django.core.mail.backends.console.EmailBackend')
            else:
                print("WARNING: RESEND_API_KEY is not set in production. Email will not be sent.")
                return False
        else:
            connection = None # Use default

        subject = "Scholarium — Verify your email address"
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Scholarium <onboarding@resend.dev>')
        to_email = [user.email]
        
        # Render templates
        context = {
            'username': user.username,
            'VERIFICATION_LINK': verification_link
        }
        
        text_content = render_to_string('emails/verification_email.txt', context)
        html_content = render_to_string('emails/verification_email.html', context)
        
        email = EmailMultiAlternatives(
            subject, 
            text_content, 
            from_email, 
            to_email,
            connection=connection
        )
        email.attach_alternative(html_content, "text/html")
        
        email.send()
        return True
    except Exception as e:
        import traceback
        print(f"FAILED to send email: {str(e)}")
        print(traceback.format_exc())
        return False

