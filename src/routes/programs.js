const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAllPrograms, getProgramBySlug, getProgramById, createProgram, updateProgram, deleteProgram,
    getFeaturedPrograms,
    // Module management
    addModule, updateModule, deleteModule, toggleModuleActive, toggleModuleLock,
    getActiveModules, getModuleDetail, addLiveRecording, addSession
} = require('../controllers/programController');

router.get('/', getAllPrograms);
router.get('/featured', getFeaturedPrograms);
router.get('/slug/:slug', getProgramBySlug);
router.get('/id/:id', getProgramById);
router.get('/:id', getProgramById);
router.post('/', protect, authorize('admin'), createProgram);
router.put('/:id', protect, authorize('admin'), updateProgram);
router.delete('/:id', protect, authorize('admin'), deleteProgram);

// ─── Module Management Routes ────────────────────────────────────
// Active modules (learner-facing)
router.get('/:id/modules/active', protect, getActiveModules);
router.get('/:id/modules/:moduleId', protect, getModuleDetail);

// Admin module management
router.post('/:id/modules', protect, authorize('admin'), addModule);
router.put('/:id/modules/:moduleId', protect, authorize('admin'), updateModule);
router.delete('/:id/modules/:moduleId', protect, authorize('admin'), deleteModule);
router.put('/:id/modules/:moduleId/toggle-active', protect, authorize('admin'), toggleModuleActive);
router.put('/:id/modules/:moduleId/toggle-lock', protect, authorize('admin'), toggleModuleLock);

// Admin: add live recording to a module
router.post('/:id/modules/:moduleId/live-recordings', protect, authorize('admin'), addLiveRecording);
// Admin: add session to a module
router.post('/:id/modules/:moduleId/sessions', protect, authorize('admin'), addSession);

module.exports = router;