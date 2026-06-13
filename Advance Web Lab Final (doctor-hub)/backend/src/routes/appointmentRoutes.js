const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  createAppointment,
  createAppointmentWithPayment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment,
  updateAppointment
} = require('../controllers/appointmentController');

router.post('/', auth, createAppointment);
router.post('/with-payment', auth, require('../middleware/upload').single('screenshot'), createAppointmentWithPayment);
router.get('/', auth, getAppointments);
router.get('/:id', auth, getAppointmentById);
router.put('/:id/status', auth, updateAppointmentStatus);
router.put('/:id', auth, authorize('ADMIN'), updateAppointment);
router.delete('/:id', auth, authorize('ADMIN'), deleteAppointment);

module.exports = router;
