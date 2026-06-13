const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getPatientProfile,
  updatePatientProfile,
  uploadMedicalReport,
  getMedicalReports
} = require('../controllers/patientController');

router.get('/profile', auth, authorize('PATIENT'), getPatientProfile);
router.put('/profile', auth, authorize('PATIENT'), updatePatientProfile);
router.post('/reports', auth, authorize('PATIENT'), upload.single('reportFile'), uploadMedicalReport);
router.get('/reports', auth, authorize('PATIENT'), getMedicalReports);

module.exports = router;
