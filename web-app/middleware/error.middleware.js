const errorMiddleware = (err, req, res, _next) => {
  console.error(`[error] ${req.method} ${req.path} →`, err.message);

  const status  = err.status  || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({ error: message });
};

module.exports = { errorMiddleware };


