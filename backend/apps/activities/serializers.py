from rest_framework import serializers
from .models import Activity


class ActivitySerializer(serializers.ModelSerializer):
    created_by_email = serializers.SerializerMethodField()
    marked_done_by_email = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = [
            'id',
            'stage',
            'created_by',
            'created_by_email',
            'title',
            'description',
            'planned_date',
            'completed_date',
            'status',
            'marked_done_by',
            'marked_done_by_email',
            'created_at',
            'updated_at']
        read_only_fields = ['completed_date', 'marked_done_by', 'created_at', 'updated_at']

    def get_created_by_email(self, obj):
        return obj.created_by.email if obj.created_by else None

    def get_marked_done_by_email(self, obj):
        return obj.marked_done_by.email if obj.marked_done_by else None
