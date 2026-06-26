const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    markAttendance,
    getAttendance,
    getLeaderboard,
    getTopSubmitters,
    getMostInnovative,
    getMyDashboardStats
} = require('../controllers/dashboardController');

// User-facing dashboard routes
router.get('/stats', protect, getMyDashboardStats);

// Pratibimb attendance routes
router.post('/attendance', protect, markAttendance);
router.get('/attendance/:programId', protect, getAttendance);

// Admin gamification / leaderboard routes
router.get('/leaderboard', protect, authorize('admin'), getLeaderboard);
router.get('/top-submitters', protect, authorize('admin'), getTopSubmitters);
router.get('/most-innovative', protect, authorize('admin'), getMostInnovative);

module.exports = router;