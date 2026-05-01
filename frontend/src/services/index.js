import api from './api'

export const authService = {
  login: (email, password) =>
    api.post('/auth/login/', { email, password }),
  
  register: (data) =>
    api.post('/users/register/', data),
  
  logout: (refreshToken) =>
    api.post('/auth/logout/', { refresh: refreshToken }),
  
  getCurrentUser: () =>
    api.get('/auth/profile/'),
  
  updateProfile: (data) =>
    api.patch('/auth/profile/', data),
}

export const studentService = {
  getProfile: () =>
    api.get('/students/profile/'),
  
  updateProfile: (data) =>
    api.patch('/students/profile/', data),
  
  getAll: () =>
    api.get('/students/'),
  
  update: (id, data) =>
    api.patch(`/students/${id}/`, data),
}

export const userService = {
  getAll: (params = {}) =>
    api.get('/users/', { params }),
}

export const stageService = {
  getCurrentStage: () =>
    api.get('/stages/current_stage/'),
  
  getAll: () =>
    api.get('/stages/'),

  getById: (stageId) =>
    api.get(`/stages/${stageId}/`),
  
  approve: (stageId) =>
    api.post(`/stages/${stageId}/approve/`),
}

export const activityService = {
  create: (data) =>
    api.post('/activities/', data),
  
  getAll: () =>
    api.get('/activities/'),
  
  getCalendar: (stageId) =>
    api.get('/activities/calendar/', {
      params: stageId ? { stage_id: stageId } : {}
    }),
  
  markDone: (activityId) =>
    api.post(`/activities/${activityId}/complete/`),
}

export const documentService = {
  upload: (data) =>
    api.post('/documents/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  getAll: () =>
    api.get('/documents/'),
  
  verify: (docId) =>
    api.post(`/documents/${docId}/verify/`),
}

export const minutesService = {
  upload: (data) =>
    api.post('/minutes/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  approve: (minutesId) =>
    api.post(`/minutes/${minutesId}/approve/`),
}

export const complaintService = {
  submit: (content) =>
    api.post('/complaints/', { content }),
  
  getAll: () =>
    api.get('/complaints/'),
  
  respond: (complaintId, responseContent) =>
    api.post(`/complaints/${complaintId}/respond/`, { response_content: responseContent }),
}

export const notificationService = {
  getAll: () =>
    api.get('/notifications/'),
  
  markAsRead: (notificationId) =>
    api.post(`/notifications/${notificationId}/read/`),
  
  markAllAsRead: () =>
    api.post('/notifications/mark_all_as_read/'),
  
  getUnreadCount: () =>
    api.get('/notifications/unread_count/'),
}

export const reportService = {
  getStudentProgress: (range = 'all') =>
    api.get('/reports/students/', { params: { range } }),
  
  getSupervisorReport: () =>
    api.get('/reports/supervisors/'),
  
  getLoginHistory: () =>
    api.get('/reports/login_history/'),

  getUserReport: (params = {}) =>
    api.get('/reports/users/', { params }),
  
  getComplaintReport: () =>
    api.get('/reports/complaints/'),
  
  getActivityLog: (range = 'week') =>
    api.get('/reports/activity_log/', { params: { range } }),
  
  getStageTransitionReport: () =>
    api.get('/reports/stage_transition_report/'),
  
  export: (type, params = {}) =>
    api.get('/reports/export/', {
      params: { type, ...params },
      responseType: 'blob'
    }),
}

export const supervisorService = {
  getStudents: () =>
    api.get('/supervisor/students/'),
  getApprovals: () =>
    api.get('/supervisor/approvals/'),
}

export const auditService = {
  getLogs: () =>
    api.get('/logs/'),
}

export const meetingService = {
  create: (data) =>
    api.post('/meetings/', data),
  getAll: () =>
    api.get('/meetings/'),
}
