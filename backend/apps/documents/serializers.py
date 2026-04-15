from rest_framework import serializers
from .models import Document, Minutes

class DocumentSerializer(serializers.ModelSerializer):
    student_email = serializers.SerializerMethodField()
    verified_by_email = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = ['id', 'stage', 'student', 'student_email', 'doc_type', 'file', 'uploaded_at', 
                  'file_size', 'is_verified', 'verified_by', 'verified_by_email', 'verified_at']
        read_only_fields = ['uploaded_at', 'file_size', 'verified_at']

    def get_student_email(self, obj):
        return obj.student.user.email

    def get_verified_by_email(self, obj):
        return obj.verified_by.email if obj.verified_by else None

class MinutesSerializer(serializers.ModelSerializer):
    student_email = serializers.SerializerMethodField()
    approved_by_email = serializers.SerializerMethodField()

    class Meta:
        model = Minutes
        fields = ['id', 'stage', 'student', 'student_email', 'file', 'uploaded_at', 
                  'is_approved', 'approved_by', 'approved_by_email', 'approved_at']
        read_only_fields = ['uploaded_at', 'approved_at']

    def get_student_email(self, obj):
        return obj.student.user.email

    def get_approved_by_email(self, obj):
        return obj.approved_by.email if obj.approved_by else None
