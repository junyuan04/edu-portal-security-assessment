const db    = require('../../config/db');
const model = require('./course.model');

const getAllCourses = async (categoryId) => {
  return model.findAllPublished(categoryId || null);
};

const searchCourses = async (keyword) => {
  if (!keyword || keyword.trim() === '') {
    return model.findAllPublished(null);
  }
  return model.search(keyword);   // unsanitised keyword passed through
};

const getCourseById = async (id) => {
  const course = await model.findById(id);
  if (!course) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  return course;
};

const getCourseBySlug = async (slug) => {
  const course = await model.findBySlug(slug);
  if (!course) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  return course;
};

// Check enrolment status to determine which materials to return
const getCourseMaterials = async (courseId, userId) => {
  await getCourseById(courseId);

  let isEnrolled = false;
  if (userId) {
    const [rows] = await db.query(
      'SELECT id FROM enrolments WHERE user_id = ? AND course_id = ? AND status = "active"',
      [userId, courseId]
    );
    isEnrolled = rows.length > 0;
  }

  return model.getMaterials(courseId, isEnrolled);
};

const getCourseReviews = async (courseId) => {
  await getCourseById(courseId);
  return model.getReviews(courseId);
};

const addReview = async (courseId, userId, { rating, comment }) => {
  if (!rating || rating < 1 || rating > 5) {
    const err = new Error('Rating must be between 1 and 5');
    err.status = 400;
    throw err;
  }

  // Only enrolled students can review
  const [rows] = await db.query(
    'SELECT id FROM enrolments WHERE user_id = ? AND course_id = ?',
    [userId, courseId]
  );

  if (rows.length === 0) {
    const err = new Error('You must be enrolled to leave a review');
    err.status = 403;
    throw err;
  }

  await model.upsertReview(courseId, userId, rating, comment);
  return model.getReviews(courseId);
};

const getMyReviewForCourse = async (courseId, userId) => {
  return model.findMyReviewForCourse(userId, courseId);
};

const updateReview = async (reviewId, userId, { rating, comment }) => {
  const review = await model.findReviewById(reviewId);
  if (!review) {
    const err = new Error('Review not found');
    err.status = 404;
    throw err;
  }
  if (review.user_id !== userId) {
    const err = new Error('You can only edit your own review');
    err.status = 403;
    throw err;
  }
  if (rating !== undefined && (rating < 1 || rating > 5)) {
    const err = new Error('Rating must be between 1 and 5');
    err.status = 400;
    throw err;
  }
  if (rating === undefined && comment === undefined) {
    const err = new Error('Provide rating or comment to update');
    err.status = 400;
    throw err;
  }

  await model.updateReview(reviewId, { rating, comment });
  return model.findReviewById(reviewId);
};

const deleteReview = async (reviewId, user) => {
  const review = await model.findReviewById(reviewId);
  if (!review) {
    const err = new Error('Review not found');
    err.status = 404;
    throw err;
  }
  if (review.user_id !== user.id && user.role !== 'admin') {
    const err = new Error('You can only delete your own review');
    err.status = 403;
    throw err;
  }
  await model.deleteReview(reviewId);
  return { message: 'Review deleted' };
};

const slugify = (text) =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);

const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'];
const VALID_MATERIAL_TYPES = ['video', 'document', 'quiz', 'link'];

const createCourse = async (instructorId, data) => {
  if (!data.title || !data.categoryId) {
    const err = new Error('title and categoryId are required');
    err.status = 400;
    throw err;
  }
  if (data.level && !VALID_LEVELS.includes(data.level)) {
    const err = new Error(`level must be one of: ${VALID_LEVELS.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const slug = data.slug?.trim() || slugify(data.title);
  const id   = await model.createCourse({
    ...data,
    instructorId: data.instructorId || instructorId,
    slug,
  });
  return model.findById(id);
};

const updateCourse = async (id, data) => {
  const course = await model.findById(id);
  if (!course) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  if (data.level && !VALID_LEVELS.includes(data.level)) {
    const err = new Error(`level must be one of: ${VALID_LEVELS.join(', ')}`);
    err.status = 400;
    throw err;
  }
  await model.updateCourse(id, data);
  return model.findById(id);
};

const deleteCourse = async (id) => {
  const affected = await model.deleteCourse(id);
  if (affected === 0) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  return { message: 'Course deleted' };
};

const createMaterial = async (courseId, data) => {
  await getCourseById(courseId);
  if (!data.title) {
    const err = new Error('title is required');
    err.status = 400;
    throw err;
  }
  if (data.materialType && !VALID_MATERIAL_TYPES.includes(data.materialType)) {
    const err = new Error(`materialType must be one of: ${VALID_MATERIAL_TYPES.join(', ')}`);
    err.status = 400;
    throw err;
  }
  const id = await model.createMaterial(courseId, data);
  return model.findMaterialById(id);
};

const updateMaterial = async (matId, data) => {
  const material = await model.findMaterialById(matId);
  if (!material) {
    const err = new Error('Material not found');
    err.status = 404;
    throw err;
  }
  if (data.materialType && !VALID_MATERIAL_TYPES.includes(data.materialType)) {
    const err = new Error(`materialType must be one of: ${VALID_MATERIAL_TYPES.join(', ')}`);
    err.status = 400;
    throw err;
  }
  await model.updateMaterial(matId, data);
  return model.findMaterialById(matId);
};

const deleteMaterial = async (matId) => {
  const affected = await model.deleteMaterial(matId);
  if (affected === 0) {
    const err = new Error('Material not found');
    err.status = 404;
    throw err;
  }
  return { message: 'Material deleted' };
};

module.exports = {
  getAllCourses,
  searchCourses,
  getCourseById,
  getCourseBySlug,
  getCourseMaterials,
  getCourseReviews,
  addReview, getMyReviewForCourse, updateReview, deleteReview,
  createCourse, updateCourse, deleteCourse,
  createMaterial, updateMaterial, deleteMaterial,
};


