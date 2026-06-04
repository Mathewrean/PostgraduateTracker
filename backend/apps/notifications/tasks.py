import logging

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_notification_email(self, email, subject, message):
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as exc:
        logger.error(f'Notification email failed for {email}: {exc}')
        raise self.retry(exc=exc, countdown=30)


def dispatch_notification_email(email, subject, message):
    try:
        send_notification_email.delay(email, subject, message)
    except Exception:
        logger.warning('Celery unavailable. Sending email synchronously.')
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
