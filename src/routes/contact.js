const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { submitContact, getAllContacts, updateContactStatus, deleteContact } = require('../controllers/contactController');

router.post('/', submitContact);
router.get('/', protect, authorize('admin'), getAllContacts);
router.put('/:id', protect, authorize('admin'), updateContactStatus);
router.delete('/:id', protect, authorize('admin'), deleteContact);

module.exports = router;