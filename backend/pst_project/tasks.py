from celery import shared_task
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
from apps.stages.models import Stage
from apps.complaints.models import Complaint
from apps.notifications.models import Notification
from apps.activities.models import Activity
from django.core.mail import send_mail
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_notification_email(notification_id):
    """Send email for a notification"""
    try:
        notification = Notification.objects.get(id=notification_id)
        send_mail(
            subject=f'PST Notification: {notification.get_notification_type_display()}',
            message=notification.message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[notification.recipient.email],
            fail_silently=False,
        )
        logger.info(f'Email sent for notification {notification_id}')
    except Exception as e:
        logger.error(f'Error sending notification email: {str(e)}')

@shared_task
def check_thesis_submission_timer():
    """Check if 3-month thesis timer has elapsed"""
    now = timezone.now()
    
    # Find stages that are in progress with expired timer
    expired_stages = Stage.objects.filter(
        stage_type='THESIS',
        status='IN_PROGRESS',
        three_month_unlock_date__lte=now
    )
    
    for stage in expired_stages:
        # Send notification to supervisor
        if stage.student.assigned_supervisor:
            Notification.objects.create(
                recipient=stage.student.assigned_supervisor,
                message=f'3-month waiting period for {stage.student.user.email}\'s thesis is complete. You can now approve.',
                notification_type='SUPERVISOR_APPROVAL',
                link=f'/api/stages/{stage.id}/approve/'
            )
            
            # Send email
            send_mail(
                subject='Thesis Waiting Period Complete',
                message=f'The 3-month waiting period for {stage.student.user.email}\'s thesis submission is now complete. You can proceed with approval.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[stage.student.assigned_supervisor.email],
                fail_silently=False,
            )
        
        logger.info(f'Thesis timer expired for student {stage.student.user.email}')

@shared_task
def check_complaint_escalation():
    """Check and escalate complaints older than 14 days"""
    deadline_date = timezone.now() - timedelta(days=settings.COMPLAINT_RESPONSE_DEADLINE_DAYS)
    
    # Find unresolved complaints older than deadline
    overdue_complaints = Complaint.objects.filter(
        status__in=['SUBMITTED', 'UNDER_REVIEW'],
        submitted_at__lte=deadline_date,
        is_overdue=False
    )
    
    for complaint in overdue_complaints:
        complaint.is_overdue = True
        complaint.save()
        
        # Send escalation notification
        from apps.users.models import User
        escalation_recipients = User.objects.filter(role__in=['COORDINATOR', 'ADMIN'])
        for recipient in escalation_recipients:
            Notification.objects.create(
                recipient=recipient,
                message=f'Complaint from {complaint.student.user.email} is now overdue (14+ days without response)',
                notification_type='COMPLAINT_OVERDUE',
                link=f'/api/complaints/{complaint.id}/'
            )
        
        logger.info(f'Complaint {complaint.id} marked as overdue')

@shared_task
def send_activity_reminders():
    """Send reminders for upcoming activities"""
    tomorrow = timezone.now() + timedelta(days=1)
    tomorrow_start = tomorrow.replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow_end = tomorrow.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    # Find activities scheduled for tomorrow
    upcoming = Activity.objects.filter(
        planned_date__gte=tomorrow_start,
        planned_date__lte=tomorrow_end,
        status='PLANNED'
    )
    
    for activity in upcoming:
        # Send notification to student
        Notification.objects.create(
            recipient=activity.stage.student.user,
            message=f'Reminder: {activity.title} is scheduled for tomorrow',
            notification_type='ACTIVITY_REMINDER',
            link=f'/api/activities/{activity.id}/'
        )
        
        # Send email
        send_mail(
            subject='Activity Reminder',
            message=f'You have the following activity scheduled for tomorrow: {activity.title}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[activity.stage.student.user.email],
            fail_silently=False,
        )
        
        logger.info(f'Activity reminder sent for {activity.id}')

@shared_task
def log_system_health():
    """Log system health check"""
    from apps.audit.models import AuditLog
    active_users = 0  # TODO: Check active users from audit logs
    
    AuditLog.objects.create(
        user=None,
        action='SYSTEM_HEALTH_CHECK',
        description=f'System health check at {timezone.now()}',
        extra_data={'active_users': active_users}
    )
