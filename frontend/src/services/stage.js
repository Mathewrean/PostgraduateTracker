import api from './api.js'

export const stageService = {
  getCurrentStage: () => api.get('/stages/current/'),
  getAll: () => api.get('/stages/'),
}
