// Donation Controller - handles donor fund contributions
const db = require('../config/db');

/* Basic email validation helper */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * guestDonation - records a donation from an unauthenticated (guest) user
 * Body: { full_name, email, amount, message? }
 * No authentication required.
 */
const guestDonation = async (req, res) => {
  try {
    const { full_name, email, amount, message } = req.body;

    if (!full_name || typeof full_name !== 'string' || full_name.trim().length === 0) {
      return res.status(400).json({ message: 'Full name is required' });
    }
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'A valid email address is required' });
    }
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Valid donation amount is required' });
    }

    const sanitizedName  = full_name.trim().substring(0, 100);
    const sanitizedEmail = email.trim().substring(0, 100);
    const sanitizedMsg   = message ? String(message).trim() : '';

    const [result] = await db.query(
      'INSERT INTO donations (donor_id, guest_name, guest_email, amount, message) VALUES (NULL, ?, ?, ?, ?)',
      [sanitizedName, sanitizedEmail, parseFloat(amount), sanitizedMsg]
    );

    res.status(201).json({
      message: 'Thank you for your donation!',
      donationId: result.insertId
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * addDonation - records a new donation from the authenticated donor
 * Body: { amount, message? }
 */
const addDonation = async (req, res) => {
  try {
    const { amount, message } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Valid donation amount is required' });
    }

    const [result] = await db.query(
      'INSERT INTO donations (donor_id, amount, message) VALUES (?, ?, ?)',
      [req.user.id, parseFloat(amount), message || '']
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

module.exports = { guestDonation, addDonation, getMyDonations, getTotalFunds };
