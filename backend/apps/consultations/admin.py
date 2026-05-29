from django.contrib import admin

from .models import ConsultationForm


@admin.register(ConsultationForm)
class ConsultationFormAdmin(admin.ModelAdmin):
    list_display = (
        'student',
        'supervisor',
        'stage',
        'form_type',
        'consultation_date',
        'status',
    )
    list_filter = ('form_type', 'status', 'consultation_date')
    search_fields = (
        'student__user__email',
        'supervisor__email',
        'topics_discussed',
    )
