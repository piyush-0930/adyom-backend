const User = require('../models/User');
const Program = require('../models/Program');

exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, role, search, status } = req.query;
        const query = {};

        if (role) query.role = role;
        if (status === 'active') query.isActive = true;
        if (status === 'inactive') query.isActive = false;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        );
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.isActive = !user.isActive;
        await user.save();
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

    exports.enrollProgram = async (req, res) => {
        try {
            const { programId, moduleId } = req.body;
            const user = await User.findById(req.user._id);
            const program = await Program.findById(programId);

            if (!program) {
                return res.status(404).json({ success: false, message: 'Program not found' });
            }

            // Check if already enrolled in the program
            const alreadyEnrolled = user.enrolledPrograms.find(
                ep => ep.program.toString() === programId
            );

            if (alreadyEnrolled) {
                if (moduleId) {
                    // If already enrolled in the program but they want to enroll in a new module
                    const alreadyEnrolledModule = alreadyEnrolled.enrolledModules.includes(moduleId);
                    if (alreadyEnrolledModule) {
                        return res.status(400).json({ success: false, message: 'Already enrolled in this module' });
                    }
                    alreadyEnrolled.enrolledModules.push(moduleId);
                    await user.save();
                    return res.json({ success: true, message: 'Enrolled in module successfully', data: user });
                } else {
                    return res.status(400).json({ success: false, message: 'Already enrolled in this program' });
                }
            }

            const newEnrollment = { program: programId, enrolledModules: [] };
            if (moduleId) {
                newEnrollment.enrolledModules.push(moduleId);
            }
            user.enrolledPrograms.push(newEnrollment);
            await user.save();

            program.currentEnrollments += 1;
            await program.save();

            res.json({ success: true, message: 'Enrolled successfully', data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyPrograms = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('enrolledPrograms.program');
        res.json({ success: true, data: user.enrolledPrograms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const members = await User.countDocuments({ role: 'member' });
        const admins = await User.countDocuments({ role: 'admin' });
        const newUsersThisMonth = await User.countDocuments({
            createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
        });

        res.json({
            success: true,
            data: {
                total: totalUsers,
                active: activeUsers,
                members,
                admins,
                newThisMonth: newUsersThisMonth
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};