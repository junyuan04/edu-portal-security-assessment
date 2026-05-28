import api from './api';

const getMyPayments = () =>
  api.get('/payments/my').then((r) => r.data);

const getPayment = (id) =>
  api.get(`/payments/${id}`).then((r) => r.data);

const createPayment = (courseId, paymentMethod, cardLastFour) =>
  api.post('/payments', { courseId, paymentMethod, cardLastFour }).then((r) => r.data);

export default { getMyPayments, getPayment, createPayment };


