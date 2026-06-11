const service = require('./admin.service');

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await service.getDashboardStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const result = await service.getAllUsers(req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await service.getUserById(Number(req.params.id));
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ error: 'isActive (boolean) is required' });
    }

    const user = await service.toggleUserStatus(
      Number(req.params.id),
      Boolean(isActive),
      req.user.id,
      req.ip
    );
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const getAllCourses = async (req, res, next) => {
  try {
    const courses = await service.getAllCourses();
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

const toggleCoursePublished = async (req, res, next) => {
  try {
    const { isPublished } = req.body;

    if (isPublished === undefined) {
      return res.status(400).json({ error: 'isPublished (boolean) is required' });
    }

    const result = await service.toggleCoursePublished(
      Number(req.params.id),
      Boolean(isPublished),
      req.user.id,
      req.ip
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getAuditLogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs  = await service.getAuditLogs(limit);
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await service.getAnnouncements();
    res.json(announcements);
  } catch (err) {
    next(err);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const { title, body } = req.body;
    const announcement = await service.createAnnouncement(req.user.id, { title, body });
    res.status(201).json(announcement);
  } catch (err) {
    next(err);
  }
};

const updateAnnouncement = async (req, res, next) => {
  try {
    const { title, body, isActive } = req.body;
    const announcement = await service.updateAnnouncement(
      Number(req.params.id),
      { title, body, isActive },
      req.user.id
    );
    res.json(announcement);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const result = await service.deleteUser(Number(req.params.id), req.user.id, req.ip);
    res.json(result);
  } catch (err) { next(err); }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    const result = await service.deleteAnnouncement(Number(req.params.id), req.user.id, req.ip);
    res.json(result);
  } catch (err) { next(err); }
};

module.exports = {
  getDashboardStats,
  getAllUsers, getUserById, toggleUserStatus, deleteUser,
  getAllCourses, toggleCoursePublished,
  getAuditLogs,
  getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
};


    