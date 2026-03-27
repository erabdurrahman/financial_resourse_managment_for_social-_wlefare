// Application Controller - beneficiaries apply for and track financial assistance
const path = require('path');
const db = require('../config/db');

/**
 * calculatePriorityScore - server-side priority calculation; users cannot influence this
 * Factors:
 *   income        : < $10k → +30, < $20k → +20, < $30k → +10
 *   family_members: > 5 → +20, > 3 → +10
 *   urgency       : Critical → +30, High → +20, Medium → +10, Low → +5
 *   documents     : at least one document uploaded → +20
 * Maximum possible score: 100
 */
function calculatePriorityScore({ income, family_members, urgency, hasDocuments }) {
  let score = 0;

  // Income factor (max 30)
  const inc = parseFloat(income);
  if (inc < 10000)      score += 30;
  else if (inc < 20000) score += 20;
  else if (inc < 30000) score += 10;

  // Family factor (max 20)
  const fam = parseInt(family_members);
  if (fam > 5)      score += 20;
  else if (fam > 3) score += 10;

  // Urgency factor (max 30)
  const urgencyMap = { Critical: 30, High: 20, Medium: 10, Low: 5 };
  score += urgencyMap[urgency] || 0;

  // Documents factor (max 20)
  if (hasDocuments) score += 20;

  return score;  // max 100
}

/**
 * priorityLevel - derives a human-readable tier from the numeric score
 */
function priorityLevel(score) {
  if (score >= 60) return 'High';
  if (score >= 30) return 'Medium';
  return 'Low';
}

/**
 * applyForFunds - submits a new assistance application
 * Accepts multipart/form-data (for file uploads) or JSON.
 * Body fields: phone, address, income, family_members, employment_status,
 *              amount, category, reason, urgency
 * Files (optional): income_proof, id_proof, supporting_docs
 * Priority score is calculated entirely on the server side.
 */
const applyForFunds = async (req, res) => {
  try {
    const {
      phone, address,
      income, family_members, employment_status,
      amount, category, reason, urgency
    } = req.body;

    // Validate required fields
    if (!income || !family_members || !employment_status ||
        !amount || !category || !reason || !urgency) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const validCategories = ['Medical', 'Education', 'Emergency', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const validUrgency = ['Low', 'Medium', 'High', 'Critical'];
    if (!validUrgency.includes(urgency)) {
      return res.status(400).json({ message: 'Invalid urgency level' });
    }

    if (parseFloat(income) < 0) {
      return res.status(400).json({ message: 'Income must be a non-negative number' });
    }

    if (parseInt(family_members) < 1) {
      return res.status(400).json({ message: 'Family members must be at least 1' });
    }

    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Amount requested must be positive' });
    }

    // Collect uploaded file paths (relative to uploads directory)
    const uploadedFiles = [];
    if (req.files) {
      ['income_proof', 'id_proof', 'supporting_docs'].forEach(field => {
        const files = req.files[field];
        if (files && files.length > 0) {
          files.forEach(f => uploadedFiles.push(`uploads/${f.filename}`));
        }
      });
    }
    const documents_path = uploadedFiles.length > 0
      ? JSON.stringify(uploadedFiles)
      : null;

    // Server-side priority calculation – user has no control over this
    const score = calculatePriorityScore({
      income,
      family_members,
      urgency,
      hasDocuments: uploadedFiles.length > 0
    });
    const level = priorityLevel(score);

    const [result] = await db.query(
      `INSERT INTO applications
         (beneficiary_id, phone, address, income, family_members, employment_status,
          amount, category, reason, urgency, documents_path, priority_score, priority_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        phone   || null,
        address || null,
        parseFloat(income),
        parseInt(family_members),
        employment_status,
        parseFloat(amount),
        category,
        reason,
        urgency,
        documents_path,
        score,
        level
      ]
    );

    res.status(201).json({
      message: 'Application submitted successfully',
      applicationId: result.insertId,
      priority_score: score,
      priority_level: level
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * getMyApplications - returns all applications submitted by the logged-in beneficiary
 */
const getMyApplications = async (req, res) => {
  try {
    const [applications] = await db.query(
      'SELECT * FROM applications WHERE beneficiary_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * getApplicationDetails - retrieves a single application with beneficiary and reviewer info
 * Beneficiaries can only view their own applications; admins can view all
 */
const getApplicationDetails = async (req, res) => {
  try {
    const [applications] = await db.query(
      `SELECT a.*,
              u.name  AS beneficiary_name,
              u.email AS beneficiary_email,
              r.name  AS reviewer_name
       FROM applications a
       JOIN users u ON a.beneficiary_id = u.id
       LEFT JOIN users r ON a.reviewed_by = r.id
       WHERE a.id = ?`,
      [req.params.id]
    );

    if (applications.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const app = applications[0];

    // Beneficiaries may only see their own application
    if (req.user.role === 'beneficiary' && app.beneficiary_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(app);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { applyForFunds, getMyApplications, getApplicationDetails };
