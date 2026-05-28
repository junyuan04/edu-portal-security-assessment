const { Router }         = require('express');
const controller         = require('./course.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');

const router = Router();

router.get('/',              controller.listCourses);      // GET /api/courses
router.get('/search',        controller.searchCourses);    // GET /api/courses/search?q=
router.get('/slug/:slug',    controller.getCourseBySlug);  // GET /api/courses/slug/:slug
router.get('/:id',           controller.getCourseById);    // GET /api/courses/:id
router.get('/:id/reviews',   controller.getCourseReviews); // GET /api/courses/:id/reviews

router.get('/:id/materials', authMiddleware, controller.getCourseMaterials);

router.post('/:id/reviews',  authMiddleware, controller.addReview); // POST /api/courses/:id/reviews

module.exports = router;


