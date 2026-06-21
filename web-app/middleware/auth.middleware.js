const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { isSecureMode } = require('../config/secureMode');

const verifyToken = async (token) => {
  if (await isSecureMode()) {
    return jwt.verify(token, env.JWT_SECRET_SECURE, { algorithms: ['HS256'] });
  }
  return jwt.verify(token, env.JWT_SECRET);
};

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = await verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };


