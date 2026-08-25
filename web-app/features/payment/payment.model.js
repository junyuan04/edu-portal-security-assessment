const db = require('../../config/db');

const findByUserId = async (userId) => {
  const [rows] = await db.query(
    `SELECT p.id, p.amount, p.currency, p.status, p.payment_method,
            p.transaction_ref, p.card_last_four, p.created_at,
            c.id AS course_id, c.title AS course_title, c.thumbnail_url
     FROM payments p
     JOIN courses c ON c.id = p.course_id
     WHERE p.user_id = ?
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return rows;
};

const findById = async (id, userId) => {
  const [rows] = await db.query(
    `SELECT p.id, p.amount, p.currency, p.status, p.payment_method,
            p.transaction_ref, p.card_last_four, p.created_at, p.updated_at,
            c.id AS course_id, c.title AS course_title, c.price
     FROM payments p
     JOIN courses c ON c.id = p.course_id
     WHERE p.id = ? AND p.user_id = ?`,
    [id, userId]
  );
  return rows[0] || null;
};

// Insert a new payment record with pending status
const create = async (userId, courseId, amount, paymentMethod, cardLastFour) => {
  const [result] = await db.query(
    `INSERT INTO payments (user_id, course_id, amount, payment_method, card_last_four, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    [userId, courseId, amount, paymentMethod, cardLastFour || null]
  );
  return result.insertId;
};

const updateStatus = async (id, status, transactionRef) => {
  await db.query(
    'UPDATE payments SET status = ?, transaction_ref = ? WHERE id = ?',
    [status, transactionRef, id]
  );
};

// Enrol user after successful payment
const createEnrolment = async (userId, courseId) => {
  await db.query(
    `INSERT INTO enrolments (user_id, course_id, status, progress_pct, enrolled_at, completed_at)
     VALUES (?, ?, 'active', 0, CURRENT_TIMESTAMP, NULL)
     ON DUPLICATE KEY UPDATE
       status       = 'active',
       progress_pct = 0,
       enrolled_at  = CURRENT_TIMESTAMP,
       completed_at = NULL`,
    [userId, courseId]
  );
};

module.exports = { findByUserId, findById, create, updateStatus, createEnrolment };


