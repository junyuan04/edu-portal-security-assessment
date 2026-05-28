const { Router }         = require('express');
const controller         = require('./enrolment.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');

const router = Router();

router.use(authMiddleware);

router.get('/my',             controller.getMyEnrolments); // GET    /api/enrolments/my
router.post('/',              controller.enrol);            // POST   /api/enrolments
router.get('/:id',            controller.getEnrolment);    // GET    /api/enrolments/:id
router.put('/:id/progress',   controller.updateProgress);  // PUT    /api/enrolments/:id/progress
router.delete('/:id',         controller.cancelEnrolment); // DELETE /api/enrolments/:id

module.exports = router;