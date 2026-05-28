import buildClient from './api';

const getMe = (token) =>
  buildClient(token).get('/users/me');

const getById = (token, id) =>
  buildClient(token).get(`/users/${id}`);

export default { getMe, getById };


