// init.js – Seeds the financial_welfare database with initial data.
// Run once with:  node backend/init.js  (from the project root)
//           or:  npm run init           (from the backend/ directory)
//
// What this script does:
//   1. Creates the `financial_welfare` database if it does not exist.
//   2. Creates all required tables (users, donations, applications, transactions).
//   3. Inserts one admin account.
//   4. Inserts two demo donor accounts with sample donations.
//   5. Inserts two demo beneficiary accounts with sample applications.
//
// Credentials created:
//   Admin       – admin@welfare.org   / admin123
//   Donor 1     – john@donor.com      / donor123
//   Donor 2     – sarah@donor.com     / donor123
//   Beneficiary 1 – maria@beneficiary.com  / benef123
//   Beneficiary 2 – carlos@beneficiary.com / benef123

'use strict';

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const DB_HOST     = process.env.DB_HOST     || 'localhost';
const DB_USER     = process.env.DB_USER     || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME     = process.env.DB_NAME     || 'financial_welfare';

// ─── DDL ─────────────────────────────────────────────────────────────────────

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
  id           INT AUTO_INCREMENT PRIMARY KEY,
  donor_id     INT            DEFAULT NULL,
  guest_name   VARCHAR(100)   DEFAULT NULL,
  guest_email  VARCHAR(100)   DEFAULT NULL,
  amount       DECIMAL(10, 2) NOT NULL,
  message      TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

// ─── Seed helpers ─────────────────────────────────────────────────────────────

/**
 * Insert a user only if that email is not already present.
 * Returns the user's id (existing or newly inserted).
 */
async function upsertUser(conn, { name, email, password, role }) {
  const [rows] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);
  if (rows.length > 0) {
    console.log(`  ↩  User already exists: ${email}`);
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

/**
 * Insert a donation row unconditionally (demo data is always useful to have).
 * Skips insertion if a matching row already exists (idempotent re-runs).
 */
async function insertDonationIfMissing(conn, { donorId, amount, message }) {
  const [rows] = await conn.query(
    'SELECT id FROM donations WHERE donor_id = ? AND amount = ? AND message = ?',
    [donorId, amount, message]
  );
  if (rows.length > 0) {
    console.log(`  ↩  Donation already exists for donor_id=${donorId}, amount=${amount}`);
    return;
  }
  await conn.query(
    'INSERT INTO donations (donor_id, amount, message) VALUES (?, ?, ?)',
    [donorId, amount, message]
  );
  console.log(`  ✔  Inserted donation: donor_id=${donorId}, amount=${amount}`);
}

/**
 * Insert an application row only if an identical one does not yet exist.
 */
async function insertApplicationIfMissing(conn, app) {
  const [rows] = await conn.query(
    'SELECT id FROM applications WHERE beneficiary_id = ? AND category = ? AND reason = ?',
    [app.beneficiaryId, app.category, app.reason]
  );
  if (rows.length > 0) {
    console.log(`  ↩  Application already exists for beneficiary_id=${app.beneficiaryId}, category=${app.category}`);
    return;
  }
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
  console.log(`  ✔  Inserted application: beneficiary_id=${app.beneficiaryId}, category=${app.category}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀  Starting database initialisation …\n');

  // Connect without selecting a database so we can CREATE it if needed.
  const conn = await mysql.createConnection({
    host:     DB_HOST,
    user:     DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
  });

  // 1. Create database
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  console.log(`✅  Database \`${DB_NAME}\` ready.`);

  await conn.query(`USE \`${DB_NAME}\``);

  // 2. Create tables
  await conn.query(DDL);
  console.log('✅  Tables created / verified.\n');

  // 3. Seed admin
  console.log('👤  Seeding admin user …');
  await upsertUser(conn, {
    name:     'Admin User',
    email:    'admin@welfare.org',
    password: 'admin123',
    role:     'admin',
  });

  // 4. Seed donors
  console.log('\n💳  Seeding donor users …');
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

  // 5. Seed donations
  console.log('\n💰  Seeding sample donations …');
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
  await insertDonationIfMissing(conn, {
    donorId: johnId,
    amount:  2000.00,
    message: 'Monthly recurring donation for the welfare fund.',
  });

  // 6. Seed beneficiaries
  console.log('\n🤝  Seeding beneficiary users …');
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

  // 7. Seed applications
  // Priority score formula (max 100):
  //   income < 10000 → +30 | < 20000 → +20 | < 30000 → +10
  //   family_members > 5 → +20 | > 3 → +10
  //   urgency: Critical → +30 | High → +20 | Medium → +10 | Low → +5
  //   documents present → +20
  console.log('\n📄  Seeding sample applications …');

  // Maria – Critical, low income, large family → score 100 → High
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

  // Carlos – High urgency, medium-low income, family of 3 → score 70 → High
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

  // Maria – Medium urgency, medium income, family of 2 → score 20 → Low
  await insertApplicationIfMissing(conn, {
    beneficiaryId:    mariaId,
    phone:            '555-1001',
    address:          '12 Oak Street, Springfield',
    income:           25000.00,
    familyMembers:    2,
    employmentStatus: 'Part-time',
    amount:           400.00,
    category:         'Education',
    reason:           'Need school supplies and uniforms for 2 children. Cannot afford basic education materials this semester.',
    urgency:          'Medium',
    documentsPath:    null,
    priorityScore:    20,
    priorityLevel:    'Low',
    status:           'pending',
  });

  // Carlos – Low urgency, higher income, small family → score 5 → Low
  await insertApplicationIfMissing(conn, {
    beneficiaryId:    carlosId,
    phone:            '555-2002',
    address:          '45 Maple Ave, Riverside',
    income:           35000.00,
    familyMembers:    2,
    employmentStatus: 'Employed',
    amount:           600.00,
    category:         'Education',
    reason:           'Want to enroll in a 6-month coding bootcamp to improve employment prospects and become self-sufficient.',
    urgency:          'Low',
    documentsPath:    null,
    priorityScore:    5,
    priorityLevel:    'Low',
    status:           'pending',
  });

  await conn.end();

  console.log('\n✅  Initialisation complete!\n');
  console.log('   Demo credentials:');
  console.log('   ┌─────────────────────────────────┬──────────────┬─────────────┐');
  console.log('   │ Email                           │ Password     │ Role        │');
  console.log('   ├─────────────────────────────────┼──────────────┼─────────────┤');
  console.log('   │ admin@welfare.org               │ admin123     │ admin       │');
  console.log('   │ john@donor.com                  │ donor123     │ donor       │');
  console.log('   │ sarah@donor.com                 │ donor123     │ donor       │');
  console.log('   │ maria@beneficiary.com           │ benef123     │ beneficiary │');
  console.log('   │ carlos@beneficiary.com          │ benef123     │ beneficiary │');
  console.log('   └─────────────────────────────────┴──────────────┴─────────────┘\n');
}

main().catch(err => {
  console.error('\n❌  Initialisation failed:', err.message);
  process.exit(1);
});
