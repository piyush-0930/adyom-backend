const User = require('../models/User');
const Artwork = require('../models/Artwork');
const Certificate = require('../models/Certificate');

// ─── Pratibimb Attendance ────────────────────────────────────────────────────

// Mark daily attendance for a program (Pratibimb 41-day sadhana)
exports.markAttendance = async (req, res) => {
    try {
        const { programId } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Find the enrolled program entry
        const enrollment = user.enrolledPrograms.find(
            ep => ep.program.toString() === programId
        );

        if (!enrollment) {
            return res.status(400).json({ success: false, message: 'Not enrolled in this program' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if attendance already marked for today
        const alreadyMarked = enrollment.attendance.some(
            a => new Date(a.date).setHours(0, 0, 0, 0) === today.getTime()
        );

        if (alreadyMarked) {
            return res.status(400).json({ success: false, message: 'Attendance already marked for today' });
        }

        enrollment.attendance.push({ date: new Date(), marked: true });
        await user.save();

        res.json({
            success: true,
            message: 'Attendance marked successfully',
            data: { attendanceCount: enrollment.attendance.length }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get attendance stats for a user's enrolled program
exports.getAttendance = async (req, res) => {
    try {
        const { programId } = req.params;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const enrollment = user.enrolledPrograms.find(
            ep => ep.program.toString() === programId
        );

        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Not enrolled in this program' });
        }

        res.json({
            success: true,
            data: {
                totalDays: enrollment.attendance.length,
                attendance: enrollment.attendance
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Gamification & Leaderboard ──────────────────────────────────────────────

// Get top attendees across all programs (admin dashboard)
exports.getLeaderboard = async (req, res) => {
    try {
        const { programId, limit = 10 } = req.query;

        const matchStage = {};
        if (programId) {
            matchStage['enrolledPrograms.program'] = require('mongoose').Types.ObjectId(programId);
        }

        const users = await User.aggregate([
            { $unwind: '$enrolledPrograms' },
            { $match: programId ? { 'enrolledPrograms.program': require('mongoose').Types.ObjectId(programId) } : {} },
            {
                $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    email: { $first: '$email' },
                    avatar: { $first: '$avatar' },
                    totalAttendance: { $sum: { $size: { $ifNull: ['$enrolledPrograms.attendance', []] } } }
                }
            },
            { $sort: { totalAttendance: -1 } },
            { $limit: parseInt(limit) }
        ]);

        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get top submitters (max approved artworks)
exports.getTopSubmitters = async (req, res) => {
    try {
        const { programId, limit = 10 } = req.query;

        const matchStage = { status: 'approved' };
        if (programId) {
            matchStage.program = require('mongoose').Types.ObjectId(programId);
        }

        const topSubmitters = await Artwork.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$artist',
                    submissionCount: { $sum: 1 },
                    artworks: { $push: { title: '$title', moduleName: '$moduleName', submissionType: '$submissionType' } }
                }
            },
            { $sort: { submissionCount: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'artist'
                }
            },
            { $unwind: '$artist' },
            {
                $project: {
                    _id: 1,
                    submissionCount: 1,
                    'artist.name': 1,
                    'artist.email': 1,
                    'artist.avatar': 1
                }
            }
        ]);

        res.json({ success: true, data: topSubmitters });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get most innovative artists (count of artworks marked as innovative)
exports.getMostInnovative = async (req, res) => {
    try {
        const { programId, limit = 10 } = req.query;

        const matchStage = { isInnovative: true };
        if (programId) {
            matchStage.program = require('mongoose').Types.ObjectId(programId);
        }

        const topInnovative = await Artwork.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$artist',
                    innovativeCount: { $sum: 1 },
                    artworks: { $push: { title: '$title', moduleName: '$moduleName' } }
                }
            },
            { $sort: { innovativeCount: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'artist'
                }
            },
            { $unwind: '$artist' },
            {
                $project: {
                    _id: 1,
                    innovativeCount: 1,
                    artworks: 1,
                    'artist.name': 1,
                    'artist.email': 1,
                    'artist.avatar': 1
                }
            }
        ]);

        res.json({ success: true, data: topInnovative });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

// Get overall dashboard stats for the logged-in user
exports.getMyDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const [totalArtworks, approvedArtworks, pendingArtworks, certificates, user] = await Promise.all([
            Artwork.countDocuments({ artist: userId }),
            Artwork.countDocuments({ artist: userId, status: 'approved' }),
            Artwork.countDocuments({ artist: userId, status: 'pending' }),
            Certificate.countDocuments({ user: userId }),
            User.findById(userId).select('enrolledPrograms')
        ]);

        const enrolledCount = user?.enrolledPrograms?.length || 0;
        const totalAttendance = user?.enrolledPrograms?.reduce(
            (sum, ep) => sum + (ep.attendance?.length || 0), 0
        ) || 0;

        res.json({
            success: true,
            data: {
                totalArtworks,
                approvedArtworks,
                pendingArtworks,
                certificates,
                enrolledPrograms: enrolledCount,
                totalAttendance
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};