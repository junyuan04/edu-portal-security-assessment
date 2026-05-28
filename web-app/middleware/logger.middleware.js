// Lightweight request logger (logs method, path, and authenticated user if present)
const loggerMiddleware = (req, _res, next) => {
  const user = req.user ? `[user:${req.user.id}]` : '[guest]';
  console.log(`${new Date().toISOString()} ${user} ${req.method} ${req.originalUrl}`);
  next();
};

module.exports = { loggerMiddleware };


