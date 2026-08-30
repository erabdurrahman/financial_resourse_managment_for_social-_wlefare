// init.js – Seeds the database with initial schema and demo data.
'use strict';

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const isLocalhost =
  !process.env.DB_HOST ||
  process.env.DB_HOST === 'localhost' ||
  process.env.DB_HOST === '127.0.0.1';

const DB_HOST     = process.env.DB_HOST     || 'localhost';
const DB_PORT     = Number(process.env.DB_PORT) || 3306;
const DB_USER     = process.env.DB_USER     || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME     = process.env.DB_NAME     || 'financial_welfare';

const DDL = `
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)                          NOT NULL,
  email      VARCHAR(100) UNIQUE                   NOT NULL,
  password   VARCHAR(255)                          NOT NULL,
  role       ENUM('admin', 'donor', 'beneficiary') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donations (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  donor_id   INT            NOT NULL,
  amount     DECIMAL(10, 2) NOT NULL,
  message    TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (donor_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS applications (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  beneficiary_id    INT            NOT NULL,
  phone             VARCHAR(30),
  address           TEXT,
  income            DECIMAL(12, 2) NOT NULL COMMENT 'Monthly income in USD',
  family_members    INT            NOT NULL COMMENT 'Number of family members',
  employment_status VARCHAR(50)    NOT NULL,
  amount            DECIMAL(10, 2) NOT NULL COMMENT 'Amount requested',
  category          ENUM('Medical', 'Education', 'Emergency', 'Other') NOT NULL,
  reason            TEXT           NOT NULL,
  urgency           ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
  documents_path    TEXT           DEFAULT NULL COMMENT 'JSON array of uploaded file paths',
  priority_score    INT            NOT NULL DEFAULT 0,
  priority_level    ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Low',
  status            ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  amount_allocated  DECIMAL(10, 2) DEFAULT NULL,
  reviewed_by       INT            DEFAULT NULL,
  reviewed_at       TIMESTAMP      NULL,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (beneficiary_id) REFERENCES users(id),
  FOREIGN KEY (reviewed_by)    REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  application_id       INT            DEFAULT NULL,
  beneficiary_id       INT            NOT NULL,
  donor_allocation_id  INT            DEFAULT NULL,
  amount               DECIMAL(10, 2) NOT NULL,
  type                 ENUM('allocation', 'donation') NOT NULL,
  created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id),
  FOREIGN KEY (beneficiary_id) REFERENCES users(id)
);
`;

async function upsertUser(conn, { name, email, password, role }) {
  const [rows] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
  if (rows.length > 0) {
    return rows[0].id;
  }
  const hash = await bcrypt.hash(password, 10);
  const [result] = await conn.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hash, role]
  );
  console.log(`  ✔  Created user: ${email} (${role})`);
  return result.insertId;
}

async function insertDonationIfMissing(conn, { donorId, amount, message }) {
  const [rows] = await conn.query(
    'SELECT id FROM donations WHERE donor_id = ? AND amount = ? AND message = ?',
    [donorId, amount, message]
  );
  if (rows.length > 0) return;
  await conn.query(
    'INSERT INTO donations (donor_id, amount, message) VALUES (?, ?, ?)',
    [donorId, amount, message]
  );
}

async function insertApplicationIfMissing(conn, app) {
  const [rows] = await conn.query(
    'SELECT id FROM applications WHERE beneficiary_id = ? AND category = ? AND reason = ?',
    [app.beneficiaryId, app.category, app.reason]
  );
  if (rows.length > 0) return;
  await conn.query(
    `INSERT INTO applications
       (beneficiary_id, phone, address, income, family_members, employment_status,
        amount, category, reason, urgency, documents_path,
        priority_score, priority_level, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      app.beneficiaryId, app.phone, app.address, app.income, app.familyMembers,
      app.employmentStatus, app.amount, app.category, app.reason, app.urgency,
      app.documentsPath, app.priorityScore, app.priorityLevel, app.status,
    ]
  );
}

async function initDatabase() {
  console.log('\n🚀  Initialising Financial Welfare database tables & seed data …');

  const connectionConfig = {
    host:     DB_HOST,
    port:     DB_PORT,
    user:     DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    multipleStatements: true,
    ...(isLocalhost ? {} : { ssl: { rejectUnauthorized: false } }),
  };

  // If local, check creating DB first
  if (isLocalhost) {
    try {
      const rootConn = await mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
      });
      await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
      await rootConn.end();
    } catch (e) {
      console.warn('Local DB check notice:', e.message);
    }
  }

  const conn = await mysql.createConnection(connectionConfig);

  // Create tables
  await conn.query(DDL);
  console.log('✅  Tables created / verified.');

  // Seed demo admin
  await upsertUser(conn, {
    name:     'Admin User',
    email:    'admin@welfare.org',
    password: 'admin123',
    role:     'admin',
  });

  // Seed donors
  const johnId = await upsertUser(conn, {
    name:     'John Donor',
    email:    'john@donor.com',
    password: 'donor123',
    role:     'donor',
  });
  const sarahId = await upsertUser(conn, {
    name:     'Sarah Donor',
    email:    'sarah@donor.com',
    password: 'donor123',
    role:     'donor',
  });

  // Seed donations
  await insertDonationIfMissing(conn, {
    donorId: johnId,
    amount:  5000.00,
    message: 'Happy to support those in need. Keep up the great work!',
  });
  await insertDonationIfMissing(conn, {
    donorId: sarahId,
    amount:  3000.00,
    message: 'Small contribution, hope it helps someone today.',
  });

  // Seed beneficiaries
  const mariaId = await upsertUser(conn, {
    name:     'Maria Beneficiary',
    email:    'maria@beneficiary.com',
    password: 'benef123',
    role:     'beneficiary',
  });
  const carlosId = await upsertUser(conn, {
    name:     'Carlos Beneficiary',
    email:    'carlos@beneficiary.com',
    password: 'benef123',
    role:     'beneficiary',
  });

  // Seed applications
  await insertApplicationIfMissing(conn, {
    beneficiaryId:    mariaId,
    phone:            '555-1001',
    address:          '12 Oak Street, Springfield',
    income:           8000.00,
    familyMembers:    6,
    employmentStatus: 'Unemployed',
    amount:           1500.00,
    category:         'Medical',
    reason:           'Urgent medical bills for heart surgery. Household with very low income. Cannot afford treatment without assistance.',
    urgency:          'Critical',
    documentsPath:    '["uploads/sample_income_proof.pdf","uploads/sample_id_proof.pdf"]',
    priorityScore:    100,
    priorityLevel:    'High',
    status:           'pending',
  });

  await insertApplicationIfMissing(conn, {
    beneficiaryId:    carlosId,
    phone:            '555-2002',
    address:          '45 Maple Ave, Riverside',
    income:           15000.00,
    familyMembers:    3,
    employmentStatus: 'Part-time',
    amount:           900.00,
    category:         'Emergency',
    reason:           'At risk of eviction after job loss. Single parent with children. Need 3 months rent support to stabilize.',
    urgency:          'High',
    documentsPath:    '["uploads/sample_income_proof.pdf"]',
    priorityScore:    70,
    priorityLevel:    'High',
    status:           'pending',
  });

  await conn.end();
  console.log('✅  Database Initialisation complete!\n');
}

if (require.main === module) {
  initDatabase().catch((err) => {
    console.error('❌  Initialisation failed:', err.message);
    process.exit(1);
  });
}

module.exports = { initDatabase };
