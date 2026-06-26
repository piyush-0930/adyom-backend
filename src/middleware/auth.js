const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated'
            });
        }

        // Single-session enforcement: if the token's jti doesn't match the stored activeSessionToken,
        // the user has logged in from another device, invalidating this session.
        if (decoded.jti && user.activeSessionToken && decoded.jti !== user.activeSessionToken) {
            return res.status(401).json({
                success: false,
                message: 'Session invalidated. You have logged in from another device.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token invalid'
        });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized to access this resource`
            });
        }
        next();
    };
};

const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (user && user.isActive) {
                // Optional auth doesn't enforce single-session (non-critical endpoints)
                req.user = user;
            }
        }
        next();
    } catch (error) {
        next();
    }
};

// Aliases for clarity in routes
const verifyToken = protect;
const verifyAdmin = (req, res, next) => authorize('admin')(req, res, next);

module.exports = { protect, authorize, optionalAuth, verifyToken, verifyAdmin };