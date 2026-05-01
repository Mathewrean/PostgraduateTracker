from django.contrib import admin
from .models import Activity


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['title', 'stage', 'planned_date', 'status', 'created_by']
    list_filter = ['status', 'planned_date', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['completed_date', 'created_at', 'updated_at']
