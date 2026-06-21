// Centralised environment variable access.

const requireSecureJwtSecret = () => {
  const value = process.env.JWT_SECRET_SECURE;
  if (!value || value.length < 32) {
    throw new Error(
      'JWT_SECRET_SECURE must be set in the environment to a value of at ' +
      'least 32 characters (256 bits). See .env.example for guidance.'
    );
  }
  return value;
};

module.exports = {
  NODE_ENV:       process.env.NODE_ENV      || 'development',
  WEB_APP_PORT:   process.env.WEB_APP_PORT  || 3000,

  DB_HOST:        process.env.DB_HOST       || 'localhost',
  DB_PORT:        parseInt(process.env.DB_PORT) || 3306,
  DB_NAME:        process.env.DB_NAME       || 'myeduconnect',
  DB_USER:        process.env.DB_USER       || 'root',
  DB_PASSWORD:    process.env.DB_PASSWORD   || '',

  // Intentionally weak JWT secret used by the vulnerable code path. Kept as a
  // hard-coded default so the Phase 4 handbook walkthrough still demonstrates
  // the V4 attack against the deliberately vulnerable build.
  JWT_SECRET:        process.env.JWT_SECRET     || 'secret123',
  JWT_EXPIRES_IN:    process.env.JWT_EXPIRES_IN || '0',

  JWT_SECRET_SECURE:     requireSecureJwtSecret(),
  JWT_EXPIRES_IN_SECURE: process.env.JWT_EXPIRES_IN_SECURE || '1h',
};


