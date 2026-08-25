const db = require('../../config/db');

const findProfileByUserId = async (userId) => {
  const [rows] = await db.query(
    `SELECT
       u.id, u.email, u.username, u.created_at,
       r.name            AS role,
       p.full_name, p.bio, p.phone, p.avatar_url, p.institution, p.updated_at
     FROM users u
     JOIN roles         r ON u.role_id  = r.id
     LEFT JOIN user_profiles p ON p.user_id = u.id
     WHERE u.id = ?`,
    [userId]
  );
  return rows[0] || null;
};

const findPublicProfileByUserId = async (userId) => {
  const [rows] = await db.query(
    `SELECT
       u.id, u.username,
       r.name  AS role,
       p.full_name, p.bio, p.avatar_url, p.institution
     FROM users u
     JOIN roles         r ON u.role_id  = r.id
     LEFT JOIN user_profiles p ON p.user_id = u.id
     WHERE u.id = ? AND u.is_active = 1`,
    [userId]
  );
  return rows[0] || null;
};

const updateProfile = async (userId, { fullName, bio, phone, institution, avatarUrl }) => {
  await db.query(
    `INSERT INTO user_profiles (user_id, full_name, bio, phone, institution, avatar_url)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       full_name    = COALESCE(VALUES(full_name),   full_name),
       bio          = COALESCE(VALUES(bio),          bio),
       phone        = COALESCE(VALUES(phone),        phone),
       institution  = COALESCE(VALUES(institution),  institution),
       avatar_url   = COALESCE(VALUES(avatar_url),   avatar_url)`,
    [userId, fullName, bio, phone, institution, avatarUrl]
  );
};

module.exports = { findProfileByUserId, findPublicProfileByUserId, updateProfile };


