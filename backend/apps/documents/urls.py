from django.urls import path

from .views import DocumentViewSet, MinutesViewSet


document_list = DocumentViewSet.as_view({'get': 'list', 'post': 'create'})
document_detail = DocumentViewSet.as_view(
    {'get': 'retrieve', 'patch': 'partial_update'})
document_verify = DocumentViewSet.as_view({'post': 'verify'})
document_download = DocumentViewSet.as_view({'get': 'download'})

minutes_list = MinutesViewSet.as_view({'get': 'list', 'post': 'create'})
minutes_detail = MinutesViewSet.as_view({'get': 'retrieve'})
minutes_approve = MinutesViewSet.as_view({'post': 'approve'})
minutes_download = MinutesViewSet.as_view({'get': 'download'})

urlpatterns = [
    path('', document_list, name='document-list'),
    path('<int:pk>/', document_detail, name='document-detail'),
    path('<int:pk>/verify/', document_verify, name='document-verify'),
    path('<int:pk>/download/', document_download, name='document-download'),
    path('minutes/', minutes_list, name='minutes-list'),
    path('minutes/<int:pk>/', minutes_detail, name='minutes-detail'),
    path('minutes/<int:pk>/approve/', minutes_approve, name='minutes-approve'),
    path('minutes/<int:pk>/download/', minutes_download, name='minutes-download'),
]
