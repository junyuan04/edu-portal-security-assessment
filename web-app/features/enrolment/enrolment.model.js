const db = require('../../config/db');

// All enrolments belonging to a user
const findByUserId = async (userId) => {
  const [rows] = await db.query(
    `SELECT e.id, e.status, e.progress_pct, e.enrolled_at, e.completed_at,
            c.id AS course_id, c.title, c.slug, c.thumbnail_url,
            c.level, c.duration_hrs, cat.name AS category
     FROM enrolments e
     JOIN courses    c   ON c.id  = e.course_id
     JOIN categories cat ON cat.id = c.category_id
     WHERE e.user_id = ?
     ORDER BY e.enrolled_at DESC`,
    [userId]
  );
  return rows;
};

// Single enrolment (ownership enforced by including user_id in WHERE)
const findById = async (id, userId) => {
  const [rows] = await db.query(
    `SELECT e.id, e.user_id, e.status, e.progress_pct, e.enrolled_at, e.completed_at,
            c.id AS course_id, c.title, c.slug, c.thumbnail_url, c.price
     FROM enrolments e
     JOIN courses c ON c.id = e.course_id
     WHERE e.id = ? AND e.user_id = ?`,
    [id, userId]
  );
  return rows[0] || null;
};

// Check if a user is already enrolled in a course
const findByUserAndCourse = async (userId, courseId) => {
  const [rows] = await db.query(
    'SELECT id, status FROM enrolments WHERE user_id = ? AND course_id = ?',
    [userId, courseId]
  );
  return rows[0] || null;
};

// Create a new enrolment
const create = async (userId, courseId) => {
  const [result] = await db.query(
    'INSERT INTO enrolments (user_id, course_id) VALUES (?, ?)',
    [userId, courseId]
  );
  return result.insertId;
};

// Update progress
const updateProgress = async (id, userId, progressPct) => {
  const status = progressPct >= 100 ? 'completed' : 'active';
  const completedAt = progressPct >= 100 ? new Date() : null;

  const [result] = await db.query(
    `UPDATE enrolments
     SET progress_pct = ?, status = ?, completed_at = ?
     WHERE id = ? AND user_id = ?`,
    [progressPct, status, completedAt, id, userId]
  );
  return result.affectedRows;
};

// Cancel enrolment
const cancel = async (id, userId) => {
  const [result] = await db.query(
    `UPDATE enrolments SET status = 'cancelled' WHERE id = ? AND user_id = ?`,
    [id, userId]
  );
  return result.affectedRows;
};

// Reactivate a previously cancelled enrolment
const reactivate = async (id) => {
  const [result] = await db.query(
    `UPDATE enrolments
     SET status = 'active', progress_pct = 0, completed_at = NULL, enrolled_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [id]
  );
  return result.affectedRows;
};

module.exports = { findByUserId, findById, findByUserAndCourse, create, updateProgress, cancel, reactivate };


