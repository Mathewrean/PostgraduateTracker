# Quick Start Guide for PST

## Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15 (optional for dev, SQLite works)
- Redis 7 (for Celery)

## Development Setup (5 minutes)

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp .env.example .env

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend will be available at: http://localhost:8000

### 2. Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:5173

### 3. Celery Setup (Optional for dev)

For background tasks, start Celery in a separate terminal:

```bash
# From backend directory
celery -A pst_project worker -l info
```

For scheduled tasks:

```bash
# From backend directory
celery -A pst_project beat -l info
```

## Testing the Application

### 1. Create a Student User

```bash
# POST to http://localhost:8000/api/users/register/
{
  "email": "student@example.com",
  "admission_number": "ADM001",
  "phone": "+254712345678",
  "first_name": "John",
  "last_name": "Doe",
  "role": "STUDENT",
  "password": "testpass123",
  "password_confirm": "testpass123"
}
```

### 2. Login

```bash
# POST to http://localhost:8000/api/auth/token/
{
  "email": "student@example.com",
  "password": "testpass123"
}

# Returns:
{
  "access": "<jwt_token>",
  "refresh": "<refresh_token>"
}
```

### 3. Add Token to Frontend

Copy the access token and use it in the frontend. The API service will handle this automatically.

## Database Schema

The application automatically creates all tables on migration. Key models:

- **User**: Custom user with roles (STUDENT, SUPERVISOR, COORDINATOR, ADMIN)
- **Student**: Student profile with project info
- **Stage**: Current stage (CONCEPT, PROPOSAL, THESIS)
- **Activity**: Student activities on calendar
- **Document**: Uploaded papers
- **Complaint**: Student complaints
- **Notification**: System notifications

## API Endpoints

### Authentication
- `POST /api/auth/token/` - Get JWT token
- `POST /api/auth/token/refresh/` - Refresh token

### Users
- `POST /api/users/register/` - Register new user
- `GET /api/users/me/` - Get current user
- `POST /api/users/update_profile/` - Update profile

### Students
- `GET /api/students/profile/` - Get student profile
- `POST /api/students/profile/` - Update student profile

### Stages
- `GET /api/stages/current_stage/` - Get current stage
- `GET /api/stages/` - List all stages
- `POST /api/stages/{id}/approve/` - Approve stage (supervisor only)

### Activities
- `GET /api/activities/` - List activities
- `POST /api/activities/` - Create activity
- `POST /api/activities/{id}/mark_done/` - Complete activity

### Documents
- `GET /api/documents/documents/` - List documents
- `POST /api/documents/documents/` - Upload document
- `POST /api/documents/documents/{id}/verify/` - Verify document

### Complaints
- `GET /api/complaints/` - List complaints
- `POST /api/complaints/` - Submit complaint
- `POST /api/complaints/{id}/respond/` - Respond to complaint (admin only)

### Reports
- `GET /api/reports/student_progress/` - Student progress
- `GET /api/reports/complaint_report/` - Complaint statistics
- `GET /api/reports/activity_log/` - Activity logs

## Docker Setup (Alternative)

```bash
# Build and start all services
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Access application
# Backend: http://localhost:8000
# Frontend: http://localhost:80 (via nginx)
```

## Troubleshooting

### Port already in use
```bash
# Find process on port 8000
lsof -i :8000

# Kill process
kill -9 <PID>
```

### Database connection error
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env

### Missing modules
```bash
pip install -r requirements.txt
```

### Static files not loading
```bash
python manage.py collectstatic --no-input
```

## Features to Explore

1. **Student Dashboard**: View current stage, activities, documents
2. **Stage Gating**: Requirements must be met before moving to next stage
3. **Activity Calendar**: Schedule and track activities
4. **Document Upload**: Upload PDF, DOC, DOCX files
5. **Complaints**: Anonymous complaint submission
6. **Reports**: Coordinator can view comprehensive reports
7. **Notifications**: Real-time in-app and email notifications

## Next Steps

1. Customize supervisor list in `apps/students/models.py`
2. Configure email in `.env` for notifications
3. Set up AWS S3 for production file storage
4. Configure HTTPS and domain
5. Deploy to production using Docker

## Support

For issues or questions, contact the development team.
