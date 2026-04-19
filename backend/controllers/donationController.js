// Donation Controller - handles donor fund contributions
const db = require('../config/db');

const VALID_PURPOSES = [
  'General Welfare', 'Medical Aid', 'Education',
  'Emergency Relief', 'Food & Nutrition', 'Shelter', 'Other'
];

/**
 * addDonation - records a new donation from the authenticated donor
 * Body: { amount, purpose?, message? }
 */
const addDonation = async (req, res) => {
  try {
    const { amount, purpose, message } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Valid donation amount is required' });
    }

    const resolvedPurpose = purpose && VALID_PURPOSES.includes(purpose) ? purpose : 'General Welfare';

    const [result] = await db.query(
      'INSERT INTO donations (donor_id, amount, purpose, message) VALUES (?, ?, ?, ?)',
      [req.user.id, parseFloat(amount), resolvedPurpose, message || '']
    );

    res.status(201).json({
      message: 'Donation added successfully',
      donationId: result.insertId
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * getMyDonations - returns all donations made by the logged-in donor
 */
const getMyDonations = async (req, res) => {
  try {
    const [donations] = await db.query(
      'SELECT * FROM donations WHERE donor_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * getTotalFunds - returns financial summary:
 *   total_donated, total_allocated, available_funds
 */
const getTotalFunds = async (req, res) => {
  try {
    const [[{ total_donated }]] = await db.query(
      'SELECT COALESCE(SUM(amount), 0) as total_donated FROM donations'
    );
    const [[{ total_allocated }]] = await db.query(
      "SELECT COALESCE(SUM(amount), 0) as total_allocated FROM transactions WHERE type = 'allocation'"
    );

    const available = parseFloat(total_donated) - parseFloat(total_allocated);

    res.json({
      total_donated: parseFloat(total_donated),
      total_allocated: parseFloat(total_allocated),
      available_funds: available
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { addDonation, getMyDonations, getTotalFunds };
