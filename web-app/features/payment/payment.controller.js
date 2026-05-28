const service = require('./payment.service');

const getMyPayments = async (req, res, next) => {
  try {
    const payments = await service.getMyPayments(req.user.id);
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

const getPayment = async (req, res, next) => {
  try {
    const payment = await service.getPaymentById(Number(req.params.id), req.user.id);
    res.json(payment);
  } catch (err) {
    next(err);
  }
};

const createPayment = async (req, res, next) => {
  try {
    const { courseId, paymentMethod, cardLastFour } = req.body;

    if (!courseId || !paymentMethod) {
      return res.status(400).json({ error: 'courseId and paymentMethod are required' });
    }

    const payment = await service.createPayment(req.user.id, {
      courseId: Number(courseId),
      paymentMethod,
      cardLastFour,
    });

    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyPayments, getPayment, createPayment };


