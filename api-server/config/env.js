// Centralised env access for the api-server.
module.exports = {
  NODE_ENV:        process.env.NODE_ENV         || 'development',
  API_SERVER_PORT: process.env.API_SERVER_PORT  || 4000,

  DB_HOST:         process.env.DB_HOST          || 'localhost',
  DB_PORT:         parseInt(process.env.DB_PORT) || 3306,
  DB_NAME:         process.env.DB_NAME          || 'myeduconnect',
  DB_USER:         process.env.DB_USER          || 'root',
  DB_PASSWORD:     process.env.DB_PASSWORD      || '',

  JWT_SECRET:      process.env.API_JWT_SECRET   || 'secret123',
};