const Artwork = require('../models/Artwork');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const { upload, uploadPDF } = require('../config/cloudinary');
const { sendArtworkStatusEmail } = require('../services/email');

// Helper: check and auto-issue certificates based on approved artwork count
const checkAndIssueCertificates = async (userId, programId) => {
    try {
        // Count approved artworks for this user in this program, grouped by moduleName
        const approvedArtworks = await Artwork.find({
            artist: userId,
            program: programId,
            status: 'approved'
        });

        const approvedCount = approvedArtworks.length;

        // Count distinct modules with approved submissions
        const distinctModules = new Set(
            approvedArtworks
                .filter(a => a.moduleName)
                .map(a => a.moduleName)
        ).size;

        // Excellence Certificate: 3 or 6 modules with approved submissions
        if (distinctModules >= 3) {
            const existing3 = await Certificate.findOne({
                user: userId,
                program: programId,
                certificateType: 'excellence',
                title: 'Excellence Certificate - Level 1'
            });
            if (!existing3) {
                const adminUser = await User.findOne({ role: 'admin' });
                await Certificate.create({
                    title: 'Excellence Certificate - Level 1',
                    description: 'Awarded for submitting approved artworks across 3 modules.',
                    user: userId,
                    program: programId,
                    certificateType: 'excellence',
                    issuedBy: adminUser?._id || userId
                });
                console.log(`Excellence Level 1 certificate issued to user ${userId}`);
            }
        }

        if (distinctModules >= 6) {
            const existing6 = await Certificate.findOne({
                user: userId,
                program: programId,
                certificateType: 'excellence',
                title: 'Excellence Certificate - Level 2'
            });
            if (!existing6) {
                const adminUser = await User.findOne({ role: 'admin' });
                await Certificate.create({
                    title: 'Excellence Certificate - Level 2',
                    description: 'Awarded for submitting approved artworks across 6 modules.',
                    user: userId,
                    program: programId,
                    certificateType: 'excellence',
                    issuedBy: adminUser?._id || userId
                });
                console.log(`Excellence Level 2 certificate issued to user ${userId}`);
            }
        }
    } catch (err) {
        console.error('Certificate auto-issue error:', err);
    }
};

exports.submitArtwork = async (req, res) => {
    try {
        const { title, description, category, program, programModuleId, moduleName, submissionType } = req.body;

        const artwork = await Artwork.create({
            title,
            description,
            artist: req.user._id,
            artistName: req.user.name,
            images: req.body.images || [],
            pdfs: req.body.pdfs || [],
            category,
            program: program || undefined,
            programModuleId: programModuleId || null,
            moduleName: moduleName || '',
            submissionType: submissionType || 'artwork',
            status: 'pending',
            isPublic: false
        });

        res.status(201).json({ success: true, data: artwork });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin-only create: allows setting status/isPublic and uploading image via multer
exports.adminCreateArtwork = async (req, res) => {
    try {
        const { title, description, category, artistName, status, isPublic, program, programModuleId, moduleName, submissionType } = req.body;

        const images = [];
        // Single file uploaded via multer field 'image'
        if (req.file) {
            images.push({ url: req.file.path, caption: title || '' });
        }

        const artwork = await Artwork.create({
            title,
            description: description || '',
            artist: req.user._id,
            artistName: artistName || req.user.name,
            images,
            category: category || 'other',
            program: program || undefined,
            programModuleId: programModuleId || null,
            moduleName: moduleName || '',
            submissionType: submissionType || 'artwork',
            status: status || 'approved',
            isPublic: isPublic === 'true' || isPublic === true || true,
            reviewedBy: req.user._id,
            reviewedAt: new Date(),
        });

        // Trigger certificate check if approved
        if (artwork.status === 'approved' && artwork.program) {
            await checkAndIssueCertificates(artwork.artist, artwork.program);
        }

        res.status(201).json({ success: true, data: artwork });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyArtworks = async (req, res) => {
    try {
        const artworks = await Artwork.find({ artist: req.user._id })
            .sort({ createdAt: -1 });
        res.json({ success: true, data: artworks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPublicArtworks = async (req, res) => {
    try {
        const { page = 1, limit = 20, category } = req.query;
        const query = { status: 'approved', isPublic: true };
        if (category) query.category = category;

        const total = await Artwork.countDocuments(query);
        const artworks = await Artwork.find(query)
            .populate('artist', 'name avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: artworks,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllArtworksAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const query = {};
        if (status) query.status = status;

        const total = await Artwork.countDocuments(query);
        const artworks = await Artwork.find(query)
            .populate('artist', 'name avatar email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: artworks,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.approveArtwork = async (req, res) => {
    try {
        const { adminNote } = req.body;
        const artwork = await Artwork.findByIdAndUpdate(
            req.params.id,
            { status: 'approved', isPublic: true, reviewedBy: req.user._id, reviewedAt: new Date(), adminNote: adminNote || '' },
            { new: true }
        );
        if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });

        // Send email notification
        const artist = await User.findById(artwork.artist);
        try { await sendArtworkStatusEmail(artist, artwork, 'approved'); } catch (e) { console.error(e); }

        // Auto-check and issue certificates when artwork is approved
        if (artwork.program) {
            await checkAndIssueCertificates(artwork.artist, artwork.program);
        }

        res.json({ success: true, data: artwork });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.rejectArtwork = async (req, res) => {
    try {
        const { adminNote } = req.body;
        const artwork = await Artwork.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected', isPublic: false, reviewedBy: req.user._id, reviewedAt: new Date(), adminNote: adminNote || '' },
            { new: true }
        );
        if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });

        const artist = await User.findById(artwork.artist);
        try { await sendArtworkStatusEmail(artist, artwork, 'rejected'); } catch (e) { console.error(e); }

        res.json({ success: true, data: artwork });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteArtwork = async (req, res) => {
    try {
        const artwork = await Artwork.findByIdAndDelete(req.params.id);
        if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });
        res.json({ success: true, message: 'Artwork deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Toggle "Most Innovative" nomination on an artwork
exports.toggleInnovative = async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });

        artwork.isInnovative = !artwork.isInnovative;
        if (artwork.isInnovative) {
            artwork.innovativeNominatedBy = req.user._id;
            artwork.innovativeNominatedAt = new Date();
        } else {
            artwork.innovativeNominatedBy = null;
            artwork.innovativeNominatedAt = null;
        }
        await artwork.save();

        res.json({ success: true, data: artwork });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.likeArtwork = async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        if (!artwork) return res.status(404).json({ success: false, message: 'Artwork not found' });

        const likeIndex = artwork.likes.findIndex(l => l.toString() === req.user._id.toString());
        if (likeIndex > -1) artwork.likes.splice(likeIndex, 1);
        else artwork.likes.push(req.user._id);
        await artwork.save();
        res.json({ success: true, data: artwork });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};