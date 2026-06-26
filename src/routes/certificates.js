const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getMyCertificates, getAllCertificatesAdmin, issueCertificate,
    issueCompletionCertificate, issueExcellenceCertificate, issueAwardCertificate,
    getCertificateEligibility, verifyCertificate, deleteCertificate
} = require('../controllers/certificateController');

router.get('/my', protect, getMyCertificates);
router.get('/verify/:number', verifyCertificate);
router.get('/eligibility/:programId', protect, getCertificateEligibility);
router.get('/admin', protect, authorize('admin'), getAllCertificatesAdmin);
router.post('/', protect, authorize('admin'), issueCertificate);
router.post('/completion', protect, authorize('admin'), issueCompletionCertificate);
router.post('/excellence', protect, authorize('admin'), issueExcellenceCertificate);
router.post('/award', protect, authorize('admin'), issueAwardCertificate);
router.delete('/:id', protect, authorize('admin'), deleteCertificate);

module.exports = router;