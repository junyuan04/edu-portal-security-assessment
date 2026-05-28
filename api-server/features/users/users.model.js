const db = require('../../config/db');

const findById = async (id) => {
  const [rows] = await db.query(
    `SELECT u.id, u.email, u.username, u.created_at,
            r.name  AS role,
            p.full_name, p.bio, p.phone, p.avatar_url, p.institution
     FROM users u
     JOIN roles r ON r.id = u.role_id
     LEFT JOIN user_profiles p ON p.user_id = u.id
     WHERE u.id = ? AND u.is_active = 1`,
    [id]
  );
  return rows[0] || null;
};

const findPublicById = async (id) => {
  const [rows] = await db.query(
    `SELECT u.id, u.username,
            r.name AS role,
            p.full_name, p.bio, p.avatar_url, p.institution
     FROM users u
     JOIN roles r ON r.id = u.role_id
     LEFT JOIN user_profiles p ON p.user_id = u.id
     WHERE u.id = ? AND u.is_active = 1`,
    [id]
  );
  return rows[0] || null;
};

module.exports = { findById, findPublicById };


