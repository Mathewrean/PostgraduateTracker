from django.contrib import admin
from .models import Student, Supervisor

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['user', 'project_title', 'current_stage', 'assigned_supervisor', 'profile_complete']
    list_filter = ['current_stage', 'profile_complete']
    search_fields = ['user__email', 'project_title']

@admin.register(Supervisor)
class SupervisorAdmin(admin.ModelAdmin):
    list_display = ['user', 'department', 'specialisation']
    search_fields = ['user__email', 'department']
