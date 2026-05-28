import buildClient from './api';

// Returns full axios response
const getAll = (token, categoryId) => {
  const client = buildClient(token);
  const params = categoryId ? { category: categoryId } : {};
  return client.get('/courses', { params });
};

const search = (token, keyword) =>
  buildClient(token).get('/courses/search', { params: { q: keyword } });

const getById = (token, id) =>
  buildClient(token).get(`/courses/${id}`);

const getMaterials = (token, id) =>
  buildClient(token).get(`/courses/${id}/materials`);

export default { getAll, search, getById, getMaterials };


