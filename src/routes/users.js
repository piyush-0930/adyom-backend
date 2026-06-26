const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAllUsers, getUserById, updateUserRole, toggleUserStatus, deleteUser, enrollProgram, getMyPrograms, getUserStats } = require('../controllers/userController');

router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/stats', protect, authorize('admin'), getUserStats);
// Member routes
router.post('/enroll', protect, enrollProgram);
router.get('/my-programs', protect, getMyPrograms);

router.get('/:id', protect, authorize('admin'), getUserById);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);
router.put('/:id/status', protect, authorize('admin'), toggleUserStatus);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;