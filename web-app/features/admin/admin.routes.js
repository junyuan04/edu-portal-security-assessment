const { Router }                        = require('express');
const controller                        = require('./admin.controller');
const { authMiddleware, adminMiddleware } = require('../../middleware/auth.middleware');

const router = Router();

router.use(authMiddleware, adminMiddleware); 

router.get('/dashboard',                   controller.getDashboardStats);

router.get('/users',                       controller.getAllUsers);
router.get('/users/:id',                   controller.getUserById);
router.put('/users/:id/status',            controller.toggleUserStatus);
router.delete('/users/:id',                controller.deleteUser);

router.get('/courses',                     controller.getAllCourses);
router.put('/courses/:id/publish',         controller.toggleCoursePublished);

router.get('/audit-logs',                  controller.getAuditLogs);

router.get('/announcements',               controller.getAnnouncements);
router.post('/announcements',              controller.createAnnouncement);
router.put('/announcements/:id',           controller.updateAnnouncement);
router.delete('/announcements/:id',        controller.deleteAnnouncement);

module.exports = router;


