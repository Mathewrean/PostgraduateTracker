from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = [
        'email',
        'admission_number',
        'role',
        'is_active',
        'date_joined',
        'last_login']
    list_filter = ['role', 'is_active', 'date_joined']
    search_fields = ['email', 'admission_number', 'first_name', 'last_name']
    readonly_fields = ['date_joined', 'last_login']
    fieldsets = (
        ('Personal Info', {
            'fields': (
                'email', 'admission_number', 'phone', 'first_name', 'last_name')}), ('Permissions', {
                    'fields': (
                        'role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}), ('Timeline', {
                            'fields': (
                                'date_joined', 'last_login', 'last_login_ip')}), )
