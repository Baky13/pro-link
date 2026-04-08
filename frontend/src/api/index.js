import api from './axios'

// Auth
export const authApi = {
  register: data => api.post('/auth/register', data),
  login: data => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: email => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
}

// Vacancies
export const vacancyApi = {
  getAll: params => api.get('/vacancies', { params }),
  getHot: params => api.get('/vacancies/hot', { params }),
  getUrgent: params => api.get('/vacancies/urgent', { params }),
  getById: id => api.get(`/vacancies/${id}`),
  create: data => api.post('/vacancies', data),
  update: (id, data) => api.put(`/vacancies/${id}`, data),
  delete: id => api.delete(`/vacancies/${id}`),
  getMy: params => api.get('/vacancies/my', { params }),
  toggleSave: id => api.post(`/vacancies/${id}/save`),
  getSaved: params => api.get('/vacancies/saved', { params }),
}

// Applications
export const applicationApi = {
  apply: data => api.post('/applications', data),
  getMy: params => api.get('/applications/my', { params }),
  check: vacancyId => api.get('/applications/check', { params: { vacancyId } }),
  getByVacancy: (vacancyId, params) => api.get(`/applications/vacancy/${vacancyId}`, { params }),
  updateStatus: (id, status) => api.patch(`/applications/${id}/status`, { status }),
  cancel: id => api.delete(`/applications/${id}`),
}

// Profiles
export const profileApi = {
  getWorkerById: id => api.get(`/workers/${id}`),
  searchWorkers: params => api.get('/workers', { params }),
  getWorker: () => api.get('/worker/profile'),
  updateWorker: data => api.put('/worker/profile', data),
  getEmployer: () => api.get('/employer/profile'),
  updateEmployer: data => api.put('/employer/profile', data),
  getEmployerById: id => api.get(`/employers/${id}`),
  uploadFile: (type, file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/upload/${type}`, form)
  },
}

// Reviews
export const reviewApi = {
  add: (employerId, data) => api.post(`/employers/${employerId}/reviews`, data),
  getAll: (employerId, params) => api.get(`/employers/${employerId}/reviews`, { params }),
}

// Company feedback - не реализовано на бэкенде, оставлено для будущего
// export const feedbackApi = { ... }

// Chat
export const chatApi = {
  getRooms: () => api.get('/chat/rooms'),
  getArchivedRooms: () => api.get('/chat/rooms/archived'),
  getOrCreateRoom: applicationId => api.post(`/chat/rooms/application/${applicationId}`),
  getOrCreateDirectRoom: targetUserId => api.post(`/chat/rooms/direct/${targetUserId}`),
  getOrCreateDirectRoom: targetUserId => api.post(`/chat/rooms/direct/${targetUserId}`),
  getMessages: (roomId, params) => api.get(`/chat/rooms/${roomId}/messages`, { params }),
  sendMessage: (roomId, content) => api.post(`/chat/rooms/${roomId}/messages`, { content }),
  archiveRoom: roomId => api.patch(`/chat/rooms/${roomId}/archive`),
  unarchiveRoom: roomId => api.patch(`/chat/rooms/${roomId}/unarchive`),
  deleteRoom: roomId => api.delete(`/chat/rooms/${roomId}`),
}

// Categories
export const categoryApi = {
  getAll: () => api.get('/categories'),
}

// Notifications
export const notificationApi = {
  getAll: params => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAllRead: () => api.post('/notifications/read-all'),
  markChatRead: roomId => api.post(`/notifications/read-chat/${roomId}`),
}
