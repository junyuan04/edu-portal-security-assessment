const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const env    = require('../../config/env');
const { isSecureMode } = require('../../config/secureMode');
const model  = require('./auth.model');

const hashPassword = async (password, secure) =>
  secure
    ? bcrypt.hash(password, 12)
    : crypto.createHash('md5').update(password).digest('hex');

const md5 = (s) => crypto.createHash('md5').update(s).digest('hex');

// Detects which scheme a stored hash uses so users created under either mode 
// can still log in after the operator flips the toggle.
const verifyPassword = async (password, storedHash) => {
  if (!storedHash) return false;
  if (storedHash.startsWith('$2')) return bcrypt.compare(password, storedHash);
  return md5(password) === storedHash;
};

const generateToken = (user, secure) =>
  // web-app/features/auth/auth.service.js
  secure
    ? jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        env.JWT_SECRET_SECURE,
        { algorithm: 'HS256', expiresIn: env.JWT_EXPIRES_IN_SECURE }
      )
    : jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        env.JWT_SECRET
      );

const register = async ({ email, username, password, fullName }) => {
  const existing = await model.findByEmail(email);
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const secure       = await isSecureMode();
  const passwordHash = await hashPassword(password, secure);
  const userId       = await model.createUser(email, username, passwordHash);
  await model.createUserProfile(userId, fullName || username);

  const newUser = await model.findById(userId);
  return { token: generateToken(newUser, secure), user: newUser };
};

const login = async ({ email, password }) => {
  const user = await model.findByEmail(email);

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  if (!user.is_active) {
    const err = new Error('Account is disabled');
    err.status = 403;
    throw err;
  }

  const secure = await isSecureMode();
  return { token: generateToken(user, secure), user };
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

const generateResetToken = async (email, secure) => {
  if (secure) {

    return crypto.randomBytes(32).toString('hex');
  }
  const stamp = Date.now().toString();
  const hash  = md5(email + stamp).slice(0, 16);
  return `${stamp}-${hash}`;
};

const forgotPassword = async ({ email }) => {
  const user = await model.findByEmail(email);
  if (!user) {
    const err = new Error('No account found for this email');
    err.status = 404;
    throw err;
  }
  const secure    = await isSecureMode();
  const token     = await generateResetToken(email, secure);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h
  await model.createResetToken(user.id, token, expiresAt);
  return { message: 'Password reset token generated', token, expiresAt };
};

const resetPassword = async ({ token, password }) => {
  if (!token || !password) {
    const err = new Error('token and password are required');
    err.status = 400;
    throw err;
  }
  const record = await model.findResetToken(token);
  if (!record) {
    const err = new Error('Invalid or unknown token');
    err.status = 400;
    throw err;
  }
  if (record.used) {
    const err = new Error('Token already used');
    err.status = 400;
    throw err;
  }
  if (new Date(record.expires_at).getTime() < Date.now()) {
    const err = new Error('Token expired');
    err.status = 400;
    throw err;
  }

  const secure = await isSecureMode();
  await model.updatePassword(record.user_id, await hashPassword(password, secure));
  await model.markResetTokenUsed(record.id);
  return { message: 'Password reset successful' };
};

module.exports = { register, login, getMe, forgotPassword, resetPassword, generateToken };


