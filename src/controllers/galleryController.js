const Gallery = require('../models/Gallery');

// Public: only published items
exports.getAllGallery = async (req, res) => {
    try {
        const { page = 1, limit = 50, category } = req.query;
        const query = { isPublished: true };
        if (category && category !== 'all') query.category = category;

        const total = await Gallery.countDocuments(query);
        const gallery = await Gallery.find(query)
            .populate('uploadedBy', 'name avatar')
            .sort({ featured: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: gallery,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: all items regardless of publish status
exports.getAllGalleryAdmin = async (req, res) => {
    try {
        const gallery = await Gallery.find({})
            .populate('uploadedBy', 'name avatar')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: gallery });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getGalleryById = async (req, res) => {
    try {
        const gallery = await Gallery.findById(req.params.id).populate('uploadedBy', 'name avatar');
        if (!gallery) return res.status(404).json({ success: false, message: 'Gallery not found' });
        res.json({ success: true, data: gallery });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createGallery = async (req, res) => {
    try {
        req.body.uploadedBy = req.user._id;
        req.body.isPublished = true;
        const gallery = await Gallery.create(req.body);
        res.status(201).json({ success: true, data: gallery });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateGallery = async (req, res) => {
    try {
        const gallery = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!gallery) return res.status(404).json({ success: false, message: 'Gallery not found' });
        res.json({ success: true, data: gallery });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteGallery = async (req, res) => {
    try {
        const gallery = await Gallery.findByIdAndDelete(req.params.id);
        if (!gallery) return res.status(404).json({ success: false, message: 'Item not found' });
        res.json({ success: true, message: 'Gallery item deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.uploadGalleryImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
        // Relative URL — Vite proxy forwards /uploads to backend port 5001
        const url = `/uploads/gallery/${req.file.filename}`;
        res.json({ success: true, data: { url, filename: req.file.filename } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};