const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../services/email');

const generateToken = (id, role, jti) => {
    const payload = { id, role };
    if (jti) payload.jti = jti;
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// Generate a cryptographically random session token for single-session enforcement
const generateSessionToken = () => crypto.randomBytes(32).toString('hex');

exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, email, password, role, organization, isWebinar } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (isWebinar) {
                // Just resend the welcome email and return success
                try {
                    await sendWelcomeEmail(existingUser, "(Your existing account password)");
                } catch (emailError) {
                    console.error('Welcome email failed:', emailError);
                }
                return res.status(200).json({
                    success: true,
                    message: 'Webinar registration updated',
                    token: 'webinar-token',
                    user: { id: existingUser._id, name: existingUser.name, email: existingUser.email }
                });
            }

            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Generate session token for single-session enforcement
        const sessionToken = generateSessionToken();

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'member',
            organization: organization || '',
            activeSessionToken: sessionToken
        });

        // Send welcome email
        try {
            await sendWelcomeEmail(user, password);
        } catch (emailError) {
            console.error('Welcome email failed:', emailError);
        }

        // Generate token with jti matching the stored session token
        const token = generateToken(user._id, user.role, sessionToken);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                bio: user.bio,
                interests: user.interests,
                organization: user.organization
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user with password and populate enrolledPrograms
        const user = await User.findOne({ email }).select('+password').populate('enrolledPrograms.program');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate new session token — invalidates any previous session
        const sessionToken = generateSessionToken();

        // Update last login and set new active session token
        user.lastLogin = new Date();
        user.activeSessionToken = sessionToken;
        await user.save();

        const token = generateToken(user._id, user.role, sessionToken);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                bio: user.bio,
                interests: user.interests,
                enrolledPrograms: user.enrolledPrograms,
                organization: user.organization
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.logout = async (req, res) => {
    try {
        // Clear the active session token to invalidate the current session
        await User.findByIdAndUpdate(req.user._id, { activeSessionToken: null });
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('enrolledPrograms.program');
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                bio: user.bio,
                phone: user.phone,
                location: user.location,
                socialLinks: user.socialLinks,
                interests: user.interests,
                enrolledPrograms: user.enrolledPrograms,
                organization: user.organization,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, bio, phone, location, socialLinks, interests, avatar, organization } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, bio, phone, location, socialLinks, interests, avatar, organization },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                bio: user.bio,
                phone: user.phone,
                location: user.location,
                socialLinks: user.socialLinks,
                interests: user.interests,
                organization: user.organization
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Generate new session token on password change — logs out other sessions
        const sessionToken = generateSessionToken();
        user.password = newPassword;
        user.activeSessionToken = sessionToken;
        await user.save();

        const token = generateToken(user._id, user.role, sessionToken);

        res.json({
            success: true,
            message: 'Password updated successfully',
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};