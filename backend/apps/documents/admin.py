from django.contrib import admin
from .models import Document, Minutes


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = [
        'student',
        'doc_type',
        'stage',
        'uploaded_at',
        'is_verified']
    list_filter = ['doc_type', 'is_verified', 'uploaded_at']
    search_fields = ['student__user__email']
    readonly_fields = ['uploaded_at', 'file_size', 'verified_at']


@admin.register(Minutes)
class MinutesAdmin(admin.ModelAdmin):
    list_display = ['student', 'stage', 'uploaded_at', 'is_approved']
    list_filter = ['is_approved', 'uploaded_at']
    search_fields = ['student__user__email']
    readonly_fields = ['uploaded_at', 'approved_at']
