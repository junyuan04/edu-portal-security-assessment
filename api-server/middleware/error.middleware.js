const errorMiddleware = (err, req, res, _next) => {
  console.error(`[api-server error] ${req.method} ${req.path} →`, err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
};

module.exports = { errorMiddleware };


