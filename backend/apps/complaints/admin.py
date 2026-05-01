from django.contrib import admin
from .models import Complaint


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = [
        'student',
        'status',
        'submitted_at',
        'is_overdue',
        'responded_by']
    list_filter = ['status', 'is_overdue', 'submitted_at']
    search_fields = ['student__user__email', 'content']
    readonly_fields = ['submitted_at', 'responded_at']
