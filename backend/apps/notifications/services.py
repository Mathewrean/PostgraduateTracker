import logging

from django.conf import settings

from apps.notifications.models import Notification
from apps.notifications.tasks import dispatch_notification_email

logger = logging.getLogger(__name__)


def _default_subject(notification_type):
    label = notification_type.replace('_', ' ').title()
    return f'PST Notification — {label}'


def notify(
        recipient,
        message,
        notification_type,
        link=None,
        email_subject=None,
        email_message=None):
    """
    Create an in-app notification and send the matching email notification.
    """
    try:
        notification = Notification.objects.create(
            recipient=recipient,
            message=message,
            notification_type=notification_type,
            link=link or ''
        )

        if recipient.email_notifications_enabled:
            subject = email_subject or _default_subject(notification_type)
            body = email_message or (
                f'{message}\n\nLogin to PST to view details: '
                f'{settings.FRONTEND_URL}'
            )
            dispatch_notification_email(
                recipient.email, subject, body, link or settings.FRONTEND_URL
            )

        logger.info(
            f'Notification created for {recipient.email}: {notification_type}')
        return notification
    except Exception as e:
        logger.error(f'Error creating notification: {str(e)}')
        return None
