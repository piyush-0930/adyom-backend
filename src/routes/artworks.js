const express = require('express');
const router = express.Router();
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { submitArtwork, adminCreateArtwork, getMyArtworks, getPublicArtworks, getAllArtworksAdmin, approveArtwork, rejectArtwork, deleteArtwork, likeArtwork, toggleInnovative } = require('../controllers/artworkController');
const { upload } = require('../config/cloudinary');

router.get('/public', optionalAuth, getPublicArtworks);
router.get('/my', protect, getMyArtworks);

// Member submission (no file upload — images come as URLs)
router.post('/', protect, submitArtwork);

// File upload endpoint
router.post('/upload', protect, upload.single('file'), (req, res) => res.json({ success: true, data: { url: req.file.path } }));

// Admin-specific: create with image upload (uses multer field 'image')
router.post('/admin', protect, authorize('admin'), upload.single('image'), adminCreateArtwork);

router.get('/admin', protect, authorize('admin'), getAllArtworksAdmin);
router.put('/:id/approve', protect, authorize('admin'), approveArtwork);
router.put('/:id/reject', protect, authorize('admin'), rejectArtwork);
router.put('/:id/innovative', protect, authorize('admin'), toggleInnovative);
router.delete('/:id', protect, authorize('admin'), deleteArtwork);
router.post('/:id/like', protect, likeArtwork);

module.exports = router;