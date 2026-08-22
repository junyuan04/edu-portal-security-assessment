// Centralised env access for the api-server.

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
  NODE_ENV:        process.env.NODE_ENV         || 'development',
  API_SERVER_PORT: process.env.API_SERVER_PORT  || 4000,

  DB_HOST:         process.env.DB_HOST          || 'localhost',
  DB_PORT:         parseInt(process.env.DB_PORT) || 3306,
  DB_NAME:         process.env.DB_NAME          || 'eduportal',
  DB_USER:         process.env.DB_USER          || 'root',
  DB_PASSWORD:     process.env.DB_PASSWORD      || '',

  JWT_SECRET:        process.env.API_JWT_SECRET || 'secret123',

  JWT_SECRET_SECURE: requireSecureJwtSecret(),
};


