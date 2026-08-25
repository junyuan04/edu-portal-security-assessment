const mysql = require('mysql2/promise');
const env   = require('./env');

const pool = mysql.createPool({
  host:               env.DB_HOST,
  port:               env.DB_PORT,
  database:           env.DB_NAME,
  user:               env.DB_USER,
  password:           env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

module.exports = pool;


