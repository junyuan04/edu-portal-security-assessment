const { Router }         = require('express');
const controller         = require('./enrolments.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');

const router = Router();

router.use(authMiddleware);

router.get('/my',  controller.getMyEnrolments); // GET  /enrolments/my      — own records only
router.get('/:id', controller.getEnrolment);    // GET  /enrolments/:id     — [VULN-V3] no ownership check
router.post('/',   controller.createEnrolment); // POST /enrolments

module.exports = router;