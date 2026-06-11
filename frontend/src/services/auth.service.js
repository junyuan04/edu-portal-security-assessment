import api from './api';

const register = (email, username, password, fullName) =>
  api.post('/auth/register', { email, username, password, fullName }).then((r) => r.data);

const login = (email, password) =>
  api.post('/auth/login', { email, password }).then((r) => r.data);

const logout = () =>
  api.post('/auth/logout').then((r) => r.data);

const getMe = () =>
  api.get('/auth/me').then((r) => r.data);

const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email }).then((r) => r.data);

const resetPassword = (token, password) =>
  api.post('/auth/reset-password', { token, password }).then((r) => r.data);

export default { register, login, logout, getMe, forgotPassword, resetPassword };


