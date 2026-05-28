import api from './api';

const getMyEnrolments = () =>
  api.get('/enrolments/my').then((r) => r.data);

const getEnrolment = (id) =>
  api.get(`/enrolments/${id}`).then((r) => r.data);

const enrol = (courseId) =>
  api.post('/enrolments', { courseId }).then((r) => r.data);

const updateProgress = (id, progressPct) =>
  api.put(`/enrolments/${id}/progress`, { progressPct }).then((r) => r.data);

const cancelEnrolment = (id) =>
  api.delete(`/enrolments/${id}`).then((r) => r.data);

export default { getMyEnrolments, getEnrolment, enrol, updateProgress, cancelEnrolment };


