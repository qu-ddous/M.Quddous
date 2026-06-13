const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  createPrescription,
  getPrescriptionByAppointment,
  getPrescriptionsByDoctor
} = require('../controllers/prescriptionController');

router.post('/', auth, authorize('DOCTOR'), createPrescription);
router.get('/appointment/:appointmentId', auth, getPrescriptionByAppointment);
router.get('/doctor/:doctorId', auth, getPrescriptionsByDoctor);

module.exports = router;
