const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { getVideoById, streamVideo, submitVideo, getMyVideos, getPublicVideos, getAllVideosAdmin, approveVideo, rejectVideo, deleteVideo } = require('../controllers/videoController');

router.get('/public', optionalAuth, getPublicVideos);
router.get('/my', protect, getMyVideos);
router.get('/admin', protect, authorize('admin'), getAllVideosAdmin);
router.get('/stream/:id', optionalAuth, streamVideo);
router.get('/:id', optionalAuth, getVideoById);
router.post('/', protect, submitVideo);
router.put('/:id/approve', protect, authorize('admin'), approveVideo);
router.put('/:id/reject', protect, authorize('admin'), rejectVideo);
router.delete('/:id', protect, authorize('admin'), deleteVideo);

module.exports = router;