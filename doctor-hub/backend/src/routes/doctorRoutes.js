const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  getDoctorAvailability,
  setDoctorAvailability,
  createDoctor,
  deleteDoctor,
  approveDoctor,
  rejectDoctor
} = require('../controllers/doctorController');

router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.post('/', auth, authorize('ADMIN'), createDoctor);
router.delete('/:id', auth, authorize('ADMIN'), deleteDoctor);
router.put('/:id/approve', auth, authorize('ADMIN'), approveDoctor);
router.put('/:id/reject', auth, authorize('ADMIN'), rejectDoctor);
router.put('/:id', auth, authorize('DOCTOR', 'ADMIN'), updateDoctorProfile);
router.get('/:doctorId/availability', getDoctorAvailability);
router.post('/:doctorId/availability', auth, authorize('DOCTOR'), setDoctorAvailability);

module.exports = router;
