const jwt = require('jsonwebtoken');
const env  = require('../config/env');

const authMiddleware = (req, res, next) => {
  const header = req.headers['authorization'];

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    req.user = jwt.verify(header.split(' ')[1], env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authMiddleware };