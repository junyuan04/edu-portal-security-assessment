import api from './api';

const getDashboardStats = () =>
  api.get('/admin/dashboard').then((r) => r.data);

const getAllUsers = (page = 1, limit = 20) =>
  api.get('/admin/users', { params: { page, limit } }).then((r) => r.data);

const getUserById = (id) =>
  api.get(`/admin/users/${id}`).then((r) => r.data);

const toggleUserStatus = (id, isActive) =>
  api.put(`/admin/users/${id}/status`, { isActive }).then((r) => r.data);

const getAllCourses = () =>
  api.get('/admin/courses').then((r) => r.data);

const toggleCoursePublished = (id, isPublished) =>
  api.put(`/admin/courses/${id}/publish`, { isPublished }).then((r) => r.data);

const getAuditLogs = (limit = 50) =>
  api.get('/admin/audit-logs', { params: { limit } }).then((r) => r.data);

const getAnnouncements = () =>
  api.get('/admin/announcements').then((r) => r.data);

const createAnnouncement = (title, body) =>
  api.post('/admin/announcements', { title, body }).then((r) => r.data);

const updateAnnouncement = (id, data) =>
  api.put(`/admin/announcements/${id}`, data).then((r) => r.data);

const deleteAnnouncement = (id) =>
  api.delete(`/admin/announcements/${id}`).then((r) => r.data);

const deleteUser = (id) =>
  api.delete(`/admin/users/${id}`).then((r) => r.data);

const getSecureMode = () =>
  api.get('/system/secure-mode').then((r) => !!r.data?.secure);

const setSecureMode = (secure) =>
  api.put('/system/secure-mode', { secure })
    .then((r) => ({ secure: !!r.data?.secure, token: r.data?.token || null }));

export default {
  getDashboardStats,
  getAllUsers, getUserById, toggleUserStatus, deleteUser,
  getAllCourses, toggleCoursePublished,
  getAuditLogs,
  getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
  getSecureMode, setSecureMode,
};


