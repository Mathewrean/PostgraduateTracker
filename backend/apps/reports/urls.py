from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ExportReportView, ReportViewSet

router = DefaultRouter()
router.register(r'', ReportViewSet, basename='report')

urlpatterns = [
    path('export/', ExportReportView.as_view(), name='report-export'),
] + router.urls
