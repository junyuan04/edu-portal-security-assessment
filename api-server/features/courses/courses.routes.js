const { Router }         = require('express');
const controller         = require('./courses.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');

const router = Router();

router.get('/',            controller.listCourses);       // GET /courses
router.get('/search',      controller.searchCourses);     // GET /courses/search?q=
router.get('/:id',         controller.getCourse);         // GET /courses/:id
router.get('/:id/materials', authMiddleware, controller.getCourseMaterials); // GET /courses/:id/materials

module.exports = router;


