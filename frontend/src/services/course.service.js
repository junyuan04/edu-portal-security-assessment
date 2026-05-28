import api from './api';

const getAllCourses = (categoryId) =>
  api.get('/courses', { params: categoryId ? { category: categoryId } : {} }).then((r) => r.data);

const searchCourses = (keyword) =>
  api.get('/courses/search', { params: { q: keyword } }).then((r) => r.data);

const getCourseById = (id) =>
  api.get(`/courses/${id}`).then((r) => r.data);

const getCourseBySlug = (slug) =>
  api.get(`/courses/slug/${slug}`).then((r) => r.data);

const getCourseMaterials = (courseId) =>
  api.get(`/courses/${courseId}/materials`).then((r) => r.data);

const getCourseReviews = (courseId) =>
  api.get(`/courses/${courseId}/reviews`).then((r) => r.data);

const addReview = (courseId, rating, comment) =>
  api.post(`/courses/${courseId}/reviews`, { rating, comment }).then((r) => r.data);

export default {
  getAllCourses,
  searchCourses,
  getCourseById,
  getCourseBySlug,
  getCourseMaterials,
  getCourseReviews,
  addReview,
};


