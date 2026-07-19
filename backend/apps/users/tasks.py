from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_otp_email(self, email, otp_code):
    try:
        send_mail(
            subject='Verify your PST account — JOOUST',
            message=f'Your verification code is: {otp_code}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as exc:
        # Do not re-raise: email delivery must never break registration/login.
        logger.error(f'OTP email failed for {email}: {exc}')
