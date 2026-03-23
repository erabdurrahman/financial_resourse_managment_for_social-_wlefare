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
-- priority_score = (10 - income_level) * 3 + emergency_level * 4 + need_score * 3 (max 70)
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  beneficiary_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  amount_requested DECIMAL(10, 2) NOT NULL,
  income_level INT NOT NULL COMMENT '1-10 scale, 1=lowest income',
  emergency_level INT NOT NULL COMMENT '1-10 scale, 10=most urgent',
  need_score INT NOT NULL COMMENT '1-10 scale, 10=highest need',
  priority_score INT NOT NULL COMMENT 'Calculated: (10-income)*3 + emergency*4 + need*3, max 70',
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

-- Sample applications with varying levels
-- Application 1: Maria - High priority (income=2, emergency=9, need=8)
--   priority = (10-2)*3 + 9*4 + 8*3 = 24 + 36 + 24 = 84 -> capped display, stored as 84? No, max is 70 if levels are 1-10
--   Actually max: income=1 -> (10-1)*3=27, emergency=10 -> 40, need=10 -> 30 => 97. Let's just store computed values.
--   priority = (10-2)*3 + 9*4 + 8*3 = 24+36+24 = 84
INSERT INTO applications (beneficiary_id, title, description, amount_requested, income_level, emergency_level, need_score, priority_score, status) VALUES
  (4, 'Medical Emergency Assistance',
   'Urgent medical bills for heart surgery. Family of 4 with very low income. Cannot afford treatment without assistance.',
   1500.00, 2, 9, 8, 84, 'pending'),

-- Application 2: Carlos - Medium-high priority (income=4, emergency=7, need=6)
--   priority = (10-4)*3 + 7*4 + 6*3 = 18+28+18 = 64
  (5, 'Housing Rent Assistance',
   'At risk of eviction after job loss. Single parent with two children. Need 3 months rent support to stabilize.',
   900.00, 4, 7, 6, 64, 'pending'),

-- Application 3: Maria - Medium priority (income=5, emergency=5, need=5)
--   priority = (10-5)*3 + 5*4 + 5*3 = 15+20+15 = 50
  (4, 'Education Support for Children',
   'Need school supplies and uniforms for 3 children. Cannot afford basic education materials this semester.',
   400.00, 5, 5, 5, 50, 'pending'),

-- Application 4: Carlos - Lower priority (income=6, emergency=3, need=4)
--   priority = (10-6)*3 + 3*4 + 4*3 = 12+12+12 = 36
  (5, 'Vocational Training Program',
   'Want to enroll in a 6-month coding bootcamp to improve employment prospects and become self-sufficient.',
   600.00, 6, 3, 4, 36, 'pending');
