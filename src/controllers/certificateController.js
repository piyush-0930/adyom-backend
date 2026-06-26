const Certificate = require('../models/Certificate');
const Artwork = require('../models/Artwork');
const User = require('../models/User');
const Program = require('../models/Program');

exports.getMyCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find({ user: req.user._id })
            .populate('program', 'title slug programType')
            .sort({ issuedAt: -1 });
        res.json({ success: true, data: certificates });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllCertificatesAdmin = async (req, res) => {
    try {
        const certificates = await Certificate.find()
            .populate('user', 'name email')
            .populate('program', 'title slug programType')
            .populate('issuedBy', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: certificates });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.issueCertificate = async (req, res) => {
    try {
        const { title, description, user, program, certificateType, excellenceLevel, awardType } = req.body;
        const certificate = await Certificate.create({
            title,
            description,
            user,
            program,
            certificateType: certificateType || 'completion',
            excellenceLevel: excellenceLevel || null,
            awardType: awardType || '',
            issuedBy: req.user._id
        });
        res.status(201).json({ success: true, data: certificate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Auto-issue completion certificate based on program-specific criteria
exports.issueCompletionCertificate = async (req, res) => {
    try {
        const { userId, programId } = req.body;

        const existing = await Certificate.findOne({
            user: userId,
            program: programId,
            certificateType: 'completion'
        });

        if (existing) {
            return res.status(400).json({ success: false, message: 'Completion certificate already issued' });
        }

        const approvedCount = await Artwork.countDocuments({
            artist: userId,
            program: programId,
            status: 'approved'
        });

        const program = await Program.findById(programId);

        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        let eligible = false;
        let reason = '';

        if (program.programType === 'KalaPath' && program.format === 'offline') {
            eligible = approvedCount >= 5;
            reason = eligible ? '' : 'Requires at least 5 approved artworks for offline KalaPath';
        } else if (program.programType === 'KalaPath' && program.format !== 'offline') {
            const user = await User.findById(userId).select('enrolledPrograms');
            const enrollment = user.enrolledPrograms.find(
                ep => ep.program.toString() === programId
            );
            const videoProgress = enrollment?.videoProgress || [];
            const completedVideos = videoProgress.filter(vp => vp.completed).length;
            const totalSessions = program.modules
                .filter(m => m.isActive)
                .reduce((sum, m) => sum + (m.sessions?.length || 0), 0);
            eligible = completedVideos >= totalSessions && totalSessions > 0;
            reason = eligible ? '' : `Requires all ${totalSessions} session videos to be completed. Currently completed: ${completedVideos}`;
        } else if (program.programType === 'Pratibimb') {
            const user = await User.findById(userId).select('enrolledPrograms');
            const enrollment = user.enrolledPrograms.find(
                ep => ep.program.toString() === programId
            );
            const attendanceDays = enrollment?.attendance?.filter(a => a.marked)?.length || 0;
            eligible = attendanceDays >= 41;
            reason = eligible ? '' : `Requires 41 days attendance for Pratibimb. Currently: ${attendanceDays} days`;
        } else if (program.programType === 'Chaitanya' || program.programType === 'Sparsh') {
            // Chaitanya/Sparsh: All 7 active modules must have submissions (artwork + activity)
            const user = await User.findById(userId).select('enrolledPrograms');
            const enrollment = user.enrolledPrograms.find(
                ep => ep.program.toString() === programId
            );

            if (!enrollment) {
                return res.status(400).json({ success: false, message: 'User not enrolled in this program' });
            }

            const activeModules = program.modules.filter(m => m.isActive);
            const moduleSubmissions = enrollment.moduleSubmissions || [];

            // Check each active module has both artwork and activity submitted
            const modulesWithBothSubmissions = activeModules.filter(mod => {
                const sub = moduleSubmissions.find(
                    ms => ms.moduleId.toString() === mod._id.toString()
                );
                return sub && sub.artworkSubmitted && sub.activitySubmitted;
            });

            eligible = modulesWithBothSubmissions.length >= activeModules.length && activeModules.length > 0;
            reason = eligible
                ? ''
                : `All ${activeModules.length} active modules require both artwork and activity submissions. Completed: ${modulesWithBothSubmissions.length}`;
        } else {
            eligible = approvedCount >= 1;
            reason = eligible ? '' : 'Requires at least 1 approved artwork submission';
        }

        if (!eligible) {
            return res.status(400).json({ success: false, message: reason || 'Not eligible for completion certificate' });
        }

        const certificate = await Certificate.create({
            title: `Completion Certificate - ${program.title}`,
            description: `Awarded for completing the ${program.title} program.`,
            user: userId,
            program: programId,
            certificateType: 'completion',
            issuedBy: req.user._id
        });

        res.status(201).json({ success: true, data: certificate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Excellence Certificate (Chaitanya / Sparsh) ─────────────────────────────

// Issue excellence certificate after 3 or 6 module submissions
exports.issueExcellenceCertificate = async (req, res) => {
    try {
        const { userId, programId } = req.body;

        const program = await Program.findById(programId);
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        const user = await User.findById(userId).select('enrolledPrograms');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const enrollment = user.enrolledPrograms.find(
            ep => ep.program.toString() === programId
        );

        if (!enrollment) {
            return res.status(400).json({ success: false, message: 'User not enrolled in this program' });
        }

        const moduleSubmissions = enrollment.moduleSubmissions || [];
        const completedModules = moduleSubmissions.filter(
            ms => ms.artworkSubmitted && ms.activitySubmitted
        );

        const completedCount = completedModules.length;

        // Determine excellence level
        let excellenceLevel = null;
        if (completedCount >= 6) {
            excellenceLevel = 6;
        } else if (completedCount >= 3) {
            excellenceLevel = 3;
        }

        if (!excellenceLevel) {
            return res.status(400).json({
                success: false,
                message: `Requires at least 3 completed module submissions. Currently: ${completedCount}`
            });
        }

        // Check if this level of excellence certificate already exists
        const existing = await Certificate.findOne({
            user: userId,
            program: programId,
            certificateType: 'excellence',
            excellenceLevel
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: `Excellence certificate (${excellenceLevel} modules) already issued`
            });
        }

        const certificate = await Certificate.create({
            title: `Excellence Certificate - ${program.title} (${excellenceLevel} Modules)`,
            description: `Awarded for outstanding performance in ${excellenceLevel} modules of the ${program.title} program.`,
            user: userId,
            program: programId,
            certificateType: 'excellence',
            excellenceLevel,
            issuedBy: req.user._id
        });

        res.status(201).json({ success: true, data: certificate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Award Certificates ──────────────────────────────────────────────────────

// Issue award certificate (Max Attendee, Max Submission, Most Innovative)
exports.issueAwardCertificate = async (req, res) => {
    try {
        const { userId, programId, awardType } = req.body;

        if (!['max-attendee', 'max-submission', 'most-innovative'].includes(awardType)) {
            return res.status(400).json({ success: false, message: 'Invalid award type' });
        }

        const program = await Program.findById(programId);
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        const existing = await Certificate.findOne({
            user: userId,
            program: programId,
            certificateType: 'award',
            awardType
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: `${awardType} award already issued to this user`
            });
        }

        const awardLabels = {
            'max-attendee': 'Max Attendee Award',
            'max-submission': 'Max Submission Award',
            'most-innovative': 'Most Innovative Award'
        };

        const certificate = await Certificate.create({
            title: `${awardLabels[awardType]} - ${program.title}`,
            description: `Awarded for exceptional achievement in the ${program.title} program.`,
            user: userId,
            program: programId,
            certificateType: 'award',
            awardType,
            issuedBy: req.user._id
        });

        res.status(201).json({ success: true, data: certificate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get certificate eligibility status for a user+program (learner-facing)
exports.getCertificateEligibility = async (req, res) => {
    try {
        const { programId } = req.params;
        const userId = req.user._id;

        const program = await Program.findById(programId);
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        const user = await User.findById(userId).select('enrolledPrograms');
        const enrollment = user.enrolledPrograms.find(
            ep => ep.program.toString() === programId
        );

        if (!enrollment) {
            return res.status(400).json({ success: false, message: 'Not enrolled in this program' });
        }

        const moduleSubmissions = enrollment.moduleSubmissions || [];
        const completedModules = moduleSubmissions.filter(
            ms => ms.artworkSubmitted && ms.activitySubmitted
        );
        const completedModuleCount = completedModules.length;

        // Check existing certificates
        const existingCerts = await Certificate.find({
            user: userId,
            program: programId
        });

        const hasCompletion = existingCerts.some(c => c.certificateType === 'completion');
        const hasExcellence3 = existingCerts.some(c => c.certificateType === 'excellence' && c.excellenceLevel === 3);
        const hasExcellence6 = existingCerts.some(c => c.certificateType === 'excellence' && c.excellenceLevel === 6);
        const hasAwards = existingCerts.filter(c => c.certificateType === 'award').map(c => c.awardType);

        res.json({
            success: true,
            data: {
                completedModules: completedModuleCount,
                totalActiveModules: program.modules.filter(m => m.isActive).length,
                eligibility: {
                    excellence3: !hasExcellence3 && completedModuleCount >= 3,
                    excellence6: !hasExcellence6 && completedModuleCount >= 6,
                    completion: !hasCompletion && completedModuleCount >= program.modules.filter(m => m.isActive).length,
                },
                issuedCertificates: {
                    hasCompletion,
                    hasExcellence3,
                    hasExcellence6,
                    awards: hasAwards
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.verifyCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findOne({ certificateNumber: req.params.number })
            .populate('user', 'name')
            .populate('program', 'title');
        if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found' });
        res.json({ success: true, data: certificate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findByIdAndDelete(req.params.id);
        if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found' });
        res.json({ success: true, message: 'Certificate deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};