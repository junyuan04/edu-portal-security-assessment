import api from './api';

const register = (email, username, password, fullName) =>
  api.post('/auth/register', { email, username, password, fullName }).then((r) => r.data);

const login = (email, password) =>
  api.post('/auth/login', { email, password }).then((r) => r.data);

const logout = () =>
  api.post('/auth/logout').then((r) => r.data);

const getMe = () =>
  api.get('/auth/me').then((r) => r.data);

export default { register, login, logout, getMe };


