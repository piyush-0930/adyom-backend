const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { submitLead, getAllLeads, getLeadById, updateLeadStatus, deleteLead } = require('../controllers/corporateController');

router.post('/', submitLead);
router.get('/', protect, authorize('admin'), getAllLeads);
router.get('/:id', protect, authorize('admin'), getLeadById);
router.put('/:id', protect, authorize('admin'), updateLeadStatus);
router.delete('/:id', protect, authorize('admin'), deleteLead);

module.exports = router;