from django.contrib import admin
from .models import Student, SupervisorOption


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = [
        'user',
        'project_title',
        'current_stage',
        'assigned_supervisor',
        'profile_complete']
    list_filter = ['current_stage', 'profile_complete']
    search_fields = ['user__email', 'project_title']


@admin.register(SupervisorOption)
class SupervisorOptionAdmin(admin.ModelAdmin):
    list_display = [
        'display_order',
        'name',
        'title',
        'role',
        'is_other',
        'linked_user']
    list_filter = ['role', 'is_other']
    search_fields = ['name', 'title', 'linked_user__email']
