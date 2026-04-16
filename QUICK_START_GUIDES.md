# PST Application - Role-Based Quick Start Guides

**Institution**: Jaramogi Oginga Odinga University of Science and Technology  
**Application**: Postgraduate Submissions Tracker (PST)

---

## Table of Contents
- [Student Quick Start](#student-quick-start)
- [Supervisor Quick Start](#supervisor-quick-start)
- [Coordinator Quick Start](#coordinator-quick-start)
- [Admin Quick Start](#admin-quick-start)

---

## STUDENT Quick Start

### Overview
As a student, you'll manage your postgraduate journey through PST. Track your submission progress through different stages (Concept → Proposal → Thesis), upload documents, plan activities, and communicate with supervisors.

### Account Details
```
Email: student@test.com
Password: student123
URL: http://localhost:5173/login
Role: STUDENT
```

### First Steps

#### 1. Login
1. Go to http://localhost:5173
2. Click "Get Started" or navigate to login page
3. Enter credentials: `student@test.com` / `student123`
4. You'll be redirected to Student Dashboard

#### 2. Complete Your Profile
1. Click "My Profile" in sidebar
2. Fill in required information:
   - Project Title (e.g., "Advanced Machine Learning Applications")
   - Preferred Supervisor (select from dropdown)
   - Contact information
3. Click "Save Profile"

#### 3. Your Current Stage
On Dashboard, view your current stage:
- **CONCEPT**: Initial project planning phase
- **PROPOSAL**: Detailed proposal development
- **THESIS**: Final thesis submission

**Example Flow**:
```
CONCEPT (15 Jan - 15 Apr)
    ↓ (After approval)
PROPOSAL (15 Apr - 15 Aug)
    ↓ (After approval)
THESIS (15 Aug - 15 Dec)
```

#### 4. Upload Documents
1. Click "Documents" in sidebar
2. Click "Upload New Document"
3. Select document type:
   - `CONCEPT_DOCUMENT`: For concept stage
   - `PROPOSAL`: For proposal stage
   - `THESIS`: For thesis submission
   - `OTHER`: Miscellaneous files
4. Choose file (PDF, DOC, DOCX, PPTX - max 10MB)
5. Add description
6. Click "Upload"

**Document Status**:
- PENDING: Waiting for supervisor review
- VERIFIED: Approved by supervisor
- REJECTED: Needs revision

#### 5. Create Activities
1. Click "Activities" in sidebar
2. Click "Create Activity"
3. Fill in details:
   - Title (e.g., "Literature Review")
   - Description
   - Start & End dates
   - Priority (LOW, MEDIUM, HIGH)
4. Supervisor will track and approve

**Sample Activities**:
- Literature Review
- Methodology Development
- Data Collection
- Analysis Phase
- Writing & Revision

#### 6. Request Stage Approval
Once you've completed requirements for current stage:
1. Ensure all required documents are uploaded and verified
2. Click "Request Approval" button
3. Add submission comments
4. Supervisor will review and approve/reject

#### 7. Monitor Progress
1. Dashboard shows:
   - Current stage status
   - Documents uploaded count
   - Activities in progress
   - Stage completion percentage
   - Next milestone date

#### 8. Submit Complaints (if needed)
1. Click "Complaints" (if available)
2. Click "New Complaint"
3. Select type: ACADEMIC_SUPPORT, RESOURCE_ISSUE, COMMUNICATION
4. Describe issue (anonymous option available)
5. Submit
6. Coordinator will respond

### Key Features
- Real-time progress tracking
- Document management system
- Activity planning calendar
- Supervisor communication
- Complaint/feedback system
- Notifications for important updates

### Keyboard Shortcuts (if implemented)
- `Ctrl+D`: Go to Dashboard
- `Ctrl+A`: Create Activity
- `Ctrl+U`: Upload Document

### FAQ - Student

**Q: What if I miss a stage deadline?**
A: Contact your supervisor. Extensions may be granted with valid reasons.

**Q: Can I upload multiple documents for one stage?**
A: Yes, upload all required documents for verification.

**Q: How long does supervisor review take?**
A: Typically 3-5 days depending on supervisor workload.

**Q: Can I change my preferred supervisor?**
A: Yes, update in Profile. Contact coordinator for reassignment.

**Q: What if document upload fails?**
A: Check file size (max 10MB), format (PDF/DOC/DOCX/PPTX), and internet connection.

---

## SUPERVISOR Quick Start

### Overview
Supervisors oversee student progress, review submissions, approve stage transitions, and provide guidance. You'll monitor assigned students and ensure quality standards are maintained.

### Account Details
```
Email: supervisor@test.com
Password: supervisor123
URL: http://localhost:5173/login
Role: SUPERVISOR
```

### First Steps

#### 1. Login
1. Go to http://localhost:5173
2. Click "Get Started"
3. Enter: `supervisor@test.com` / `supervisor123`
4. You'll see Supervisor Dashboard

#### 2. View Assigned Students
1. Click "My Students" in sidebar
2. View list of students assigned to you with:
   - Student name & admission number
   - Current stage
   - Project title
   - Last activity date

#### 3. Review Student Profile
1. Click on a student name
2. View:
   - Personal information
   - Project details
   - Current stage status
   - Uploaded documents
   - Activities list
   - Communication history

#### 4. Review Documents
1. Go to student profile
2. Click "Documents" tab
3. View submitted documents with status (PENDING, VERIFIED, REJECTED)
4. Download to review
5. Click "Verify" or "Request Changes"

**Verification Process**:
```
Document Uploaded
    ↓
Supervisor Reviews
    ↓
Verified ✓ OR Request Changes ✗
    ↓
Student Notified
```

#### 5. Approve/Reject Stage
1. Go to student's stage section
2. Review:
   - All required documents
   - Activities completed
   - Quality of work
3. Click "Approve" or "Reject"
4. Add approval/rejection comments
5. Student will be notified automatically

**Approval Criteria**:
- All required documents submitted
- Documents meet quality standards
- Activities logged appropriately
- Previous feedback addressed

#### 6. Monitor Activities
1. Click "Approvals" to see pending approvals
2. Review submitted activities:
   - Check completion status
   - Provide feedback
   - Mark as approved
3. Track student progress toward milestones

#### 7. Send Feedback
1. Click on student
2. Click "Send Message" or "Add Comment"
3. Provide constructive feedback on:
   - Document quality
   - Activity progress
   - Next steps
4. Student receives notification

### Key Features
- Dashboard with pending approvals
- Student assignment management
- Document verification system
- Activity monitoring
- Secure communication channel
- Progress tracking
- Audit trail of approvals

### Workflow Example
```
Day 1: Student uploads proposal document
Day 2: You review and request revisions
Day 3: Student submits revised document
Day 4: You verify and approve
Day 5: Student gets approval notification
```

### FAQ - Supervisor

**Q: How many students can I supervise?**
A: As defined by institution policy. Check coordinator for limits.

**Q: What if student misses deadline?**
A: Document in comments. Escalate to coordinator if pattern emerges.

**Q: Can I reassign a student?**
A: Contact coordinator for reassignment.

**Q: How do I handle disputed rejections?**
A: Document reasons clearly. Student can appeal through coordinator.

---

## COORDINATOR Quick Start

### Overview
Coordinators manage the overall system, monitor all students, generate reports, handle complaints, and ensure smooth operations across all stages and supervisors.

### Account Details
```
Email: coordinator@test.com
Password: coordinator123
URL: http://localhost:5173/login
Role: COORDINATOR
```

### First Steps

#### 1. Login
1. Go to http://localhost:5173
2. Click "Get Started"
3. Enter: `coordinator@test.com` / `coordinator123`
4. You'll see Coordinator Dashboard

#### 2. Dashboard Overview
You'll see key metrics:
```
Total Students: 50
├── Concept Stage: 10
├── Proposal Stage: 25
├── Thesis Stage: 15
└── Completed: 0

Recent Activities: Latest updates across all students
Progress Metrics: System-wide completion rates
```

#### 3. View All Students
1. Click "All Students" in sidebar
2. Filter by:
   - Supervisor
   - Stage (CONCEPT, PROPOSAL, THESIS)
   - Status (On-track, Delayed, Completed)
   - Department
3. Sort by columns
4. Click student to view details

#### 4. Generate Reports
Reports available:
1. **Student Progress Report**
   - Individual student progress
   - Stage completion rates
   - Timeline tracking
   
2. **Supervisor Performance Report**
   - Document verification rates
   - Average approval times
   - Student satisfaction

3. **Complaint Report**
   - Complaint trends
   - Resolution duration
   - Common issues

4. **Stage Transition Report**
   - Progression rates by stage
   - Bottleneck identification
   - Timeline analysis

**How to Generate**:
1. Click "Reports" in sidebar
2. Select report type
3. Choose date range
4. Click "Generate"
5. Download as PDF/Excel

#### 5. Manage Complaints
1. Click "Complaints" in sidebar
2. View all submitted complaints:
   - Status: PENDING, IN_PROGRESS, RESOLVED
   - Type: ACADEMIC_SUPPORT, RESOURCE_ISSUE, etc.
   - Priority: HIGH, MEDIUM, LOW
3. Click complaint to view details
4. Click "Respond" to send response
5. Update resolution status

**Complaint Resolution Steps**:
```
Complaint Submitted
    ↓
Assess Urgency/Assign
    ↓
Investigate Issue
    ↓
Develop Solution
    ↓
Communicate to Student
    ↓
Follow-up & Close
```

#### 6. Supervisor Management
1. Click "Supervisors" (if available)
2. View:
   - Assigned students per supervisor
   - Document verification rates
   - Average approval times
   - Performance metrics
3. Identify supervisors needing support

#### 7. System Monitoring
Monitor:
- Document upload trends
- Stage progression speeds
- Bottlenecks and delays
- Complaint patterns
- Overall system health

### Key Features
- System-wide dashboard
- Advanced filtering & search
- Comprehensive reporting
- Complaint management
- Supervisor oversight
- Audit logging
- Data exports

### Critical Tasks - Priority Order
1. Respond to student complaints (within 24-48 hours)
2. Monitor stage progression (weekly review)
3. Generate monthly reports
4. Support supervisors with complex cases
5. System maintenance and updates

### FAQ - Coordinator

**Q: How often should I generate reports?**
A: Weekly for progress, monthly for comprehensive analysis.

**Q: What causes stage progression delays?**
A: Typically missing documents, supervisor unavailability, or missing requirements.

**Q: How do I handle supervisor disputes?**
A: Review documentation, consult with both parties, escalate to administration if needed.

**Q: Can I override supervisor decisions?**
A: As coordinator, you can review, but should discuss with supervisor first.

---

## ADMIN Quick Start

### Overview
Admins have full system access, manage users, configure settings, handle system administration, and ensure data integrity and security.

### Account Details
```
Email: admin@pst.com
Password: admin123
URL: http://localhost:8000/admin/ (Django Admin)
URL: http://localhost:5173/login (App Admin Panel)
Role: ADMIN
```

### First Steps

#### 1. Django Admin Access
1. Go to http://localhost:8000/admin/
2. Login with: `admin@pst.com` / `admin123`
3. Access to all models and system data

#### 2. App Admin Access
1. Go to http://localhost:5173
2. Login with: `admin@pst.com` / `admin123`
3. Full system dashboard access

#### 3. User Management
1. Click "Users" in sidebar
2. View all users with:
   - Role: STUDENT, SUPERVISOR, COORDINATOR, ADMIN
   - Status: Active/Inactive
   - Last login date
   - Account created date

**User Management Tasks**:
- Create new users
- Update user information
- Change user roles
- Reset passwords
- Deactivate/reactivate accounts
- Assign supervisors to students

**How to Create User**:
```
Click "Add User"
├── Email address
├── Password
├── First & Last name
├── Role (STUDENT/SUPERVISOR/etc)
├── Admission number / Phone
└── Click "Create"
```

#### 4. System Settings
Configure:
- Institution details
- Stage definitions
- File upload limits
- Notification preferences
- Email settings
- API keys
- Session timeout

#### 5. Audit Logs & Security
1. Click "Audit Logs"
2. View all system activities:
   - User actions
   - Data changes
   - Login attempts
   - Permission changes
3. Filter by:
   - User
   - Date range
   - Action type
   - Module

**Log includes**: Who, What, When, Where, Why

#### 6. Backup & Maintenance
1. **Database Backup**: 
   ```bash
   cd backend
   python manage.py dumpdata > backup_$(date +%Y%m%d).json
   ```

2. **System Health Check**:
   - View API status
   - Check database connectivity
   - Verify file storage
   - Monitor system performance

3. **Scheduled Tasks**:
   - Set up automated backups
   - Configure notification cleanup
   - Schedule report generation

#### 7. System Configuration
1. Click "Settings"
2. Configure:
   - Institution name/logo
   - Email templates
   - Document type categories
   - Stage definitions
   - User roles & permissions
   - File size limits (currently 10MB)
   - Supported file formats (PDF, DOC, DOCX, PPTX)

### Key Features
- Full user management
- System configuration
- Comprehensive audit logging
- Backup & restore
- Permission management
- Report scheduling
- API configuration

### Admin Responsibilities
1. **Daily**: Monitor system status, check complaints
2. **Weekly**: Review audit logs, generate reports
3. **Monthly**: System performance review, user management
4. **Quarterly**: Security audit, backup verification
5. **Annually**: System upgrade, policy review

### FAQ - Admin

**Q: How do I reset a user's password?**
A: Go to user profile, click "Reset Password", send reset link to email.

**Q: Can I export all system data?**
A: Yes, use Django admin or custom export feature.

**Q: How do I handle security incidents?**
A: Review audit logs, check involved accounts, disable if needed, contact IT.

**Q: What's the backup schedule?**
A: Daily automated, with monthly manual verification recommended.

---

## Common Issues & Solutions

### All Roles

**Issue**: Login fails with "Invalid credentials"
- Verify email and password
- Check Caps Lock
- Ensure account is active

**Issue**: Document upload fails
- Check file size (max 10MB)
- Verify format (PDF, DOC, DOCX, PPTX)
- Check internet connection
- Try different browser

**Issue**: Notifications not received
- Check notification settings
- Verify email configuration
- Check spam folder
- Enable browser notifications

**Issue**: Stage approval stuck
- Check all required documents uploaded
- Verify supervisor assignment
- Contact supervisor/coordinator

### Performance Issues

**Slow dashboard loading**:
- Clear browser cache
- Disable browser extensions
- Check internet speed
- Use modern browser

**Search/Filter slow**:
- Reduce date range
- Use more specific filters
- Contact IT if persists

---

## Contact & Support

- **Technical Issues**: File bug report in system
- **Academic Questions**: Contact your supervisor
- **Administrative Issues**: Contact Coordinator
- **System Problems**: Contact Admin
- **Emergency**: Contact Department Head

**Response Times**:
- Critical (system down): 1 hour
- Urgent (major feature broken): 4 hours
- High (significant issue): 1 day
- Medium (minor issue): 3 days
- Low (enhancement): 1 week

---

Generated: April 16, 2026
