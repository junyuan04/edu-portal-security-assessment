const { Router }         = require('express');
const controller         = require('./payment.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');

const router = Router();

router.use(authMiddleware);

router.get('/my',  controller.getMyPayments); // GET  /api/payments/my
router.post('/',   controller.createPayment); // POST /api/payments
router.get('/:id', controller.getPayment);    // GET  /api/payments/:id

module.exports = router;


