// Application Controller - beneficiaries apply for and track financial assistance
const db = require('../config/db');

/**
 * applyForFunds - submits a new assistance application
 * Body: { title, description, amount_requested, income_level, emergency_level, need_score }
 * Priority score formula: (10 - income_level) * 3 + emergency_level * 4 + need_score * 3
 */
const applyForFunds = async (req, res) => {
  try {
    const { title, description, amount_requested, income_level, emergency_level, need_score } = req.body;

    // Validate all required fields are present
    if (!title || !description || !amount_requested || !income_level || !emergency_level || !need_score) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const inc = parseInt(income_level);
    const emg = parseInt(emergency_level);
    const nds = parseInt(need_score);

    // Each level must be between 1 and 10
    if ([inc, emg, nds].some(v => v < 1 || v > 10)) {
      return res.status(400).json({ message: 'Levels must be between 1 and 10' });
    }

    if (parseFloat(amount_requested) <= 0) {
      return res.status(400).json({ message: 'Amount requested must be positive' });
    }

    // Calculate priority score (higher = more urgent / more deserving), max 97
    const priority_score = (10 - inc) * 3 + emg * 4 + nds * 3;

    const [result] = await db.query(
      `INSERT INTO applications
         (beneficiary_id, title, description, amount_requested, income_level, emergency_level, need_score, priority_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, description, parseFloat(amount_requested), inc, emg, nds, priority_score]
    );

    res.status(201).json({
      message: 'Application submitted successfully',
      applicationId: result.insertId,
      priority_score
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
