from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


@shared_task
def send_otp_email(email, code):
    send_mail(
        subject='Verify your PST account — JOOUST',
        message=f'Your verification code is: {code}',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )
