# API Endpoints - Complete Reference

**Base URL**: `http://localhost:8000/api`  
**Authentication**: JWT Bearer Token  
**Institution**: Jaramogi Oginga Odinga University of Science and Technology

---

## Table of Contents
1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Student Module](#student-module)
4. [Stages](#stages)
5. [Activities](#activities)
6. [Documents](#documents)
7. [Complaints](#complaints)
8. [Notifications](#notifications)
9. [Reports](#reports)
10. [Audit & System](#audit--system)

---

## Authentication

### Login
**Endpoint**: `POST /users/login/`  
**Auth Required**: No  
**Description**: Authenticate user and get JWT tokens

**Request**:
```json
{
  "email": "student@test.com",
  "password": "student123"
}
```

**Response** (200):
```json
{
  "user": {
    "id": 1,
    "email": "student@test.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "STUDENT",
    "admission_number": "STU001"
  },
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Test Users**:
- Student: `student@test.com` / `student123`
- Supervisor: `supervisor@test.com` / `supervisor123`
- Coordinator: `coordinator@test.com` / `coordinator123`
- Admin: `admin@pst.com` / `admin123`

---

### Logout
**Endpoint**: `POST /users/logout/`  
**Auth Required**: Yes (Bearer Token)  
**Description**: Invalidate current session

**Request**:
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Refresh Token
**Endpoint**: `POST /token/refresh/`  
**Auth Required**: No  
**Description**: Get new access token from refresh token

**Request**:
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## User Management

### Get Current User
**Endpoint**: `GET /users/me/`  
**Auth Required**: Yes  
**Description**: Get authenticated user's profile

**Response** (200):
```json
{
  "id": 1,
  "email": "student@test.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "STUDENT",
  "admission_number": "STU001",
  "phone": "+254700000000",
  "is_active": true,
  "date_joined": "2026-04-15T19:05:59.031283Z"
}
```

---

### Update Profile
**Endpoint**: `POST /users/update_profile/`  
**Auth Required**: Yes  
**Description**: Update user's personal information

**Request**:
```json
{
  "phone": "+254712345678",
  "first_name": "John",
  "last_name": "Doe"
}
```

---

### Register User
**Endpoint**: `POST /users/register/`  
**Auth Required**: No  
**Description**: Create new user account

**Request**:
```json
{
  "email": "newuser@example.com",
  "password": "securepass123",
  "password2": "securepass123",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "+254700000001",
  "admission_number": "STU999"
}
```

---

## Student Module

### Get Student Profile
**Endpoint**: `GET /students/profile/`  
**Auth Required**: Yes (STUDENT role)  
**Description**: Get student's profile information

**Response** (200):
```json
{
  "user": 1,
  "project_title": "Research on AI",
  "preferred_supervisor": "Dr. Michael Kipchoge",
  "assigned_supervisor": 5,
  "current_stage": "CONCEPT",
  "profile_complete": true
}
```

---

### Update Student Profile
**Endpoint**: `POST /students/profile/`  
**Auth Required**: Yes (STUDENT role)  
**Description**: Update student project and supervisor info

**Request**:
```json
{
  "project_title": "Advanced AI Research",
  "preferred_supervisor": "Prof. Jane Njeri"
}
```

---

### Get All Students
**Endpoint**: `GET /students/`  
**Auth Required**: Yes (SUPERVISOR, COORDINATOR, ADMIN)  
**Description**: List all students (access depends on role)

**Query Parameters**:
- `stage`: Filter by stage (CONCEPT, PROPOSAL, THESIS)
- `supervisor`: Filter by supervisor ID
- `page`: Pagination

**Response** (200):
```json
{
  "count": 50,
  "next": "http://localhost:8000/api/students/?page=2",
  "results": [
    {
      "id": 1,
      "user": { "first_name": "John", "email": "student@test.com" },
      "project_title": "Research on AI",
      "current_stage": "CONCEPT"
    }
  ]
}
```

---

## Stages

### Get Current Stage
**Endpoint**: `GET /stages/current_stage/`  
**Auth Required**: Yes (STUDENT)  
**Description**: Get student's current stage

**Response** (200):
```json
{
  "id": 1,
  "stage_type": "CONCEPT",
  "description": "Initial concept development stage",
  "start_date": "2026-01-15",
  "end_date": "2026-04-15",
  "is_approved": false,
  "required_documents": ["Project_Concept"]
}
```

---

### Get All Stages
**Endpoint**: `GET /stages/`  
**Auth Required**: Yes  
**Description**: List all available stages

---

### Approve Stage
**Endpoint**: `POST /stages/{id}/approve/`  
**Auth Required**: Yes (SUPERVISOR, COORDINATOR)  
**Description**: Approve student stage progression

**Request**:
```json
{
  "approval_comments": "Well prepared proposal. Approved."
}
```

---

### Reject Stage
**Endpoint**: `POST /stages/{id}/reject/`  
**Auth Required**: Yes (SUPERVISOR, COORDINATOR)  
**Description**: Reject stage and provide feedback

**Request**:
```json
{
  "rejection_reason": "Needs more detail in methodology"
}
```

---

## Activities

### Create Activity
**Endpoint**: `POST /activities/`  
**Auth Required**: Yes (STUDENT)  
**Description**: Create new activity

**Request**:
```json
{
  "title": "Literature Review",
  "description": "Review existing research on topic",
  "start_date": "2026-04-16",
  "end_date": "2026-05-16",
  "priority": "HIGH"
}
```

---

### Get Activities
**Endpoint**: `GET /activities/`  
**Auth Required**: Yes  
**Description**: List user's activities

**Query Parameters**:
- `status`: PENDING, ONGOING, COMPLETED
- `priority`: LOW, MEDIUM, HIGH
- `page`: Pagination

---

### Update Activity
**Endpoint**: `PATCH /activities/{id}/`  
**Auth Required**: Yes (owner or supervisor)  
**Description**: Update activity details

**Request**:
```json
{
  "title": "Literature Review - Phase 1",
  "status": "ONGOING"
}
```

---

### Mark Activity Complete
**Endpoint**: `POST /activities/{id}/complete/`  
**Auth Required**: Yes (owner or supervisor)  
**Description**: Mark activity as completed

**Request**:
```json
{
  "completion_notes": "Completed initial review of 50 papers"
}
```

---

## Documents

### Upload Document
**Endpoint**: `POST /documents/upload/`  
**Auth Required**: Yes (STUDENT)  
**Description**: Upload document file

**Supported Formats**: PDF, DOC, DOCX, PPTX (Max 10MB)

**Form Data**:
```
file: <binary file>
doc_type: CONCEPT_DOCUMENT  # or PROPOSAL, THESIS, OTHER
description: Project concept document
```

**Response** (201):
```json
{
  "id": 1,
  "file_name": "concept_document.pdf",
  "file_url": "/media/documents/concept_document_xyz.pdf",
  "doc_type": "CONCEPT_DOCUMENT",
  "uploaded_at": "2026-04-16T12:30:00Z",
  "is_verified": false
}
```

---

### Get Documents
**Endpoint**: `GET /documents/`  
**Auth Required**: Yes  
**Description**: List documents

**Query Parameters**:
- `doc_type`: Filter by type
- `status`: PENDING, VERIFIED, REJECTED
- `page`: Pagination

---

### Download Document
**Endpoint**: `GET /documents/{id}/download/`  
**Auth Required**: Yes  
**Description**: Download document file

---

### Verify Document (Supervisor)
**Endpoint**: `POST /documents/{id}/verify/`  
**Auth Required**: Yes (SUPERVISOR)  
**Description**: Verify uploaded document

**Request**:
```json
{
  "verification_comments": "Document meets requirements"
}
```

---

## Complaints

### Submit Complaint
**Endpoint**: `POST /complaints/create/`  
**Auth Required**: Yes (STUDENT)  
**Description**: Submit anonymous complaint

**Request**:
```json
{
  "complaint_type": "ACADEMIC_SUPPORT",
  "title": "Lack of supervisor feedback",
  "description": "Have not received feedback on submitted proposal",
  "is_anonymous": true
}
```

**Complaint Types**: ACADEMIC_SUPPORT, RESOURCE_ISSUE, COMMUNICATION, OTHER

---

### Get Complaints
**Endpoint**: `GET /complaints/`  
**Auth Required**: Yes (COORDINATOR, ADMIN)  
**Description**: List all complaints

---

### Respond to Complaint
**Endpoint**: `POST /complaints/{id}/respond/`  
**Auth Required**: Yes (COORDINATOR)  
**Description**: Respond to complaint

**Request**:
```json
{
  "response_content": "We have forwarded your concern to the academic committee. Support will be arranged.",
  "resolution_status": "IN_PROGRESS"
}
```

---

## Notifications

### Get Notifications
**Endpoint**: `GET /notifications/`  
**Auth Required**: Yes  
**Description**: Get user's notifications

**Query Parameters**:
- `unread_only`: true/false
- `type`: Filter by notification type
- `page`: Pagination

---

### Mark as Read
**Endpoint**: `POST /notifications/{id}/mark_read/`  
**Auth Required**: Yes  
**Description**: Mark notification as read

---

## Reports

### Student Progress Report
**Endpoint**: `GET /reports/student_progress/`  
**Auth Required**: Yes (COORDINATOR, ADMIN)  
**Description**: Get overall student progress analytics

**Response**:
```json
{
  "total_students": 50,
  "stages": {
    "CONCEPT": 10,
    "PROPOSAL": 25,
    "THESIS": 15
  },
  "completion_rate": 30.0
}
```

---

### Supervisor Report
**Endpoint**: `GET /reports/supervisor/`  
**Auth Required**: Yes (COORDINATOR, ADMIN)  
**Description**: Get supervisor productivity metrics

---

### Complaint Report
**Endpoint**: `GET /reports/complaints/`  
**Auth Required**: Yes (COORDINATOR, ADMIN)  
**Description**: Get complaint statistics

---

### Stage Transition Report
**Endpoint**: `GET /reports/stage_transitions/`  
**Auth Required**: Yes (COORDINATOR, ADMIN)  
**Description**: Get stage progression analytics

---

## Audit & System

### Audit Log
**Endpoint**: `GET /audit/logs/`  
**Auth Required**: Yes (ADMIN)  
**Description**: View system audit trail

**Query Parameters**:
- `user`: Filter by user
- `action`: Filter by action type
- `start_date`: Start date filter
- `end_date`: End date filter

---

### System Health
**Endpoint**: `GET /health/`  
**Auth Required**: No  
**Description**: Check system status

**Response** (200):
```json
{
  "status": "healthy",
  "database": "connected",
  "cache": "available",
  "timestamp": "2026-04-16T12:30:00Z"
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

---

## Error Responses

**Standard Error Format**:
```json
{
  "error": "Error message",
  "detail": "Detailed explanation",
  "code": "ERROR_CODE"
}
```

**Common Errors**:
- `INVALID_CREDENTIALS`: Email/password combination incorrect
- `PERMISSION_DENIED`: User lacks required role
- `STAGE_NOT_READY`: Cannot proceed with current stage
- `FILE_TOO_LARGE`: Document exceeds 10MB limit
- `INVALID_FORMAT`: File format not supported

---

## Documentation
- **Admin Panel**: http://localhost:8000/admin/
- **API Root**: http://localhost:8000/api/
- **Frontend**: http://localhost:5173
- **Postman Collection**: Import from `PST_Postman.json`

Generated: April 16, 2026
