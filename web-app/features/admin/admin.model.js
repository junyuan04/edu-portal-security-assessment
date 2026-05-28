const db = require('../../config/db');

// Users
const getAllUsers = async ({ page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const [rows] = await db.query(
    `SELECT u.id, u.email, u.username, u.is_active, u.created_at,
            r.name AS role, p.full_name, p.institution
     FROM users u
     JOIN roles r ON r.id = u.role_id
     LEFT JOIN user_profiles p ON p.user_id = u.id
     ORDER BY u.created_at DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM users');
  return { rows, total, page, limit };
};

const getUserById = async (id) => {
  const [rows] = await db.query(
    `SELECT u.id, u.email, u.username, u.is_active, u.created_at,
            r.name AS role, p.full_name, p.bio, p.phone, p.institution
     FROM users u
     JOIN roles r ON r.id = u.role_id
     LEFT JOIN user_profiles p ON p.user_id = u.id
     WHERE u.id = ?`,
    [id]
  );
  return rows[0] || null;
};

const updateUserStatus = async (id, isActive) => {
  const [result] = await db.query(
    'UPDATE users SET is_active = ? WHERE id = ?',
    [isActive ? 1 : 0, id]
  );
  return result.affectedRows;
};

// Courses

// Admin sees ALL courses (including unpublished ones)
const getAllCourses = async () => {
  const [rows] = await db.query(
    `SELECT c.id, c.title, c.slug, c.price, c.level, c.is_published,
            c.created_at, cat.name AS category, u.username AS instructor
     FROM courses c
     JOIN categories cat ON cat.id = c.category_id
     JOIN users      u   ON u.id   = c.instructor_id
     ORDER BY c.created_at DESC`
  );
  return rows;
};

const updateCoursePublished = async (id, isPublished) => {
  const [result] = await db.query(
    'UPDATE courses SET is_published = ? WHERE id = ?',
    [isPublished ? 1 : 0, id]
  );
  return result.affectedRows;
};

// Dashboard stats
const getDashboardStats = async () => {
  const [[users]]      = await db.query('SELECT COUNT(*) AS total FROM users');
  const [[courses]]    = await db.query('SELECT COUNT(*) AS total FROM courses');
  const [[enrolments]] = await db.query('SELECT COUNT(*) AS total FROM enrolments WHERE status = "active"');
  const [[revenue]]    = await db.query('SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = "completed"');

  return {
    totalUsers:      users.total,
    totalCourses:    courses.total,
    activeEnrolments: enrolments.total,
    totalRevenue:    parseFloat(revenue.total),
  };
};

// Audit logs
const getAuditLogs = async (limit = 50) => {
  const [rows] = await db.query(
    `SELECT a.id, a.action, a.target_type, a.target_id,
            a.ip_address, a.created_at, u.username AS admin
     FROM admin_audit_logs a
     JOIN users u ON u.id = a.admin_id
     ORDER BY a.created_at DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
};

const logAction = async (adminId, action, targetType, targetId, detail, ipAddress) => {
  await db.query(
    `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, detail, ip_address)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [adminId, action, targetType, targetId, JSON.stringify(detail), ipAddress]
  );
};

// Announcements
const getAnnouncements = async () => {
  const [rows] = await db.query(
    `SELECT a.id, a.title, a.body, a.is_active, a.created_at, u.username AS admin
     FROM announcements a
     JOIN users u ON u.id = a.admin_id
     ORDER BY a.created_at DESC`
  );
  return rows;
};

const createAnnouncement = async (adminId, title, body) => {
  const [result] = await db.query(
    'INSERT INTO announcements (admin_id, title, body) VALUES (?, ?, ?)',
    [adminId, title, body]
  );
  return result.insertId;
};

const updateAnnouncement = async (id, { title, body, isActive }) => {
  const [result] = await db.query(
    `UPDATE announcements
     SET title = COALESCE(?, title), body = COALESCE(?, body), is_active = COALESCE(?, is_active)
     WHERE id = ?`,
    [title, body, isActive !== undefined ? (isActive ? 1 : 0) : null, id]
  );
  return result.affectedRows;
};

module.exports = {
  getAllUsers, getUserById, updateUserStatus,
  getAllCourses, updateCoursePublished,
  getDashboardStats,
  getAuditLogs, logAction,
  getAnnouncements, createAnnouncement, updateAnnouncement,
};


