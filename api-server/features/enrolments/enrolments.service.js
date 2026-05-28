const db    = require('../../config/db');
const model = require('./enrolments.model');

const getMyEnrolments = async (userId) => {
  return model.findByUserId(userId);
};


const getEnrolmentById = async (id) => {
  const enrolment = await model.findById(id); 
  if (!enrolment) {
    const err = new Error('Enrolment not found');
    err.status = 404;
    throw err;
  }
  return enrolment;
};

const createEnrolment = async (userId, courseId) => {
  const [courseRows] = await db.query(
    'SELECT id FROM courses WHERE id = ? AND is_published = 1',
    [courseId]
  );
  if (courseRows.length === 0) {
    const err = new Error('Course not found or unavailable');
    err.status = 404;
    throw err;
  }

  const existing = await model.findByUserAndCourse(userId, courseId);
  if (existing) {
    const err = new Error('Already enrolled in this course');
    err.status = 409;
    throw err;
  }

  const id = await model.create(userId, courseId);
  return model.findById(id);  
};

module.exports = { getMyEnrolments, getEnrolmentById, createEnrolment };


