const { Router }         = require('express');
const controller         = require('./users.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');

const router = Router();

router.use(authMiddleware);

router.get('/me',  controller.getMyProfile);
router.get('/:id', controller.getPublicProfile);

module.exports = router;


