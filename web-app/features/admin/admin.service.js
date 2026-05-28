const model = require('./admin.model');

// Users
const getAllUsers = async (query) => {
  const page  = parseInt(query.page)  || 1;
  const limit = parseInt(query.limit) || 20;
  return model.getAllUsers({ page, limit });
};

const getUserById = async (id) => {
  const user = await model.getUserById(id);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
};

const toggleUserStatus = async (id, isActive, adminId, ip) => {
  const affected = await model.updateUserStatus(id, isActive);
  if (affected === 0) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  await model.logAction(adminId, isActive ? 'ENABLE_USER' : 'DISABLE_USER', 'user', id, {}, ip);
  return model.getUserById(id);
};

// Courses
const getAllCourses = async () => {
  return model.getAllCourses();
};

const toggleCoursePublished = async (id, isPublished, adminId, ip) => {
  const affected = await model.updateCoursePublished(id, isPublished);
  if (affected === 0) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }

  await model.logAction(
    adminId,
    isPublished ? 'PUBLISH_COURSE' : 'UNPUBLISH_COURSE',
    'course', id, {}, ip
  );
  return { message: `Course ${isPublished ? 'published' : 'unpublished'} successfully` };
};

// Dashboard
const getDashboardStats = async () => {
  return model.getDashboardStats();
};

// Audit logs
const getAuditLogs = async (limit) => {
  return model.getAuditLogs(limit);
};

// Announcements
const getAnnouncements = async () => {
  return model.getAnnouncements();
};

const createAnnouncement = async (adminId, { title, body }) => {
  if (!title || !body) {
    const err = new Error('title and body are required');
    err.status = 400;
    throw err;
  }

  const id = await model.createAnnouncement(adminId, title, body);
  await model.logAction(adminId, 'CREATE_ANNOUNCEMENT', 'announcement', id, { title }, null);

  const [announcements] = await Promise.all([model.getAnnouncements()]);
  return announcements.find((a) => a.id === id);
};

const updateAnnouncement = async (id, data, adminId) => {
  const affected = await model.updateAnnouncement(id, data);
  if (affected === 0) {
    const err = new Error('Announcement not found');
    err.status = 404;
    throw err;
  }

  await model.logAction(adminId, 'UPDATE_ANNOUNCEMENT', 'announcement', id, data, null);
  return (await model.getAnnouncements()).find((a) => a.id === id);
};

module.exports = {
  getAllUsers, getUserById, toggleUserStatus,
  getAllCourses, toggleCoursePublished,
  getDashboardStats,
  getAuditLogs,
  getAnnouncements, createAnnouncement, updateAnnouncement,
};


