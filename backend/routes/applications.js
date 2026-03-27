// Application routes - beneficiary endpoints for welfare applications
const express = require('express');
const router = express.Router();
const { applyForFunds, getMyApplications, getApplicationDetails } = require('../controllers/applicationController');
const { authenticate, authorize } = require('../middleware/auth');

// POST /api/applications     - submit an assistance application (beneficiaries only)
// Accepts multipart/form-data so documents can be uploaded alongside the form fields.
// Multer instance is created here using the shared config stored in app.locals.
router.post('/', authenticate, authorize('beneficiary'), (req, res, next) => {
  // Retrieve the upload instance created in server.js
  const upload = req.app.locals.upload;
  upload.fields([
    { name: 'income_proof',     maxCount: 1 },
    { name: 'id_proof',         maxCount: 1 },
    { name: 'supporting_docs',  maxCount: 3 }
  ])(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, applyForFunds);

// GET  /api/applications/my  - list applications for logged-in beneficiary
router.get('/my', authenticate, authorize('beneficiary'), getMyApplications);

// GET  /api/applications/:id - view a single application (own only for beneficiary, any for admin)
router.get('/:id', authenticate, getApplicationDetails);

module.exports = router;
