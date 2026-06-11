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

const getMyReview = (courseId) =>
  api.get(`/courses/${courseId}/reviews/mine`).then((r) => r.data);

const updateReview = (courseId, reviewId, data) =>
  api.put(`/courses/${courseId}/reviews/${reviewId}`, data).then((r) => r.data);

const deleteReview = (courseId, reviewId) =>
  api.delete(`/courses/${courseId}/reviews/${reviewId}`).then((r) => r.data);

const createCourse = (data) =>
  api.post('/courses', data).then((r) => r.data);

const updateCourse = (id, data) =>
  api.put(`/courses/${id}`, data).then((r) => r.data);

const deleteCourse = (id) =>
  api.delete(`/courses/${id}`).then((r) => r.data);

const createMaterial = (courseId, data) =>
  api.post(`/courses/${courseId}/materials`, data).then((r) => r.data);

const updateMaterial = (courseId, matId, data) =>
  api.put(`/courses/${courseId}/materials/${matId}`, data).then((r) => r.data);

const deleteMaterial = (courseId, matId) =>
  api.delete(`/courses/${courseId}/materials/${matId}`).then((r) => r.data);

export default {
  getAllCourses,
  searchCourses,
  getCourseById,
  getCourseBySlug,
  getCourseMaterials,
  getCourseReviews,
  addReview, getMyReview, updateReview, deleteReview,
  createCourse, updateCourse, deleteCourse,
  createMaterial, updateMaterial, deleteMaterial,
};


