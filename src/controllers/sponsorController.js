const SponsorCode = require('../models/SponsorCode');
const User = require('../models/User');
const Program = require('../models/Program');

// Admin: Create a sponsor code
exports.createSponsorCode = async (req, res) => {
    try {
        const { code, program, organization, description, maxUses, expiresAt } = req.body;

        // Check if code already exists
        const existing = await SponsorCode.findOne({ code: code.toUpperCase() });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Sponsor code already exists' });
        }

        const sponsorCode = await SponsorCode.create({
            code: code.toUpperCase(),
            program,
            organization,
            description: description || '',
            maxUses: maxUses || 0,
            expiresAt: expiresAt || null,
            createdBy: req.user._id
        });

        res.status(201).json({ success: true, data: sponsorCode });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Get all sponsor codes
exports.getAllSponsorCodes = async (req, res) => {
    try {
        const { program, isActive } = req.query;
        const query = {};
        if (program) query.program = program;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const codes = await SponsorCode.find(query)
            .populate('program', 'title slug programType')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: codes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Toggle sponsor code active status
exports.toggleSponsorCode = async (req, res) => {
    try {
        const code = await SponsorCode.findById(req.params.id);
        if (!code) {
            return res.status(404).json({ success: false, message: 'Sponsor code not found' });
        }

        code.isActive = !code.isActive;
        await code.save();

        res.json({ success: true, data: code });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Delete a sponsor code
exports.deleteSponsorCode = async (req, res) => {
    try {
        const code = await SponsorCode.findByIdAndDelete(req.params.id);
        if (!code) {
            return res.status(404).json({ success: false, message: 'Sponsor code not found' });
        }
        res.json({ success: true, message: 'Sponsor code deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Public: Validate a sponsor code (used during enrollment checkout)
exports.validateSponsorCode = async (req, res) => {
    try {
        const { code, programId } = req.body;

        const sponsorCode = await SponsorCode.findOne({
            code: code.toUpperCase(),
            program: programId
        });

        if (!sponsorCode) {
            return res.status(404).json({
                success: false,
                message: 'Invalid sponsor code for this program'
            });
        }

        if (!sponsorCode.isValid()) {
            return res.status(400).json({
                success: false,
                message: 'Sponsor code has expired or reached its usage limit'
            });
        }

        res.json({
            success: true,
            data: {
                code: sponsorCode.code,
                organization: sponsorCode.organization,
                program: sponsorCode.program,
                message: 'Sponsor code is valid. Your enrollment will be free.'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Enroll in a program with optional sponsor code
exports.enrollProgram = async (req, res) => {
    try {
        const { programId, sponsorCode } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if program exists
        const program = await Program.findById(programId);
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        // Check if already enrolled
        const alreadyEnrolled = user.enrolledPrograms.find(
            ep => ep.program.toString() === programId
        );
        if (alreadyEnrolled) {
            if (moduleId) {
                // Check if already enrolled in this module
                if (alreadyEnrolled.enrolledModules && alreadyEnrolled.enrolledModules.includes(moduleId)) {
                    return res.status(400).json({ success: false, message: 'Already enrolled in this module' });
                }
            } else {
                return res.status(400).json({ success: false, message: 'Already enrolled in this program' });
            }
        }

        // Check enrollment limit
        if (program.currentEnrollments >= program.maxEnrollments) {
            return res.status(400).json({ success: false, message: 'Program is full' });
        }

        // Handle sponsor code if provided
        let isSponsored = false;
        let sponsorOrg = '';

        if (sponsorCode) {
            const spCode = await SponsorCode.findOne({
                code: sponsorCode.toUpperCase(),
                program: programId
            });

            if (!spCode || !spCode.isValid()) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired sponsor code'
                });
            }

            // Increment usage count
            spCode.usedCount += 1;
            await spCode.save();
            isSponsored = true;
            sponsorOrg = spCode.organization;

            // Set user's organization if not already set
            if (!user.organization) {
                user.organization = spCode.organization;
            }
        }

        if (alreadyEnrolled && moduleId) {
            alreadyEnrolled.enrolledModules.push(moduleId);
            await user.save();
        } else {
            // Enroll the user
            const newEnrollment = {
                program: programId,
                enrolledAt: new Date(),
                status: 'active',
                progress: 0,
                videoProgress: [],
                enrolledModules: []
            };
            if (moduleId) {
                newEnrollment.enrolledModules.push(moduleId);
            }
            user.enrolledPrograms.push(newEnrollment);
            await user.save();
        }

        // Update program enrollment count
        program.currentEnrollments = (program.currentEnrollments || 0) + 1;
        await program.save();

        res.json({
            success: true,
            message: isSponsored ? 'Successfully enrolled via sponsorship' : 'Successfully enrolled',
            data: {
                program: {
                    id: program._id,
                    title: program.title,
                    slug: program.slug,
                    programType: program.programType
                },
                enrollment: user.enrolledPrograms[user.enrolledPrograms.length - 1],
                sponsored: isSponsored,
                sponsorOrganization: sponsorOrg
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};