import api from './api.js'

export const activityService = {
  getAll: () => api.get('/activities/'),
  markDone: (id) => api.patch(`/activities/${id}/done/`),
}
