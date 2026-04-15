from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Student, Supervisor
from .serializers import StudentSerializer, StudentProfileSerializer, SupervisorSerializer
from apps.users.permissions import IsStudent, IsSupervisor, IsCoordinator, IsAdmin

class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'STUDENT':
            return Student.objects.filter(user=user)
        elif user.role in ['COORDINATOR', 'ADMIN']:
            return Student.objects.all()
        elif user.role == 'SUPERVISOR':
            return Student.objects.filter(assigned_supervisor=user)
        return Student.objects.none()

    @action(detail=False, methods=['get', 'post'])
    def profile(self, request):
        if request.method == 'GET':
            try:
                student = Student.objects.get(user=request.user)
                serializer = StudentSerializer(student)
                return Response(serializer.data)
            except Student.DoesNotExist:
                return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        elif request.method == 'POST':
            try:
                student = Student.objects.get(user=request.user)
            except Student.DoesNotExist:
                student = Student.objects.create(user=request.user)
            
            serializer = StudentProfileSerializer(student, data=request.data, partial=True)
            if serializer.is_valid():
                profile = serializer.save()
                profile.profile_complete = bool(profile.project_title and profile.preferred_supervisor)
                profile.save()
                return Response(StudentSerializer(profile).data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SupervisorViewSet(viewsets.ModelViewSet):
    queryset = Supervisor.objects.all()
    serializer_class = SupervisorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['COORDINATOR', 'ADMIN']:
            return Supervisor.objects.all()
        elif user.role == 'SUPERVISOR':
            return Supervisor.objects.filter(user=user)
        return Supervisor.objects.none()
