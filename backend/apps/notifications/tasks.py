from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


@shared_task
def send_notification_email_task(notification_id):
    """Send email for a notification asynchronously"""
    try:
        from apps.notifications.models import Notification
        notification = Notification.objects.get(id=notification_id)
        
        subject = f'PST Notification: {notification.get_notification_type_display()}'
        message = notification.message
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[notification.recipient.email],
            fail_silently=False,
        )
        
        logger.info(f'Email sent for notification {notification_id}')
    except Exception as e:
        logger.error(f'Error sending notification email: {str(e)}')