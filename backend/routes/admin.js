// Admin routes - all endpoints require admin role
const express = require('express');
const router = express.Router();
const {
  getAllApplications,
  approveApplication,
  rejectApplication,
  getDashboardStats,
  getAllDonations,
  getAllUsers
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// Apply auth + admin-only authorization to all routes in this router
router.use(authenticate, authorize('admin'));

router.get('/applications',                getAllApplications);
router.put('/applications/:id/approve',    approveApplication);
router.put('/applications/:id/reject',     rejectApplication);
router.get('/stats',                       getDashboardStats);
router.get('/donations',                   getAllDonations);
router.get('/users',                       getAllUsers);

module.exports = router;
