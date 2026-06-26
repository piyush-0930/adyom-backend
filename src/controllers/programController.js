const Program = require('../models/Program');

exports.getAllPrograms = async (req, res) => {
    try {
        const { page = 1, limit = 20, category, featured, isPublished, level, programType } = req.query;
        const query = {};

        if (category) query.category = category;
        if (featured === 'true') query.featured = true;
        if (isPublished !== undefined) query.isPublished = isPublished === 'true';
        if (level) query.level = level;
        if (programType) query.programType = programType;

        // Public: only published programs
        if (req.user?.role !== 'admin') {
            query.isPublished = true;
        }

        const total = await Program.countDocuments(query);
        const programs = await Program.find(query)
            .sort({ featured: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: programs,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProgramBySlug = async (req, res) => {
    try {
        const program = await Program.findOne({ slug: req.params.slug });
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }
        res.json({ success: true, data: program });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProgramById = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }
        res.json({ success: true, data: program });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createProgram = async (req, res) => {
    try {
        const program = await Program.create(req.body);
        res.status(201).json({ success: true, data: program });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProgram = async (req, res) => {
    try {
        const program = await Program.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }
        res.json({ success: true, data: program });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteProgram = async (req, res) => {
    try {
        const program = await Program.findByIdAndDelete(req.params.id);
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }
        res.json({ success: true, message: 'Program deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFeaturedPrograms = async (req, res) => {
    try {
        const programs = await Program.find({ featured: true, isPublished: true })
            .sort({ createdAt: -1 })
            .limit(6);
        res.json({ success: true, data: programs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Module Management (Chaitanya / Sparsh) ──────────────────────────────────

// Add a module to a program
exports.addModule = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }
        program.modules.push(req.body);
        await program.save();
        res.status(201).json({ success: true, data: program.modules[program.modules.length - 1] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a specific module within a program
exports.updateModule = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        const module = program.modules.id(req.params.moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        Object.assign(module, req.body);
        await program.save();
        res.json({ success: true, data: module });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a module from a program
exports.deleteModule = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        program.modules.pull(req.params.moduleId);
        await program.save();
        res.json({ success: true, message: 'Module deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle module active status (admin activates/deactivates a module)
exports.toggleModuleActive = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        const module = program.modules.id(req.params.moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        // If activating, check maxActiveModules limit
        if (!module.isActive) {
            const activeCount = program.modules.filter(m => m.isActive).length;
            const maxActive = program.maxActiveModules || 7;
            if (activeCount >= maxActive) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot activate more than ${maxActive} modules simultaneously. Deactivate another module first.`
                });
            }
            module.isActive = true;
            module.activatedAt = new Date();
        } else {
            module.isActive = false;
            module.activatedAt = null;
        }

        await program.save();
        res.json({ success: true, data: module });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle module lock status (admin locks/unlocks a module)
exports.toggleModuleLock = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        const module = program.modules.id(req.params.moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        module.isLocked = !module.isLocked;
        await program.save();
        res.json({ success: true, data: module });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all active modules for a program (learner-facing)
exports.getActiveModules = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        const activeModules = program.modules
            .filter(m => m.isActive && !m.isLocked)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        res.json({ success: true, data: activeModules, totalActive: activeModules.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a specific module with full details for a learner
exports.getModuleDetail = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        const module = program.modules.id(req.params.moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        res.json({ success: true, data: module });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add a live recording to a module
exports.addLiveRecording = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        const module = program.modules.id(req.params.moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        module.liveRecordings.push({
            ...req.body,
            recordedAt: req.body.recordedAt || new Date()
        });
        await program.save();
        res.status(201).json({ success: true, data: module.liveRecordings[module.liveRecordings.length - 1] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add a session to a module
exports.addSession = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }

        const module = program.modules.id(req.params.moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        module.sessions.push(req.body);
        await program.save();
        res.status(201).json({ success: true, data: module.sessions[module.sessions.length - 1] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};