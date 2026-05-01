# Postgraduate Submissions Tracker (PST)

A comprehensive system for tracking postgraduate student submissions, supervisor approvals, and administrative workflows.

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PostgraduateTracker
   ```

2. **Set up environment**
   ```bash
   # Backend
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Configure environment**
   - Copy `.env.example` to `.env` in both `backend/` and `frontend/` directories
   - Update environment variables as needed

4. **Run the application**
   ```bash
   # Backend (in backend directory)
   source venv/bin/activate
   python manage.py migrate
   python manage.py runserver
   
   # Frontend (in frontend directory, in a new terminal)
   npm run dev
   ```

## 🔐 User Login & Roles

Access the application at `http://localhost:5173` (frontend) after starting both servers.

### Default Login Credentials
| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@pst.system | AdminPass123! |
| Coordinator | coordinator@pst.system | CoordinatorPass123! |
| Supervisor | supervisor@pst.system | SupervisorPass123! |
| Student | student@pst.system | StudentPass123! |

### Role Permissions
- **Student**: View/edit own profile, submit documents, view activities, send messages
- **Supervisor**: Manage assigned students, approve/reject submissions, view student progress
- **Coordinator**: Oversee all students/supervisors, manage complaints, generate reports
- **Admin**: Full system access including audit logs, user management, system configuration

## 📁 Project Structure
```
PostgraduateTracker/
├── backend/          # Django REST Framework API
├── frontend/         # React/Vite frontend application
└── docker-compose.yml # Optional: Containerized deployment
```

## 🐳 Docker Deployment (Alternative)
```bash
docker-compose up --build
```
Access at:
- Frontend: http://localhost
- Backend API: http://localhost/api
- Adminer (DB): http://localhost:8080

## 📖 Documentation
- API Documentation: http://localhost:8000/api/docs/ (when running backend)
- Detailed setup: See `docs/` directory (if exists)

---
*Last updated: May 2026*