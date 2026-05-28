import buildClient from './api';

// GET /enrolments/my (returns only the authenticated user's enrolments)
const getMy = (token) =>
  buildClient(token).get('/enrolments/my');

const getById = (token, id) =>
  buildClient(token).get(`/enrolments/${id}`); 

const create = (token, courseId) =>
  buildClient(token).post('/enrolments', { courseId });

export default { getMy, getById, create };


