const Video = require('../models/Video');
const mongoose = require('mongoose');
const https = require('https');
const http = require('http');

exports.getVideoById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid video ID' });
        }

        const video = await Video.findById(id).populate('submittedBy', 'name avatar');

        if (!video) {
            return res.status(404).json({ success: false, message: 'Video not found' });
        }

        // Only return approved + public videos for unauthenticated access
        // (The optionalAuth middleware will set req.user if logged in)
        if (video.status !== 'approved' || !video.isPublic) {
            // Allow admins and the submitter to view non-public videos
            if (!req.user || (req.user.role !== 'admin' && String(video.submittedBy?._id || video.submittedBy) !== String(req.user._id))) {
                return res.status(404).json({ success: false, message: 'Video not found' });
            }
        }

        // Increment view count
        video.views = (video.views || 0) + 1;
        await video.save();

        res.json({ success: true, data: video });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.submitVideo = async (req, res) => {
    try {
        const { title, description, url, platform, category, program, thumbnail } = req.body;

        // Extract YouTube video ID for thumbnail if not provided
        let videoThumbnail = thumbnail || '';
        if (platform === 'youtube' && !videoThumbnail) {
            const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\n]+)/);
            if (videoId) videoThumbnail = `https://img.youtube.com/vi/${videoId[1]}/maxresdefault.jpg`;
        }

        const video = await Video.create({
            title,
            description,
            url,
            platform,
            thumbnail: videoThumbnail,
            submittedBy: req.user._id,
            submitterName: req.user.name,
            category,
            program: program || undefined,
            status: 'pending',
            isPublic: false
        });

        res.status(201).json({ success: true, data: video });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyVideos = async (req, res) => {
    try {
        const videos = await Video.find({ submittedBy: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: videos });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPublicVideos = async (req, res) => {
    try {
        const { page = 1, limit = 20, category } = req.query;
        const query = { status: 'approved', isPublic: true };
        if (category) query.category = category;

        const total = await Video.countDocuments(query);
        const videos = await Video.find(query)
            .populate('submittedBy', 'name avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: videos,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllVideosAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const query = {};
        if (status) query.status = status;

        const total = await Video.countDocuments(query);
        const videos = await Video.find(query)
            .populate('submittedBy', 'name avatar email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: videos,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.approveVideo = async (req, res) => {
    try {
        const { adminNote } = req.body;
        const video = await Video.findByIdAndUpdate(
            req.params.id,
            { status: 'approved', isPublic: true, reviewedBy: req.user._id, reviewedAt: new Date(), adminNote: adminNote || '' },
            { new: true }
        );
        if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
        res.json({ success: true, data: video });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.rejectVideo = async (req, res) => {
    try {
        const { adminNote } = req.body;
        const video = await Video.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected', isPublic: false, reviewedBy: req.user._id, reviewedAt: new Date(), adminNote: adminNote || '' },
            { new: true }
        );
        if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
        res.json({ success: true, data: video });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteVideo = async (req, res) => {
    try {
        const video = await Video.findByIdAndDelete(req.params.id);
        if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
        res.json({ success: true, message: 'Video deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Stream video through the backend to avoid CORS / cross-origin issues.
 * The <video> tag points to /api/videos/stream/:id which is same-origin.
 */
exports.streamVideo = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid video ID' });
        }

        const video = await Video.findById(id);

        if (!video) {
            return res.status(404).json({ success: false, message: 'Video not found' });
        }

        if (video.status !== 'approved' || !video.isPublic) {
            if (!req.user || (req.user.role !== 'admin' && String(video.submittedBy?._id || video.submittedBy) !== String(req.user._id))) {
                return res.status(404).json({ success: false, message: 'Video not found' });
            }
        }

        const videoUrl = video.url;
        const parsed = new URL(videoUrl);
        const client = parsed.protocol === 'https:' ? https : http;

        const proxyReq = client.request(videoUrl, { headers: { 'User-Agent': 'Adyom/1.0' } }, (proxyRes) => {
            // Forward relevant headers
            const headers = {};
            if (proxyRes.headers['content-type']) headers['Content-Type'] = proxyRes.headers['content-type'];
            if (proxyRes.headers['content-length']) headers['Content-Length'] = proxyRes.headers['content-length'];
            if (proxyRes.headers['accept-ranges']) headers['Accept-Ranges'] = proxyRes.headers['accept-ranges'];
            if (proxyRes.headers['content-range']) headers['Content-Range'] = proxyRes.headers['content-range'];

            // Support range requests for seeking
            if (proxyRes.statusCode === 206) {
                res.status(206);
            } else {
                res.status(proxyRes.statusCode);
            }

            res.set(headers);
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (err) => {
            // If the external URL fails, return a 502
            if (!res.headersSent) {
                res.status(502).json({ success: false, message: 'Video source unavailable' });
            }
        });

        // Handle range requests from the browser
        const range = req.headers.range;
        if (range) {
            proxyReq.setHeader('Range', range);
        }

        proxyReq.end();
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};