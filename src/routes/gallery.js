const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');
const { getAllGallery, getAllGalleryAdmin, getGalleryById, createGallery, updateGallery, deleteGallery, uploadGalleryImage } = require('../controllers/galleryController');

// Local disk storage for gallery images
const galleryStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(process.cwd(), 'uploads', 'gallery');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `gallery_${Date.now()}${ext}`);
    }
});
const galleryUpload = multer({ storage: galleryStorage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', getAllGallery);
router.get('/admin/all', protect, authorize('admin'), getAllGalleryAdmin);
router.post('/upload', protect, authorize('admin'), galleryUpload.single('file'), uploadGalleryImage);
router.get('/:id', getGalleryById);
router.post('/', protect, authorize('admin'), createGallery);
router.put('/:id', protect, authorize('admin'), updateGallery);
router.delete('/:id', protect, authorize('admin'), deleteGallery);

module.exports = router;