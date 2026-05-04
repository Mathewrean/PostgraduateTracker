from django.urls import path

from .views import NotificationViewSet, MeetingViewSet


notification_list = NotificationViewSet.as_view({'get': 'list'})
notification_detail = NotificationViewSet.as_view({'get': 'retrieve'})
notification_read = NotificationViewSet.as_view({'post': 'read'})
notification_mark_as_read = NotificationViewSet.as_view(
    {'post': 'mark_as_read'})
notification_mark_all = NotificationViewSet.as_view(
    {'post': 'mark_all_as_read'})
notification_unread_count = NotificationViewSet.as_view(
    {'get': 'unread_count'})
meeting_list = MeetingViewSet.as_view({'get': 'list'})

urlpatterns = [
    path(
        '',
        notification_list,
        name='notification-list'),
    path(
        'notifications/',
        notification_list,
        name='notification-list-alias'),
    path(
        'notifications/<int:pk>/',
        notification_detail,
        name='notification-detail-alias'),
    path(
        'notifications/<int:pk>/read/',
        notification_read,
        name='notification-read-alias'),
    path(
        'notifications/<int:pk>/mark_as_read/',
        notification_mark_as_read,
        name='notification-mark-as-read-alias'),
    path(
        'notifications/mark_all_as_read/',
        notification_mark_all,
        name='notification-mark-all-alias'),
    path(
        'notifications/unread_count/',
        notification_unread_count,
        name='notification-unread-count-alias'),
    path(
        'meetings/',
        meeting_list,
        name='notification-meeting-list'),
]
