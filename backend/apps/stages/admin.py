from django.contrib import admin
from .models import Stage


@admin.register(Stage)
class StageAdmin(admin.ModelAdmin):
    list_display = [
        'student',
        'stage_type',
        'status',
        'started_at',
        'completed_at',
        'approved_by']
    list_filter = ['stage_type', 'status', 'started_at']
    search_fields = ['student__user__email']
    readonly_fields = ['started_at', 'completed_at', 'approval_date']
