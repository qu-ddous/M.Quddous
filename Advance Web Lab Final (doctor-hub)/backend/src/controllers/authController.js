const { createClient } = require('@supabase/supabase-js');
const prisma = require('../config/database');
const supabase = require('../config/supabase');

// Initialize a client with the anon key to perform user actions (like login)
const supabaseAnon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const normalizeRole = (value) => (typeof value === 'string' ? value.trim().toUpperCase() : '');

const includeUserRelations = {
  patient: true,
  doctor: true,
  assistant: true,
};

const createLocalUserFromAuth = async (supabaseUser) => {
  const metadata = supabaseUser.user_metadata || {};
  const role = normalizeRole(metadata.role || supabaseUser.app_metadata?.role);

  if (!['PATIENT', 'DOCTOR', 'ASSISTANT', 'ADMIN'].includes(role)) {
    return null;
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        password: supabaseUser.id,
        role,
      },
    });

    const fullName = metadata.fullName || supabaseUser.email?.split('@')[0] || 'User';

    if (role === 'PATIENT') {
      await tx.patient.create({
        data: {
          userId: supabaseUser.id,
          fullName,
        },
      });
    } else if (role === 'DOCTOR') {
      await tx.doctor.create({
        data: {
          userId: supabaseUser.id,
          fullName,
          specialization: metadata.specialization || 'General',
          experience: Number(metadata.experience) || 0,
          qualification: metadata.qualification || 'MBBS',
          fee: Number(metadata.fee) || 0,
          about: metadata.about || null,
          phone: metadata.phone || null,
          isApproved: true,
        },
      });
    } else if (role === 'ASSISTANT') {
      await tx.assistant.create({
        data: {
          userId: supabaseUser.id,
          fullName,
          phone: metadata.phone || null,
        },
      });
    }
  });

  return prisma.user.findUnique({
    where: { id: supabaseUser.id },
    include: includeUserRelations,
  });
};

const register = async (req, res) => {
  try {
    const { email, password, role, fullName, phone } = req.body;
    
    // 1. Basic Validation
    if (!email || !password || !role || !fullName) {
      return res.status(400).json({ error: 'All fields (email, password, role, fullName) are required' });
    }

    const uppercaseRole = role.toUpperCase();
    if (!['PATIENT', 'DOCTOR', 'ASSISTANT', 'ADMIN'].includes(uppercaseRole)) {
      return res.status(400).json({ error: 'Invalid user role' });
    }

    // 2. Check if email is already registered locally
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // 3. Create user in Supabase Auth via admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: uppercaseRole, fullName }
    });
    
    if (authError) {
      console.error('Supabase Auth Registration Error:', authError);
      return res.status(400).json({ error: authError.message });
    }
    
    const supabaseUser = authData.user;
    
    // 4. Create local User mapping
    const user = await prisma.user.create({
      data: {
        id: supabaseUser.id, // Align IDs with Supabase Auth UUID
        email: supabaseUser.email,
          password: supabaseUser.id, // Local marker only; password is managed securely by Supabase
        role: uppercaseRole
      }
    });
    
    // 5. Create role-specific profiles
    if (uppercaseRole === 'PATIENT') {
      await prisma.patient.create({
        data: {
          userId: user.id,
          fullName,
          phone
        }
      });
    } else if (uppercaseRole === 'DOCTOR') {
      await prisma.doctor.create({
        data: {
          userId: user.id,
          fullName,
          phone,
          specialization: 'General',
          experience: 0,
          qualification: 'MBBS',
          fee: 500,
          isApproved: false  // Doctors must be approved by admin before they can login
        }
      });
      // Doctors must wait for admin approval - do NOT auto-login
      return res.status(201).json({
        message: 'Registration successful! Your doctor account is pending admin approval. You will receive access once verified.',
        pendingApproval: true
      });
    } else if (uppercaseRole === 'ASSISTANT') {
      await prisma.assistant.create({
        data: {
          userId: user.id,
          fullName,
          phone
        }
      });
    }
    
    // 6. Sign in to generate a session token for the user
    const { data: sessionData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password
    });
    
    if (signInError) {
      console.error('Session generation failed post-register:', signInError);
      return res.status(201).json({
        message: 'Registration successful. Please proceed to login.',
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    }
    
    res.status(201).json({
      message: 'Registration successful',
      token: sessionData.session.access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration API Error:', error);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // 1. Authenticate with Supabase
    const { data: sessionData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password
    });
    
    if (signInError) {
      return res.status(401).json({ error: 'Invalid credentials: ' + signInError.message });
    }
    
    const supabaseUser = sessionData.user;
    
    // 2. Fetch local user profile details (including doctor/patient/assistant profiles)
    let user = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
      include: includeUserRelations,
    });
    
    // Fallback search by email
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: supabaseUser.email },
        include: includeUserRelations,
      });
    }

    if (!user) {
      user = await createLocalUserFromAuth(supabaseUser);
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User registered in Auth but profile could not be synchronized with the local database' });
    }

    // Block unapproved doctors from logging in
    if (user.role === 'DOCTOR' && user.doctor && !user.doctor.isApproved) {
      return res.status(403).json({ 
        error: 'Your doctor account is pending admin approval. Please wait until an administrator verifies your profile.',
        pendingApproval: true
      });
    }
    
    res.json({
      message: 'Login successful',
      token: sessionData.session.access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        patient: user.patient,
        doctor: user.doctor,
        assistant: user.assistant
      }
    });
  } catch (error) {
    console.error('Login API Error:', error);
    res.status(500).json({ error: 'Login failed: ' + error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        patient: true,
        doctor: true,
        assistant: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get Profile API Error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

module.exports = { register, login, getProfile };
