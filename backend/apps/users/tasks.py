from celery import shared_task
from django.conf import settings
from django.core.mail import get_connection, EmailMessage
import logging
import socket

logger = logging.getLogger(__name__)

SUBJECTS = {
    'registration': 'Verify your PST account — JOOUST',
    'password_reset': 'Reset your PST password — JOOUST',
}

BODIES = {
    'registration': 'Your verification code is: {code}',
    'password_reset': 'Your password reset code is: {code}. If you did not request this, please ignore this email.',
}


@shared_task(bind=True, max_retries=3)
def send_otp_email(self, email, otp_code, purpose='registration'):
    # Skip entirely if SMTP is not configured (free-tier / no email creds).
    if not settings.EMAIL_HOST_USER:
        logger.info('OTP email skipped for %s (%s, EMAIL_HOST_USER not configured)', email, purpose)
        return

    try:
        connection = get_connection(timeout=5)
        EmailMessage(
            subject=SUBJECTS.get(purpose, SUBJECTS['registration']),
            body=BODIES.get(purpose, BODIES['registration']).format(code=otp_code),
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
            connection=connection,
        ).send(fail_silently=False)
    except (Exception, socket.timeout) as exc:
        # Do not re-raise: email delivery must never break registration/login.
        logger.error(f'OTP email failed for {email} ({purpose}): {exc}')
