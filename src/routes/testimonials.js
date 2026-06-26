const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getTestimonials, getAllTestimonialsAdmin, createTestimonial, updateTestimonial, deleteTestimonial } = require('../controllers/testimonialController');

router.get('/', getTestimonials);
router.get('/admin', protect, authorize('admin'), getAllTestimonialsAdmin);
router.post('/', protect, authorize('admin'), createTestimonial);
router.put('/:id', protect, authorize('admin'), updateTestimonial);
router.delete('/:id', protect, authorize('admin'), deleteTestimonial);

module.exports = router;