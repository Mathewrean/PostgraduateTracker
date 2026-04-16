import api from './api.js'

export const documentService = {
  getAll: () => api.get('/documents/'),
  upload: (formData) => api.post('/documents/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}
