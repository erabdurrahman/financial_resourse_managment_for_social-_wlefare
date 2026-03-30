// Donation routes - donor-only endpoints for managing contributions
const express = require('express');
const router = express.Router();
const { guestDonation, addDonation, getMyDonations, getTotalFunds } = require('../controllers/donationController');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/donations/guest  - submit a donation without authentication (guest users)
router.post('/guest', guestDonation);

// POST /api/donations       - submit a new donation (donors only)
router.post('/', authenticate, authorize('donor'), addDonation);

// GET  /api/donations/my    - retrieve logged-in donor's donation history
router.get('/my', authenticate, authorize('donor'), getMyDonations);

// GET  /api/donations/total - get fund totals (all authenticated users)
router.get('/total', authenticate, getTotalFunds);

module.exports = router;
