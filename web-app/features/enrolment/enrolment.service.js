const db    = require('../../config/db');
const model = require('./enrolment.model');

const getMyEnrolments = async (userId) => {
  return model.findByUserId(userId);
};

const getEnrolmentById = async (id, userId) => {
  const enrolment = await model.findById(id, userId);

  if (!enrolment) {
    const err = new Error('Enrolment not found');
    err.status = 404;
    throw err;
  }

  return enrolment;
};

const enrolInCourse = async (userId, courseId) => {
  const [courseRows] = await db.query(
    'SELECT id, price FROM courses WHERE id = ? AND is_published = 1',
    [courseId]
  );

  if (courseRows.length === 0) {
    const err = new Error('Course not found or unavailable');
    err.status = 404;
    throw err;
  }

  // Reactivate a cancelled enrolment instead of blocking it
  const existing = await model.findByUserAndCourse(userId, courseId);
  if (existing) {
    if (existing.status === 'cancelled') {
      await model.reactivate(existing.id);
      return model.findById(existing.id, userId);
    }
    const err = new Error('Already enrolled in this course');
    err.status = 409;
    throw err;
  }

  const id = await model.create(userId, courseId);
  return model.findById(id, userId);
};

const updateProgress = async (id, userId, progressPct) => {
  if (progressPct < 0 || progressPct > 100) {
    const err = new Error('Progress must be between 0 and 100');
    err.status = 400;
    throw err;
  }

  const affected = await model.updateProgress(id, userId, progressPct);

  if (affected === 0) {
    const err = new Error('Enrolment not found');
    err.status = 404;
    throw err;
  }

  return model.findById(id, userId);
};

const cancelEnrolment = async (id, userId) => {
  const affected = await model.cancel(id, userId);

  if (affected === 0) {
    const err = new Error('Enrolment not found');
    err.status = 404;
    throw err;
  }

  return { message: 'Enrolment cancelled' };
};

module.exports = {
  getMyEnrolments,
  getEnrolmentById,
  enrolInCourse,
  updateProgress,
  cancelEnrolment,
};


