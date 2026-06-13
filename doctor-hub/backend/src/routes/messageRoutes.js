const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  sendMessage,
  getMessages,
  markAsRead
} = require('../controllers/messageController');

router.post('/', auth, sendMessage);
router.get('/:otherUserId', auth, getMessages);
router.put('/:id/read', auth, markAsRead);

module.exports = router;
