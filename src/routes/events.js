const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getEvents, getAllEventsAdmin, getEventById, createEvent, updateEvent, deleteEvent, registerForEvent } = require('../controllers/eventController');

router.get('/', getEvents);
router.get('/admin', protect, authorize('admin'), getAllEventsAdmin);
router.get('/:id', getEventById);
router.post('/', protect, authorize('admin'), createEvent);
router.put('/:id', protect, authorize('admin'), updateEvent);
router.delete('/:id', protect, authorize('admin'), deleteEvent);
router.post('/:id/register', protect, registerForEvent);

module.exports = router;