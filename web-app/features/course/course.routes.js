const { Router }                          = require('express');
const controller                          = require('./course.controller');
const { authMiddleware, adminMiddleware } = require('../../middleware/auth.middleware');

const router = Router();

// Public
router.get('/',              controller.listCourses);      // GET /api/courses
router.get('/search',        controller.searchCourses);    // GET /api/courses/search?q=
router.get('/slug/:slug',    controller.getCourseBySlug);  // GET /api/courses/slug/:slug
router.get('/:id',           controller.getCourseById);    // GET /api/courses/:id
router.get('/:id/reviews',   controller.getCourseReviews); // GET /api/courses/:id/reviews

// Auth-required reads / writes
router.get('/:id/materials',        authMiddleware, controller.getCourseMaterials);
router.get('/:id/reviews/mine',     authMiddleware, controller.getMyReview);    // GET    /api/courses/:id/reviews/mine
router.post('/:id/reviews',         authMiddleware, controller.addReview);
router.put('/:id/reviews/:reviewId',authMiddleware, controller.updateReview);   // PUT    /api/courses/:id/reviews/:reviewId
router.delete('/:id/reviews/:reviewId', authMiddleware, controller.deleteReview); // DELETE /api/courses/:id/reviews/:reviewId

// Admin-only course writes
router.post('/',     authMiddleware, adminMiddleware, controller.createCourse); // POST   /api/courses
router.put('/:id',   authMiddleware, adminMiddleware, controller.updateCourse); // PUT    /api/courses/:id
router.delete('/:id',authMiddleware, adminMiddleware, controller.deleteCourse); // DELETE /api/courses/:id

// Admin-only material writes
router.post('/:id/materials',           authMiddleware, adminMiddleware, controller.createMaterial); // POST   /api/courses/:id/materials
router.put('/:id/materials/:matId',     authMiddleware, adminMiddleware, controller.updateMaterial); // PUT    /api/courses/:id/materials/:matId
router.delete('/:id/materials/:matId',  authMiddleware, adminMiddleware, controller.deleteMaterial); // DELETE /api/courses/:id/materials/:matId

module.exports = router;
