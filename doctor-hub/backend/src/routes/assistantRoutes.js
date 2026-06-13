const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  getAssistantProfile,
  updateAssistantProfile
} = require('../controllers/assistantController');

router.get('/profile', auth, authorize('ASSISTANT'), getAssistantProfile);
router.put('/profile', auth, authorize('ASSISTANT'), updateAssistantProfile);

module.exports = router;
