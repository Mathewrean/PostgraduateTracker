from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
import logging
import socket
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)

SUBJECTS = {
    'registration': 'Verify your PST account — JOOUST',
    'password_reset': 'Reset your PST password — JOOUST',
}

HTML_BODIES = {
    'registration': '''
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Verify Your PST Account</h2>
            <p>Hello,</p>
            <p>Thank you for registering with the Postgraduate Submissions Tracker (PST) system.</p>
            <p>Your verification code is:</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb;">{code}</span>
            </div>
            <p>This code expires in 10 minutes. Enter it on the verification page to complete your registration.</p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                If you did not request this verification, please ignore this email.
            </p>
        </div>
    </body>
    </html>''',
    'password_reset': '''
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc2626;">Reset Your Password</h2>
            <p>Hello,</p>
            <p>You requested a password reset for your PST account.</p>
            <p>Your reset code is:</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #dc2626;">{code}</span>
            </div>
            <p>If you did not request this password reset, please ignore this email.</p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                For security, this code will expire in 10 minutes.
            </p>
        </div>
    </body>
    </html>''',
}


@shared_task(bind=True, max_retries=3)
def send_otp_email(self, email, otp_code, purpose='registration'):
    if not getattr(settings, 'EMAIL_HOST_USER', None):
        logger.info('OTP email skipped for %s (%s, no mail provider configured)', email, purpose)
        return

    html_body = HTML_BODIES.get(purpose, HTML_BODIES['registration']).format(code=otp_code)
    text_body = strip_tags(html_body).replace('\n', '').replace('  ', '')

    try:
        msg = EmailMultiAlternatives(
            subject=SUBJECTS.get(purpose, SUBJECTS['registration']),
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
        )
        msg.attach_alternative(html_body, 'text/html')
        msg.send(fail_silently=False)
    except (Exception, socket.timeout) as exc:
        logger.error(f'OTP email failed for {email} ({purpose}): {exc}')
