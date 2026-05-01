from apps.notifications.models import Notification
from apps.notifications.tasks import send_notification_email_task
import threading
import logging

logger = logging.getLogger(__name__)


def _dispatch_notification_email(notification_id):
    try:
        send_notification_email_task.delay(notification_id)
    except Exception as exc:
        logger.error(f'Error dispatching notification email task: {str(exc)}')


def notify(recipient, message, notification_type, link=None):
    """
    Create a notification record and dispatch an async email task.

    Args:
        recipient: User object who will receive the notification
        message: str - The notification message
        notification_type: str - One of the NOTIFICATION_TYPES choices
        link: str (optional) - URL link for the notification
    """
    try:
        notification = Notification.objects.create(
            recipient=recipient,
            message=message,
            notification_type=notification_type,
            link=link or ''
        )

        # Dispatch the Celery handoff in a background thread so broker latency
        # never slows down the API response path.
        threading.Thread(
            target=_dispatch_notification_email,
            args=(notification.id,),
            daemon=True,
        ).start()

        logger.info(
            f'Notification created for {
                recipient.email}: {notification_type}')
        return notification
    except Exception as e:
        logger.error(f'Error creating notification: {str(e)}')
        return None
