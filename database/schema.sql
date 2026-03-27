-- Financial Resource Management System for Social Welfare
-- Database Schema

DROP DATABASE IF EXISTS financial_welfare;
CREATE DATABASE financial_welfare;
USE financial_welfare;

-- Users table: stores all system users (admins, donors, beneficiaries)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'donor', 'beneficiary') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Donations table: tracks all monetary donations made by donors
CREATE TABLE donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donor_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (donor_id) REFERENCES users(id)
);

-- Applications table: beneficiaries apply for financial assistance
-- priority_score is calculated server-side (max 100):
--   income < 10000 -> +30, < 20000 -> +20, < 30000 -> +10
--   family_members > 5 -> +20, > 3 -> +10
--   urgency: critical -> +30, high -> +20, medium -> +10, low -> +5
--   documents present -> +20
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  beneficiary_id INT NOT NULL,
  phone VARCHAR(30),
  address TEXT,
  income DECIMAL(12, 2) NOT NULL COMMENT 'Monthly income in USD',
  family_members INT NOT NULL COMMENT 'Number of family members',
  employment_status VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL COMMENT 'Amount requested',
  category ENUM('Medical', 'Education', 'Emergency', 'Other') NOT NULL,
  reason TEXT NOT NULL,
  urgency ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
  documents_path TEXT DEFAULT NULL COMMENT 'JSON array of uploaded file paths',
  priority_score INT NOT NULL DEFAULT 0,
  priority_level ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Low',
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  amount_allocated DECIMAL(10, 2) DEFAULT NULL,
  reviewed_by INT DEFAULT NULL,
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (beneficiary_id) REFERENCES users(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Transactions table: records all fund allocations and donation receipts
CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT DEFAULT NULL,
  beneficiary_id INT NOT NULL,
  donor_allocation_id INT DEFAULT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type ENUM('allocation', 'donation') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id),
  FOREIGN KEY (beneficiary_id) REFERENCES users(id)
);

-- =============================================================
-- DEMO DATA INSERTION
-- =============================================================
-- Passwords are bcrypt hashed (cost 10):
--   admin123  -> $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
--   donor123  -> $2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQbLgtnOoKsWc.6U0fFE9RuJ2tJiuS
--   benef123  -> $2a$10$YwJCsrwPRlqnBJbkFpI.ZO5pJO7X8P.e0lJxzAlZMqJlvTJGd7H2.

INSERT INTO users (name, email, password, role) VALUES
  ('Admin User',       'admin@welfare.org',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin'),
  ('John Donor',       'john@donor.com',     '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQbLgtnOoKsWc.6U0fFE9RuJ2tJiuS', 'donor'),
  ('Sarah Donor',      'sarah@donor.com',    '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQbLgtnOoKsWc.6U0fFE9RuJ2tJiuS', 'donor'),
  ('Maria Beneficiary','maria@beneficiary.com','$2a$10$YwJCsrwPRlqnBJbkFpI.ZO5pJO7X8P.e0lJxzAlZMqJlvTJGd7H2.', 'beneficiary'),
  ('Carlos Beneficiary','carlos@beneficiary.com','$2a$10$YwJCsrwPRlqnBJbkFpI.ZO5pJO7X8P.e0lJxzAlZMqJlvTJGd7H2.', 'beneficiary');

-- Sample donations
INSERT INTO donations (donor_id, amount, message) VALUES
  (2, 5000.00, 'Happy to support those in need. Keep up the great work!'),
  (3, 3000.00, 'Small contribution, hope it helps someone today.'),
  (2, 2000.00, 'Monthly recurring donation for the welfare fund.');

-- Sample applications using new schema
-- Application 1: Maria - Critical urgency, low income, large family -> score 30+20+30+20=100 -> High
INSERT INTO applications
  (beneficiary_id, phone, address, income, family_members, employment_status,
   amount, category, reason, urgency, documents_path, priority_score, priority_level, status)
VALUES
  (4, '555-1001', '12 Oak Street, Springfield', 8000.00, 6, 'Unemployed',
   1500.00, 'Medical', 'Urgent medical bills for heart surgery. Family of 6 with very low income. Cannot afford treatment without assistance.',
   'Critical', '["uploads/sample_income_proof.pdf","uploads/sample_id_proof.pdf"]', 100, 'High', 'pending'),

-- Application 2: Carlos - High urgency, medium-low income, family of 3 -> score 20+10+20+20=70 -> High
  (5, '555-2002', '45 Maple Ave, Riverside', 15000.00, 3, 'Part-time',
   900.00, 'Emergency', 'At risk of eviction after job loss. Single parent with two children. Need 3 months rent support to stabilize.',
   'High', '["uploads/sample_income_proof.pdf"]', 70, 'High', 'pending'),

-- Application 3: Maria - Medium urgency, medium income, family of 2 -> score 10+0+10+0=20 -> Low
  (4, '555-1001', '12 Oak Street, Springfield', 25000.00, 2, 'Part-time',
   400.00, 'Education', 'Need school supplies and uniforms for 2 children. Cannot afford basic education materials this semester.',
   'Medium', NULL, 20, 'Low', 'pending'),

-- Application 4: Carlos - Low urgency, higher income, small family -> score 0+0+5+0=5 -> Low
  (5, '555-2002', '45 Maple Ave, Riverside', 35000.00, 2, 'Employed',
   600.00, 'Education', 'Want to enroll in a 6-month coding bootcamp to improve employment prospects and become self-sufficient.',
   'Low', NULL, 5, 'Low', 'pending');
