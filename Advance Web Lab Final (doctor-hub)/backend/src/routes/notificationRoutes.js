const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead
} = require('../controllers/notificationController');

router.get('/', auth, getNotifications);
router.put('/:id/read', auth, markNotificationAsRead);
router.put('/read-all', auth, markAllAsRead);

module.exports = router;
