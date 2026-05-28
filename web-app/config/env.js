// Centralised environment variable access.

module.exports = {
  NODE_ENV:       process.env.NODE_ENV      || 'development',
  WEB_APP_PORT:   process.env.WEB_APP_PORT  || 3000,

  DB_HOST:        process.env.DB_HOST       || 'localhost',
  DB_PORT:        parseInt(process.env.DB_PORT) || 3306,
  DB_NAME:        process.env.DB_NAME       || 'myeduconnect',
  DB_USER:        process.env.DB_USER       || 'root',
  DB_PASSWORD:    process.env.DB_PASSWORD   || '',

  // Intentionally weak JWT secret and no expiry
  JWT_SECRET:     process.env.JWT_SECRET    || 'secret123',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '0',
};


