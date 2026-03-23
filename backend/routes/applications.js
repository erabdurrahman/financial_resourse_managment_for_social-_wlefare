// Application routes - beneficiary endpoints for welfare applications
const express = require('express');
const router = express.Router();
const { applyForFunds, getMyApplications, getApplicationDetails } = require('../controllers/applicationController');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/applications     - submit an assistance application (beneficiaries only)
router.post('/', authenticate, authorize('beneficiary'), applyForFunds);

// GET  /api/applications/my  - list applications for logged-in beneficiary
router.get('/my', authenticate, authorize('beneficiary'), getMyApplications);

// GET  /api/applications/:id - view a single application (own only for beneficiary, any for admin)
router.get('/:id', authenticate, getApplicationDetails);

module.exports = router;
