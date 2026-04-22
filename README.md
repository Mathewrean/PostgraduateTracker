# Postgraduate Submissions Tracker (PST)

**Full-stack web application for managing postgraduate student submissions and academic progress tracking.**

---

## Project Overview

The Postgraduate Submissions Tracker (PST) is a comprehensive web application designed to streamline the process of managing postgraduate student academic progress, submissions, and administrative workflows. It facilitates tracking student stages, document submissions, activities, and communication between students, supervisors, and coordinators.

---

## Tech Stack

**Backend:**
- Django 5.0.1 + Django REST Framework 3.14.0
- Python 3.10+
- SQLite (for development)

**Frontend:**
- React 18+
- Vite
- Tailwind CSS
- Zustand for state management

---

## Prerequisites

Ensure you have the following installed on your system:
- **Python 3.10+**
- **Node.js 16+** and npm
- **Git**

For Linux users, it's recommended to use Python virtual environments:
```bash
python3 -m venv .venv
source .venv/bin/activate  # On Linux/Mac
# or
.venv\Scripts\activate  # On Windows
```

---

## Project Structure

```
PostgraduateTracker/
├── backend/              # Django backend application
│   ├── manage.py         # Django management script
│   ├── requirements.txt  # Python dependencies
│   ├── .venv/            # Python virtual environment
│   └── ...               # Other backend files and apps
│
├── frontend/             # React frontend application
│   ├── src/              # Frontend source code
│   ├── package.json      # Node.js dependencies
│   └── vite.config.js    # Vite configuration
│
├── .gitignore            # Git ignore rules
├── README.md             # This file
└── ...                   # Other project root files (Docker, configs, etc.)
```

---

## How to Start the Application (Development)

Follow these steps to get the application running locally:

### 1. Backend Setup

   a. Navigate to the backend directory:
      ```bash
      cd backend
      ```
   b. Activate the virtual environment:
      ```bash
      source ../.venv/bin/activate
      ```
      *(Note: If your `.venv` is directly in `backend/`, use `source .venv/bin/activate`)*
   c. Install backend dependencies:
      ```bash
      pip install -r requirements.txt
      ```
   d. Run database migrations:
      ```bash
      python manage.py migrate
      ```
   e. Start the Django development server:
      ```bash
      python manage.py runserver 0.0.0.0:8000
      ```
      *(This command can be run in a separate terminal.)*

### 2. Frontend Setup

   a. Navigate to the frontend directory:
      ```bash
      cd ../frontend
      ```
   b. Install frontend dependencies:
      ```bash
      npm install
      ```
   c. Start the frontend development server:
      ```bash
      npm run dev -- --host 0.0.0.0
      ```
      *(This command can be run in another separate terminal.)*

### 3. Access the Application

Once both the backend and frontend servers are running:

- **Frontend Application**: Open your browser to `http://localhost:5173/`
- **Backend API**: Accessible at `http://localhost:8000/`
- **Django Admin Panel**: Accessible at `http://localhost:8000/admin/`

---

## Demo Accounts

For testing different user roles, use the following credentials:

- **Student**: `student@test.com` / `student123`
- **Student 2**: `student@example.com` / `password123`
- **Supervisor**: `supervisor@test.com` / `supervisor123`
- **Coordinator**: `coordinator@test.com` / `coordinator123`
- **Admin**: `admin@pst.com` / `admin123`

*(Note: Log out and log back in to switch between roles.)*

---

## Key Features

- User authentication and role-based access control.
- Management of student stages (Concept, Proposal, Thesis).
- Document and minutes upload and verification.
- Activity planning and tracking.
- Complaint submission and resolution system.
- Notifications (in-app and email).
- Reporting and audit trails.
