const { Router }        = require('express');
const controller        = require('./auth.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');

const router = Router();

router.post('/register', controller.register);
router.post('/login',    controller.login);
router.post('/logout',   controller.logout);

router.get('/me', authMiddleware, controller.getMe);

module.exports = router;