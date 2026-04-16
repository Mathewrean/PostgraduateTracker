import api from './api'

export const authService = {
  login: (email, password) =>
    api.post('/auth/token/', { email, password }),
  
  register: (data) =>
    api.post('/users/', data),
  
  logout: (refreshToken) =>
    api.post('/users/logout/', { refresh: refreshToken }),
  
  getCurrentUser: () =>
    api.get('/users/me/'),
  
  updateProfile: (data) =>
    api.post('/users/update_profile/', data),
}

export const studentService = {
  getProfile: () =>
    api.get('/students/profile/'),
  
  updateProfile: (data) =>
    api.post('/students/profile/', data),
  
  getAll: () =>
    api.get('/students/'),
}

export const stageService = {
  getCurrentStage: () =>
    api.get('/stages/current_stage/'),
  
  getAll: () =>
    api.get('/stages/'),
  
  approve: (stageId) =>
    api.post(`/stages/${stageId}/approve/`),
}

export const activityService = {
  create: (data) =>
    api.post('/activities/', data),
  
  getAll: () =>
    api.get('/activities/'),
  
  getCalendar: (stageId) =>
    api.get('/activities/calendar/', { params: { stage_id: stageId } }),
  
  markDone: (activityId) =>
    api.post(`/activities/${activityId}/mark_done/`),
}

export const documentService = {
  upload: (data) => {
    const formData = new FormData()
    formData.append('file', data.file)
    formData.append('stage', data.stage)
    formData.append('doc_type', data.doc_type)
    return api.post('/documents/documents/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  
  getAll: () =>
    api.get('/documents/documents/'),
  
  verify: (docId) =>
    api.post(`/documents/documents/${docId}/verify/`),
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
    api.get('/notifications/notifications/'),
  
  markAsRead: (notificationId) =>
    api.post(`/notifications/notifications/${notificationId}/mark_as_read/`),
  
  markAllAsRead: () =>
    api.post('/notifications/notifications/mark_all_as_read/'),
  
  getUnreadCount: () =>
    api.get('/notifications/notifications/unread_count/'),
}

export const reportService = {
  getStudentProgress: (range = 'all') =>
    api.get('/reports/student_progress/', { params: { range } }),
  
  getSupervisorReport: () =>
    api.get('/reports/supervisor_report/'),
  
  getLoginHistory: () =>
    api.get('/reports/login_history/'),
  
  getComplaintReport: () =>
    api.get('/reports/complaint_report/'),
  
  getActivityLog: (range = 'week') =>
    api.get('/reports/activity_log/', { params: { range } }),
  
  getStageTransitionReport: () =>
    api.get('/reports/stage_transition_report/'),
}
