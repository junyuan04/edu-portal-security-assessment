const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { isSecureMode } = require('../config/secureMode');

// Mode-aware verify
const verifyToken = async (token) => {
  if (await isSecureMode()) {
    return jwt.verify(token, env.JWT_SECRET_SECURE, { algorithms: ['HS256'] });
  }
  return jwt.verify(token, env.JWT_SECRET);
};

const authMiddleware = async (req, res, next) => {
  const header = req.headers['authorization'];

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    req.user = await verifyToken(header.split(' ')[1]);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authMiddleware };


