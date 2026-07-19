from celery import shared_task
from django.conf import settings
from django.core.mail import get_connection, EmailMessage
import logging
import socket

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_otp_email(self, email, otp_code):
    # Skip entirely if SMTP is not configured (free-tier / no email creds).
    if not settings.EMAIL_HOST_USER:
        logger.info('OTP email skipped for %s (EMAIL_HOST_USER not configured)', email)
        return

    try:
        # Use a short timeout so a blocked/unreachable SMTP server never hangs
        # the request (eager mode runs this inline).
        connection = get_connection(timeout=5)
        EmailMessage(
            subject='Verify your PST account — JOOUST',
            body=f'Your verification code is: {otp_code}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
            connection=connection,
        ).send(fail_silently=False)
    except (Exception, socket.timeout) as exc:
        # Do not re-raise: email delivery must never break registration/login.
        logger.error(f'OTP email failed for {email}: {exc}')
