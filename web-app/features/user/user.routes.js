const { Router }         = require('express');
const controller         = require('./user.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');

const router = Router();

router.use(authMiddleware);

router.get('/me',     controller.getMyProfile);     // GET  /api/users/me
router.put('/me',     controller.updateMyProfile);  // PUT  /api/users/me
router.get('/:id',    controller.getPublicProfile); // GET  /api/users/:id

module.exports = router;


