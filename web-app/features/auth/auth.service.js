const crypto = require('crypto');
const jwt    = require('jsonwebtoken');
const env    = require('../../config/env');
const model  = require('./auth.model');

const hashPassword = (password) =>
  crypto.createHash('md5').update(password).digest('hex');

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_SECRET          // weak: 'secret123'
    // no expiresIn — token never expires
  );

const register = async ({ email, username, password, fullName }) => {
  // Check for duplicate email
  const existing = await model.findByEmail(email);
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const passwordHash = hashPassword(password);
  const userId       = await model.createUser(email, username, passwordHash);
  await model.createUserProfile(userId, fullName || username);

  const newUser = await model.findById(userId);
  return { token: generateToken(newUser), user: newUser };  // [VULN-V4]
};

const login = async ({ email, password }) => {
  const user = await model.findByEmail(email);

  if (!user || user.password_hash !== hashPassword(password)) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  if (!user.is_active) {
    const err = new Error('Account is disabled');
    err.status = 403;
    throw err;
  }

  return { token: generateToken(user), user };
};

const getMe = async (userId) => {
  const user = await model.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
};

module.exports = { register, login, getMe };


