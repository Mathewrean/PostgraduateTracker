from django.contrib import admin

from .models import Supervisor


@admin.register(Supervisor)
class SupervisorAdmin(admin.ModelAdmin):
    list_display = ['user', 'department', 'specialisation', 'created_at', 'updated_at']
    list_filter = ['department', 'created_at', 'updated_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'specialisation']
    readonly_fields = ['created_at', 'updated_at']
