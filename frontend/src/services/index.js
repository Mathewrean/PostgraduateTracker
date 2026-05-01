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
  
  getAll: (params = {}) =>
    api.get('/students/', { params }),

  getById: (id) =>
    api.get(`/students/${id}/`),
  
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
  
  getAll: (params = {}) =>
    api.get('/stages/', { params }),

  getById: (stageId) =>
    api.get(`/stages/${stageId}/`),
  
  approve: (stageId) =>
    api.post(`/stages/${stageId}/approve/`),
}

export const activityService = {
  create: (data) =>
    api.post('/activities/', data),
  
  getAll: (params = {}) =>
    api.get('/activities/', { params }),
  
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
  
  getAll: (params = {}) =>
    api.get('/documents/', { params }),
  
  verify: (docId) =>
    api.post(`/documents/${docId}/verify/`),

  download: (docId) =>
    api.get(`/documents/${docId}/download/`, { responseType: 'blob' }),
}

export const minutesService = {
  upload: (data) =>
    api.post('/minutes/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  approve: (minutesId) =>
    api.post(`/minutes/${minutesId}/approve/`),
  download: (minutesId) =>
    api.get(`/minutes/${minutesId}/download/`, { responseType: 'blob' }),
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
  getStudentProgress: (params = {}) =>
    api.get('/reports/students/', { params }),
  
  getSupervisorReport: (params = {}) =>
    api.get('/reports/supervisors/', { params }),
  
  getLoginHistory: (params = {}) =>
    api.get('/reports/login_history/', { params }),

  getUserReport: (params = {}) =>
    api.get('/reports/users/', { params }),
  
  getComplaintReport: (params = {}) =>
    api.get('/reports/complaints/', { params }),
  
  getActivityLog: (params = {}) =>
    api.get('/reports/activity_log/', { params }),
  
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
