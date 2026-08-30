// Database connection pool using mysql2/promise
// Supports both pool.query() and pool.getConnection() for transactions
const mysql = require('mysql2/promise');
require('dotenv').config();

const isLocalhost =
  !process.env.DB_HOST ||
  process.env.DB_HOST === 'localhost' ||
  process.env.DB_HOST === '127.0.0.1';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'financial_welfare',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...(isLocalhost
    ? {}
    : {
        ssl: {
          rejectUnauthorized: false,
        },
      }),
});

module.exports = pool;
