const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

const normalizeRole = (value) => (typeof value === 'string' ? value.trim().toUpperCase() : '');

const createRoleProfile = async (tx, role, userId, fullName, phone) => {
  if (role === 'PATIENT') {
    await tx.patient.create({
      data: {
        userId,
        fullName,
        phone,
      },
    });
    return;
  }

  if (role === 'DOCTOR') {
    await tx.doctor.create({
      data: {
        userId,
        fullName,
        phone,
        specialization: 'General',
        experience: 0,
        qualification: 'MBBS',
        fee: 500,
        isApproved: true,
      },
    });
    return;
  }

  if (role === 'ASSISTANT') {
    await tx.assistant.create({
      data: {
        userId,
        fullName,
        phone,
      },
    });
  }
};


const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, password, role, fullName, phone } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const uppercaseRole = normalizeRole(role);
    if (!['PATIENT', 'DOCTOR', 'ASSISTANT'].includes(uppercaseRole)) {
      return res.status(400).json({ error: 'Invalid user role' });
    }
    
    // Create user in Supabase Auth via admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: uppercaseRole, fullName }
    });
    
    if (authError) {
      console.error('Supabase Auth Creation Error:', authError);
      return res.status(400).json({ error: authError.message });
    }
    
    const supabaseUser = authData.user;
    
    // Create user and role-specific profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          password: supabaseUser.id,
          role: uppercaseRole
        }
      });
      
      // Create role-specific profile
      await createRoleProfile(tx, uppercaseRole, user.id, fullName, phone);
      
      return user;
    });
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user: ' + error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const uppercaseRole = normalizeRole(role);
    
    // Prevent changing role to admin
    if (uppercaseRole === 'ADMIN') {
      return res.status(403).json({ error: 'Cannot change role to admin' });
    }

    if (!['PATIENT', 'DOCTOR', 'ASSISTANT'].includes(uppercaseRole)) {
      return res.status(400).json({ error: 'Invalid user role' });
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: {
        role: uppercaseRole
      }
    });
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting admin
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.role === 'ADMIN') {
      return res.status(403).json({ error: 'Cannot delete admin user' });
    }

    // Delete from Supabase Auth
    try {
      await supabase.auth.admin.deleteUser(id);
    } catch (authErr) {
      console.warn('Failed to delete user from Supabase Auth:', authErr);
    }

    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
