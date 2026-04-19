from django.contrib import admin
from .models import Student

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['user', 'project_title', 'current_stage', 'assigned_supervisor', 'profile_complete']
    list_filter = ['current_stage', 'profile_complete']
    search_fields = ['user__email', 'project_title']
