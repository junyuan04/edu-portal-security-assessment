const db = require('../../config/db');

// Find a user row by email
const findByEmail = async (email) => {
  const [rows] = await db.query(
    'SELECT u.*, r.name AS role FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?',
    [email]
  );
  return rows[0] || null;
};

// Find a user row by id (used for /me endpoint)
const findById = async (id) => {
  const [rows] = await db.query(
    `SELECT u.id, u.email, u.username, u.is_active, r.name AS role
     FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?`,
    [id]
  );
  return rows[0] || null;
};

// Insert a new user row (role_id 3 = student by default)
const createUser = async (email, username, passwordHash) => {
  const [result] = await db.query(
    'INSERT INTO users (email, username, password_hash, role_id) VALUES (?, ?, ?, 3)',
    [email, username, passwordHash]
  );
  return result.insertId;
};

// Insert a matching profile row for the new user
const createUserProfile = async (userId, fullName) => {
  await db.query(
    'INSERT INTO user_profiles (user_id, full_name) VALUES (?, ?)',
    [userId, fullName]
  );
};

module.exports = { findByEmail, findById, createUser, createUserProfile };


