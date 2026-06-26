const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
    getAllContent, getContentById, getAllContentAdmin, createContent, updateContent,
    deleteContent, likeContent, markVideoProgress, getVideoProgress,
    submitModuleAssignment, getModuleSubmissions
} = require('../controllers/learningController');

router.get('/', optionalAuth, getAllContent);
// Video progress tracking (must be before /:id routes to avoid conflict)
router.post('/video-progress', protect, markVideoProgress);
router.get('/video-progress/:programId', protect, getVideoProgress);
// Module assignment submission
router.post('/module-submission', protect, submitModuleAssignment);
router.get('/module-submissions/:programId', protect, getModuleSubmissions);
router.get('/admin', protect, authorize('admin'), getAllContentAdmin);
router.get('/:id', optionalAuth, getContentById);
router.post('/', protect, authorize('admin'), createContent);
router.put('/:id', protect, authorize('admin'), updateContent);
router.delete('/:id', protect, authorize('admin'), deleteContent);
router.post('/:id/like', protect, likeContent);

module.exports = router;