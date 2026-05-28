import api from './api';

const getMyProfile = () =>
  api.get('/users/me').then((r) => r.data);

const updateMyProfile = (data) =>
  api.put('/users/me', data).then((r) => r.data);

const getPublicProfile = (userId) =>
  api.get(`/users/${userId}`).then((r) => r.data);

export default { getMyProfile, updateMyProfile, getPublicProfile };


