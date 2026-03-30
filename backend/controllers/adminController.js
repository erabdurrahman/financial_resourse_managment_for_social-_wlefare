// Admin Controller - platform management for admin users only
const db = require('../config/db');

/**
 * scoreBreakdown - reconstruct the individual factor scores for display purposes
 * Mirrors the logic in applicationController.calculatePriorityScore
 */
function scoreBreakdown(app) {
  let incomeFactor = 0;
  const inc = parseFloat(app.income || 0);
  if (inc < 10000)      incomeFactor = 30;
  else if (inc < 20000) incomeFactor = 20;
  else if (inc < 30000) incomeFactor = 10;

  let familyFactor = 0;
  const fam = parseInt(app.family_members || 0);
  if (fam > 5)      familyFactor = 20;
  else if (fam > 3) familyFactor = 10;

  const urgencyMap = { Critical: 30, High: 20, Medium: 10, Low: 5 };
  const urgencyFactor = urgencyMap[app.urgency] || 0;

  const documentFactor = app.documents_path ? 20 : 0;

  return { incomeFactor, familyFactor, urgencyFactor, documentFactor };
}

/**
 * getAllApplications - returns all applications sorted by priority (highest first)
 * Includes beneficiary and reviewer details via JOIN, plus score breakdown
 */
const getAllApplications = async (req, res) => {
  try {
    const [applications] = await db.query(
      `SELECT a.*,
              u.name  AS beneficiary_name,
              u.email AS beneficiary_email,
              r.name  AS reviewer_name
       FROM applications a
       JOIN users u ON a.beneficiary_id = u.id
       LEFT JOIN users r ON a.reviewed_by = r.id
       ORDER BY a.priority_score DESC, a.created_at ASC`
    );
    // Attach score breakdown to each application
    const enriched = applications.map(a => ({
      ...a,
      score_breakdown: scoreBreakdown(a)
    }));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * approveApplication - approves a pending application and allocates funds
 * Uses a database transaction to ensure atomic update + transaction record insertion
 */
const approveApplication = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Fetch the application
    const [apps] = await connection.query(
      'SELECT * FROM applications WHERE id = ?',
      [req.params.id]
    );
    if (apps.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Application not found' });
    }

    const app = apps[0];

    if (app.status !== 'pending') {
      await connection.rollback();
      return res.status(400).json({ message: 'Application is not pending' });
    }

    // Check that sufficient funds are available
    const [[{ total_donated }]] = await connection.query(
      'SELECT COALESCE(SUM(amount), 0) as total_donated FROM donations'
    );
    const [[{ total_allocated }]] = await connection.query(
      "SELECT COALESCE(SUM(amount), 0) as total_allocated FROM transactions WHERE type = 'allocation'"
    );

    const available = parseFloat(total_donated) - parseFloat(total_allocated);

    if (parseFloat(app.amount) > available) {
      await connection.rollback();
      return res.status(400).json({
        message: `Insufficient funds. Available: $${available.toFixed(2)}, Requested: $${parseFloat(app.amount).toFixed(2)}`
      });
    }

    // Update application to approved and record reviewer details
    await connection.query(
      `UPDATE applications
       SET status = 'approved', amount_allocated = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE id = ?`,
      [app.amount, req.user.id, app.id]
    );

    // Insert allocation transaction record
    await connection.query(
      `INSERT INTO transactions (application_id, beneficiary_id, amount, type)
       VALUES (?, ?, ?, 'allocation')`,
      [app.id, app.beneficiary_id, app.amount]
    );

    await connection.commit();
    res.json({
      message: 'Application approved successfully',
      amount_allocated: parseFloat(app.amount)
    });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    connection.release();
  }
};

/**
 * rejectApplication - rejects a pending application without fund allocation
 */
const rejectApplication = async (req, res) => {
  try {
    const [apps] = await db.query(
      'SELECT * FROM applications WHERE id = ?',
      [req.params.id]
    );
    if (apps.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }
    if (apps[0].status !== 'pending') {
      return res.status(400).json({ message: 'Application is not pending' });
    }

    await db.query(
      `UPDATE applications
       SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW()
       WHERE id = ?`,
      [req.user.id, req.params.id]
    );

    res.json({ message: 'Application rejected' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * getDashboardStats - aggregated stats for the admin overview panel
 */
const getDashboardStats = async (req, res) => {
  try {
    const [[{ total_users }]]         = await db.query('SELECT COUNT(*) as total_users FROM users');
    const [[{ total_donations }]]     = await db.query('SELECT COALESCE(SUM(amount), 0) as total_donations FROM donations');
    const [[{ total_applications }]]  = await db.query('SELECT COUNT(*) as total_applications FROM applications');
    const [[{ pending_applications }]]= await db.query("SELECT COUNT(*) as pending_applications FROM applications WHERE status = 'pending'");
    const [[{ approved_applications }]]= await db.query("SELECT COUNT(*) as approved_applications FROM applications WHERE status = 'approved'");
    const [[{ total_allocated }]]     = await db.query("SELECT COALESCE(SUM(amount), 0) as total_allocated FROM transactions WHERE type = 'allocation'");

    res.json({
      total_users,
      total_donations:      parseFloat(total_donations),
      total_applications,
      pending_applications,
      approved_applications,
      total_allocated:      parseFloat(total_allocated),
      available_funds:      parseFloat(total_donations) - parseFloat(total_allocated)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * getAllDonations - returns all donations with donor info
 */
const getAllDonations = async (req, res) => {
  try {
    const [donations] = await db.query(
      `SELECT d.*, u.name AS donor_name, u.email AS donor_email
       FROM donations d
       JOIN users u ON d.donor_id = u.id
       ORDER BY d.created_at DESC`
    );
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * getAllUsers - returns all registered users (passwords excluded)
 */
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getAllApplications,
  approveApplication,
  rejectApplication,
  getDashboardStats,
  getAllDonations,
  getAllUsers
};
