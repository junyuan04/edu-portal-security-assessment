const { v4: uuidv4 } = require('uuid');
const db             = require('../../config/db');
const model          = require('./payment.model');

const VALID_PAYMENT_METHODS = ['credit_card', 'online_banking', 'e_wallet'];

const getMyPayments = async (userId) => {
  return model.findByUserId(userId);
};

const getPaymentById = async (id, userId) => {
  const payment = await model.findById(id, userId);

  if (!payment) {
    const err = new Error('Payment not found');
    err.status = 404;
    throw err;
  }

  return payment;
};

const createPayment = async (userId, { courseId, paymentMethod, cardLastFour }) => {
  if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    const err = new Error(`paymentMethod must be one of: ${VALID_PAYMENT_METHODS.join(', ')}`);
    err.status = 400;
    throw err;
  }

  if (paymentMethod === 'credit_card' && (!cardLastFour || !/^\d{4}$/.test(cardLastFour))) {
    const err = new Error('cardLastFour must be exactly 4 digits for credit card payments');
    err.status = 400;
    throw err;
  }

  const [courseRows] = await db.query(
    'SELECT id, price FROM courses WHERE id = ? AND is_published = 1',
    [courseId]
  );

  if (courseRows.length === 0) {
    const err = new Error('Course not found or unavailable');
    err.status = 404;
    throw err;
  }

  const { price } = courseRows[0];

  const [existingPayment] = await db.query(
    'SELECT id FROM payments WHERE user_id = ? AND course_id = ? AND status = "completed"',
    [userId, courseId]
  );

  if (existingPayment.length > 0) {
    // Allow the user to skip re-paying for a course they cancelled
    const [enrolRows] = await db.query(
      'SELECT id, status FROM enrolments WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );
    const enrol = enrolRows[0];
    if (enrol && enrol.status === 'cancelled') {
      await model.createEnrolment(userId, courseId); // upserts → active
      return model.findById(existingPayment[0].id, userId);
    }
    const err = new Error('Course already purchased');
    err.status = 409;
    throw err;
  }

  const paymentId = await model.create(userId, courseId, price, paymentMethod, cardLastFour);

  // Mock payment processing (instantly marks as completed)
  const transactionRef = `TXN-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`;
  await model.updateStatus(paymentId, 'completed', transactionRef);

  await model.createEnrolment(userId, courseId);

  return model.findById(paymentId, userId);
};

module.exports = { getMyPayments, getPaymentById, createPayment };


