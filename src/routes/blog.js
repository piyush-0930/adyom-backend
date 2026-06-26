const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { getAllPosts, getPostBySlug, createPost, updatePost, deletePost, likePost, addComment } = require('../controllers/blogController');
const { upload } = require('../config/cloudinary');

router.get('/', optionalAuth, getAllPosts);
router.get('/slug/:slug', getPostBySlug);
router.get('/:slug', getPostBySlug);
router.post('/', protect, authorize('admin'), upload.single('coverImage'), createPost);
router.put('/:id', protect, authorize('admin'), upload.single('coverImage'), updatePost);
router.delete('/:id', protect, authorize('admin'), deletePost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comment', protect, addComment);

module.exports = router;