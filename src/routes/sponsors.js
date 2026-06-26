const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createSponsorCode, getAllSponsorCodes, toggleSponsorCode, deleteSponsorCode, validateSponsorCode, enrollProgram } = require('../controllers/sponsorController');

// Public: validate a sponsor code
router.post('/validate', validateSponsorCode);

// Protected: enroll in a program (with optional sponsor code)
router.post('/enroll', protect, enrollProgram);

// Admin routes
router.get('/', protect, authorize('admin'), getAllSponsorCodes);
router.post('/', protect, authorize('admin'), createSponsorCode);
router.put('/:id/toggle', protect, authorize('admin'), toggleSponsorCode);
router.delete('/:id', protect, authorize('admin'), deleteSponsorCode);

module.exports = router;