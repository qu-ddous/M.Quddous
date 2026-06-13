const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createPayment,
  getPayments,
  verifyPayment,
  deletePayment,
  updatePayment
} = require('../controllers/paymentController');

router.post('/', auth, upload.single('screenshot'), createPayment);
router.get('/', auth, authorize('PATIENT', 'ASSISTANT', 'ADMIN'), getPayments);
router.put('/:id/verify', auth, authorize('ASSISTANT', 'ADMIN'), verifyPayment);
router.put('/:id', auth, authorize('ADMIN'), updatePayment);
router.delete('/:id', auth, authorize('ADMIN'), deletePayment);

module.exports = router;
