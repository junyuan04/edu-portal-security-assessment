const db = require('../../config/db');

const findByUserId = async (userId) => {
  const [rows] = await db.query(
    `SELECT e.id, e.status, e.progress_pct, e.enrolled_at, e.completed_at,
            c.id AS course_id, c.title, c.slug, c.thumbnail_url, c.level,
            cat.name AS category
     FROM enrolments e
     JOIN courses    c   ON c.id   = e.course_id
     JOIN categories cat ON cat.id = c.category_id
     WHERE e.user_id = ?
     ORDER BY e.enrolled_at DESC`,
    [userId]
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await db.query(
    `SELECT e.id, e.user_id, e.status, e.progress_pct, e.enrolled_at, e.completed_at,
            c.id AS course_id, c.title, c.slug, c.price,
            u.username, u.email
     FROM enrolments e
     JOIN courses c ON c.id = e.course_id
     JOIN users   u ON u.id = e.user_id
     WHERE e.id = ?`,   
    [id]
  );
  return rows[0] || null;
};

const create = async (userId, courseId) => {
  const [result] = await db.query(
    'INSERT IGNORE INTO enrolments (user_id, course_id) VALUES (?, ?)',
    [userId, courseId]
  );
  return result.insertId;
};

const findByUserAndCourse = async (userId, courseId) => {
  const [rows] = await db.query(
    'SELECT id FROM enrolments WHERE user_id = ? AND course_id = ?',
    [userId, courseId]
  );
  return rows[0] || null;
};

module.exports = { findByUserId, findById, create, findByUserAndCourse };


