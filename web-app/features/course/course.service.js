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

module.exports = {
  getAllCourses,
  searchCourses,
  getCourseById,
  getCourseBySlug,
  getCourseMaterials,
  getCourseReviews,
  addReview,
};


