import logging
from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


def _format_email_html(subject, message, link=''):
    html = f'''
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">{subject}</h2>
            <p>{message}</p>
            {'<p><a href="' + link + '" style="color: #2563eb;">View in PST</a></p>' if link else ''}
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                This is an automated notification from the Postgraduate Submissions Tracker.
            </p>
        </div>
    </body>
    </html>'''
    return html


def _send_formatted_email(email, subject, message, link=''):
    html_body = _format_email_html(subject, message, link)
    text_body = strip_tags(html_body).replace('\n', ' ').strip()
    
    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email],
    )
    msg.attach_alternative(html_body, 'text/html')
    return msg.send()


@shared_task(bind=True, max_retries=3)
def send_notification_email(self, email, subject, message, link=''):
    try:
        _send_formatted_email(email, subject, message, link)
    except Exception as exc:
        logger.error(f'Notification email failed for {email}: {exc}')
        raise self.retry(exc=exc, countdown=30)


def dispatch_notification_email(email, subject, message, link=''):
    try:
        send_notification_email.delay(email, subject, message, link)
    except Exception:
        logger.warning('Celery unavailable. Sending email synchronously.')
        _send_formatted_email(email, subject, message, link)
