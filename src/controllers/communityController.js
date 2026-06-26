const CommunityPost = require('../models/CommunityPost');
const CommunityAttendee = require('../models/CommunityAttendee');

exports.getPublicPosts = async (req, res) => {
    try {
        const { page = 1, limit = 20, category } = req.query;
        const query = { status: 'approved', isPublic: true };
        if (category) query.category = category;

        const total = await CommunityPost.countDocuments(query);
        const posts = await CommunityPost.find(query)
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: posts,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createPost = async (req, res) => {
    try {
        const { title, content, category, images } = req.body;
        const post = await CommunityPost.create({
            title,
            content,
            author: req.user._id,
            authorName: req.user.name,
            category,
            images: images || [],
            status: 'pending',
            isPublic: false
        });
        res.status(201).json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyPosts = async (req, res) => {
    try {
        const posts = await CommunityPost.find({ author: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: posts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllPostsAdmin = async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};
        if (status) query.status = status;

        const posts = await CommunityPost.find(query)
            .populate('author', 'name avatar email')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: posts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.approvePost = async (req, res) => {
    try {
        const post = await CommunityPost.findByIdAndUpdate(
            req.params.id,
            { status: 'approved', isPublic: true },
            { new: true }
        );
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
        res.json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.rejectPost = async (req, res) => {
    try {
        const post = await CommunityPost.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected', isPublic: false },
            { new: true }
        );
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
        res.json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await CommunityPost.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
        res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.likePost = async (req, res) => {
    try {
        const post = await CommunityPost.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        const likeIndex = post.likes.findIndex(l => l.toString() === req.user._id.toString());
        if (likeIndex > -1) post.likes.splice(likeIndex, 1);
        else post.likes.push(req.user._id);
        await post.save();
        res.json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Community Meet Guest Join (Drishti / Community Meets) ──────────────────

// Allow non-registered users to join a community meet for tracking
exports.meetJoin = async (req, res) => {
    try {
        const { name, email, organization, meetId, meetTitle, programId } = req.body;

        if (!name || !email || !meetId) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and meetId are required'
            });
        }

        // Check if this guest already joined this meet
        const existing = await CommunityAttendee.findOne({ email, meetId });
        if (existing) {
            return res.status(200).json({
                success: true,
                message: 'Already joined this meet',
                data: existing
            });
        }

        const attendee = await CommunityAttendee.create({
            name,
            email,
            organization: organization || '',
            meetId,
            meetTitle: meetTitle || '',
            program: programId || undefined,
            guestId: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
        });

        res.status(201).json({
            success: true,
            message: 'Successfully joined the meet',
            data: attendee
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Mark guest as leaving a meet
exports.meetLeave = async (req, res) => {
    try {
        const { meetId, email } = req.body;

        const attendee = await CommunityAttendee.findOne({ meetId, email });
        if (!attendee) {
            return res.status(404).json({ success: false, message: 'Attendee record not found' });
        }

        attendee.leftAt = new Date();
        attendee.duration = Math.round((attendee.leftAt - attendee.joinedAt) / (1000 * 60));
        await attendee.save();

        res.json({ success: true, data: attendee });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Get all attendees for a specific meet
exports.getMeetAttendees = async (req, res) => {
    try {
        const { meetId } = req.params;
        const attendees = await CommunityAttendee.find({ meetId })
            .sort({ joinedAt: -1 });

        res.json({ success: true, data: attendees });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Get all attendees grouped by meet/organization (for reports)
exports.getMeetAttendeeStats = async (req, res) => {
    try {
        const { organization, programId } = req.query;
        const query = {};
        if (organization) query.organization = organization;
        if (programId) query.program = programId;

        const stats = await CommunityAttendee.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$meetId',
                    meetTitle: { $first: '$meetTitle' },
                    totalAttendees: { $sum: 1 },
                    organizations: { $addToSet: '$organization' },
                    avgDuration: { $avg: '$duration' }
                }
            },
            { $sort: { totalAttendees: -1 } }
        ]);

        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const post = await CommunityPost.findById(req.params.id);
        if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

        post.comments.push({
            user: req.user._id,
            name: req.user.name,
            comment: req.body.comment
        });
        await post.save();
        res.json({ success: true, data: post });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};