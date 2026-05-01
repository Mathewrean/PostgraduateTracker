from django.urls import path

from .views import NotificationViewSet


notification_list = NotificationViewSet.as_view({'get': 'list'})
notification_detail = NotificationViewSet.as_view({'get': 'retrieve'})
notification_read = NotificationViewSet.as_view({'post': 'read'})
notification_mark_as_read = NotificationViewSet.as_view(
    {'post': 'mark_as_read'})
notification_mark_all = NotificationViewSet.as_view(
    {'post': 'mark_all_as_read'})
notification_unread_count = NotificationViewSet.as_view(
    {'get': 'unread_count'})

urlpatterns = [
    path(
        '',
        notification_list,
        name='notification-list'),
    path(
        '<int:pk>/',
        notification_detail,
        name='notification-detail'),
    path(
        '<int:pk>/read/',
        notification_read,
        name='notification-read'),
    path(
        '<int:pk>/mark_as_read/',
        notification_mark_as_read,
        name='notification-mark-as-read'),
    path(
        'mark_all_as_read/',
        notification_mark_all,
        name='notification-mark-all'),
    path(
        'unread_count/',
        notification_unread_count,
        name='notification-unread-count'),
]
