const Learning = require('../models/Learning');
const User = require('../models/User');

exports.getAllContent = async (req, res) => {
    try {
        const { page = 1, limit = 20, type, category, program, featured } = req.query;
        const query = { isPublished: true };
        if (type) query.type = type;
        if (category) query.category = category;
        if (program) query.program = program;
        if (featured === 'true') query.featured = true;

        const total = await Learning.countDocuments(query);
        const content = await Learning.find(query)
            .populate('author', 'name avatar')
            .populate('program', 'title slug')
            .sort({ order: 1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: content,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getContentById = async (req, res) => {
    try {
        const content = await Learning.findById(req.params.id)
            .populate('author', 'name avatar')
            .populate('program', 'title slug');
        if (!content) return res.status(404).json({ success: false, message: 'Content not found' });

        content.views += 1;
        await content.save();

        res.json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllContentAdmin = async (req, res) => {
    try {
        const content = await Learning.find()
            .populate('author', 'name')
            .populate('program', 'title')
            .sort({ order: 1, createdAt: -1 });
        res.json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createContent = async (req, res) => {
    try {
        req.body.author = req.user._id;
        req.body.authorName = req.user.name;
        const content = await Learning.create(req.body);
        res.status(201).json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateContent = async (req, res) => {
    try {
        const content = await Learning.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!content) return res.status(404).json({ success: false, message: 'Content not found' });
        res.json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteContent = async (req, res) => {
    try {
        const content = await Learning.findByIdAndDelete(req.params.id);
        if (!content) return res.status(404).json({ success: false, message: 'Content not found' });
        res.json({ success: true, message: 'Content deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Video Progress Tracking (KalaPath Online / Chaitanya / Sparsh) ──────────

// Mark a video as watched/completed for the current user within a program
exports.markVideoProgress = async (req, res) => {
    try {
        const { programId, videoId, moduleTitle, sessionIndex, lastPosition, completed } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Find the enrolled program
        const enrollment = user.enrolledPrograms.find(
            ep => ep.program.toString() === programId
        );

        if (!enrollment) {
            return res.status(400).json({ success: false, message: 'Not enrolled in this program' });
        }

        // Initialize videoProgress array if it doesn't exist
        if (!enrollment.videoProgress) {
            enrollment.videoProgress = [];
        }

        // Check if this video already has a progress entry
        const existingIdx = enrollment.videoProgress.findIndex(
            vp => vp.videoId.toString() === videoId
        );

        if (existingIdx > -1) {
            // Update existing entry
            enrollment.videoProgress[existingIdx].watchedAt = new Date();
            enrollment.videoProgress[existingIdx].completed = completed !== undefined ? completed : true;
            if (lastPosition !== undefined) {
                enrollment.videoProgress[existingIdx].lastPosition = lastPosition;
            }
            if (moduleTitle) {
                enrollment.videoProgress[existingIdx].moduleTitle = moduleTitle;
            }
        } else {
            // Create new entry
            enrollment.videoProgress.push({
                videoId,
                moduleTitle: moduleTitle || '',
                sessionIndex: sessionIndex || 0,
                watchedAt: new Date(),
                completed: completed !== undefined ? completed : true,
                lastPosition: lastPosition || 0
            });
        }

        // Update overall progress percentage
        const Program = require('../models/Program');
        const program = await Program.findById(programId);
        if (program) {
            const totalSessions = program.modules
                .filter(m => m.isActive)
                .reduce((sum, m) => sum + (m.sessions?.length || 0), 0);
            const completedCount = enrollment.videoProgress.filter(vp => vp.completed).length;
            enrollment.progress = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;
        }

        await user.save();

        res.json({
            success: true,
            data: {
                videoProgress: enrollment.videoProgress,
                progress: enrollment.progress
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get video progress for the current user within a specific program
exports.getVideoProgress = async (req, res) => {
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
            return res.status(400).json({ success: false, message: 'Not enrolled in this program' });
        }

        res.json({
            success: true,
            data: {
                videoProgress: enrollment.videoProgress || [],
                progress: enrollment.progress || 0,
                attendance: enrollment.attendance || []
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.likeContent = async (req, res) => {
    try {
        const content = await Learning.findById(req.params.id);
        if (!content) return res.status(404).json({ success: false, message: 'Content not found' });

        const likeIndex = content.likes.findIndex(l => l.toString() === req.user._id.toString());
        if (likeIndex > -1) content.likes.splice(likeIndex, 1);
        else content.likes.push(req.user._id);
        await content.save();
        res.json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Module Assignment Submission (Chaitanya / Sparsh) ────────────────────────

// Record a module assignment submission (artwork or activity)
// This is called when a student submits their artwork/activity for a specific module
exports.submitModuleAssignment = async (req, res) => {
    try {
        const { programId, moduleId, moduleTitle, submissionType, artworkId } = req.body;

        if (!programId || !moduleId || !submissionType) {
            return res.status(400).json({
                success: false,
                message: 'programId, moduleId, and submissionType are required'
            });
        }

        if (!['artwork', 'activity'].includes(submissionType)) {
            return res.status(400).json({
                success: false,
                message: 'submissionType must be "artwork" or "activity"'
            });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Find the enrollment
        const enrollment = user.enrolledPrograms.find(
            ep => ep.program.toString() === programId
        );

        if (!enrollment) {
            return res.status(400).json({ success: false, message: 'Not enrolled in this program' });
        }

        // Initialize moduleSubmissions if needed
        if (!enrollment.moduleSubmissions) {
            enrollment.moduleSubmissions = [];
        }

        // Find existing module submission entry or create one
        let moduleSub = enrollment.moduleSubmissions.find(
            ms => ms.moduleId.toString() === moduleId
        );

        if (!moduleSub) {
            moduleSub = {
                moduleId,
                moduleTitle: moduleTitle || '',
                artworkSubmitted: false,
                activitySubmitted: false,
                submittedAt: new Date()
            };
            enrollment.moduleSubmissions.push(moduleSub);
        }

        // Update the appropriate submission type
        if (submissionType === 'artwork') {
            moduleSub.artworkSubmitted = true;
            moduleSub.artworkId = artworkId || null;
        } else if (submissionType === 'activity') {
            moduleSub.activitySubmitted = true;
            moduleSub.activityId = artworkId || null;
        }

        moduleSub.submittedAt = new Date();

        // Track completed modules
        if (!enrollment.completedModules) {
            enrollment.completedModules = [];
        }

        const modId = moduleSub.moduleId;
        const alreadyCompleted = enrollment.completedModules.some(
            cm => cm.toString() === modId.toString()
        );

        if (moduleSub.artworkSubmitted && moduleSub.activitySubmitted && !alreadyCompleted) {
            enrollment.completedModules.push(modId);
        }

        // Update overall progress
        const Program = require('../models/Program');
        const program = await Program.findById(programId);
        if (program) {
            const activeModules = program.modules.filter(m => m.isActive);
            if (activeModules.length > 0 && enrollment.completedModules) {
                enrollment.progress = Math.round(
                    (enrollment.completedModules.length / activeModules.length) * 100
                );
            }
        }

        await user.save();

        res.json({
            success: true,
            data: {
                moduleSubmissions: enrollment.moduleSubmissions,
                completedModules: enrollment.completedModules,
                progress: enrollment.progress
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get module submission status for a user's enrolled program
exports.getModuleSubmissions = async (req, res) => {
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
            return res.status(400).json({ success: false, message: 'Not enrolled in this program' });
        }

        const Program = require('../models/Program');
        const program = await Program.findById(programId);

        // Build detailed module status with submission info
        const activeModules = program ? program.modules.filter(m => m.isActive) : [];
        const moduleStatuses = activeModules.map(mod => {
            const sub = (enrollment.moduleSubmissions || []).find(
                ms => ms.moduleId && ms.moduleId.toString() === mod._id.toString()
            );
            return {
                moduleId: mod._id,
                moduleTitle: mod.title,
                artFormName: mod.artFormName || '',
                artworkSubmitted: sub?.artworkSubmitted || false,
                activitySubmitted: sub?.activitySubmitted || false,
                isCompleted: sub?.artworkSubmitted && sub?.activitySubmitted,
                submittedAt: sub?.submittedAt || null
            };
        });

        res.json({
            success: true,
            data: {
                moduleSubmissions: enrollment.moduleSubmissions || [],
                completedModules: enrollment.completedModules || [],
                moduleStatuses,
                progress: enrollment.progress || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};