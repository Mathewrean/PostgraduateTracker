from django.contrib import admin
from .models import Notification, Meeting

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['recipient', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['recipient__email', 'message']
    readonly_fields = ['created_at']

@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ['student', 'supervisor', 'scheduled_date', 'status']
    list_filter = ['status', 'scheduled_date']
    search_fields = ['student__email', 'supervisor__email']
