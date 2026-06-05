import api from './api'

export const authService = {
  login: (identifier, password) =>
    api.post('/auth/login/', { identifier, password }),
  
  register: (data) =>
    api.post('/users/register/', data),

  verifyOtp: (email, otp) =>
    api.post('/auth/verify-otp/', { email, otp }),

  resendOtp: (email) =>
    api.post('/auth/resend-otp/', { email }),
  
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
  
  respond: (complaintId, responseContent, signature) =>
    api.post(`/complaints/${complaintId}/respond/`, {
      response_content: responseContent,
      typed_signature: signature
    }),
}

export const notificationService = {
  getAll: () =>
    api.get('/notifications/'),

  getById: (notificationId) =>
    api.get(`/notifications/${notificationId}/`),
  
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

  getUserReport: (params = {}) =>
    api.get('/reports/users/', { params }),

  getComplaintReport: (params = {}) =>
    api.get('/reports/complaints/', { params }),

  getStageTransitions: () =>
    api.get('/reports/stage-transitions/'),

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

export const consultationService = {
  create: (data) =>
    api.post('/consultations/', data),
  getAll: (params = {}) =>
    api.get('/consultations/', { params }),
  getById: (id) =>
    api.get(`/consultations/${id}/`),
  submit: (id) =>
    api.post(`/consultations/${id}/submit/`),
  approve: (id, signature) =>
    api.post(`/consultations/${id}/approve/`, { typed_signature: signature }),
  reject: (id, comment) =>
    api.post(`/consultations/${id}/reject/`, { comment }),
  uploadMinutes: (id, data) =>
    api.post(`/consultations/${id}/upload-minutes/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
}
