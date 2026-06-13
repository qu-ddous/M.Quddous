const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, deleteUser, createUser, updateUser } = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');

// Get all users (Admin only)
router.get('/', auth, authorize('ADMIN'), getAllUsers);

// Get user by ID (Admin only)
router.get('/:id', auth, authorize('ADMIN'), getUserById);

// Create user (Admin only)
router.post('/', auth, authorize('ADMIN'), createUser);

// Update user (Admin only)
router.put('/:id', auth, authorize('ADMIN'), updateUser);

// Delete user (Admin only)
router.delete('/:id', auth, authorize('ADMIN'), deleteUser);

module.exports = router;
