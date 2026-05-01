from django.contrib import admin
from .models import Activity, Meeting


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['title', 'stage', 'planned_date', 'status', 'created_by']
    list_filter = ['status', 'planned_date', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['completed_date', 'created_at', 'updated_at']


@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ['student', 'supervisor', 'scheduled_date', 'status', 'created_at', 'updated_at']
    list_filter = ['status', 'scheduled_date', 'created_at']
    search_fields = ['student__user__email', 'supervisor__email', 'notes']
    readonly_fields = ['created_at', 'updated_at']
