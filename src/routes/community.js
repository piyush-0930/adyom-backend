const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { getPublicPosts, createPost, getMyPosts, getAllPostsAdmin, approvePost, rejectPost, deletePost, likePost, addComment, meetJoin, meetLeave, getMeetAttendees, getMeetAttendeeStats } = require('../controllers/communityController');

// Community meet guest tracking (Drishti) — no auth required
router.post('/meet-join', meetJoin);
router.post('/meet-leave', meetLeave);
router.get('/meet-attendees/:meetId', protect, authorize('admin'), getMeetAttendees);
router.get('/meet-stats', protect, authorize('admin'), getMeetAttendeeStats);

router.get('/public', optionalAuth, getPublicPosts);
router.get('/my', protect, getMyPosts);
router.post('/', protect, createPost);
router.get('/admin', protect, authorize('admin'), getAllPostsAdmin);
router.put('/:id/approve', protect, authorize('admin'), approvePost);
router.put('/:id/reject', protect, authorize('admin'), rejectPost);
router.delete('/:id', protect, authorize('admin'), deletePost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comment', protect, addComment);

module.exports = router;