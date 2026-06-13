const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');


const getAllDoctors = async (req, res) => {
  try {
    const { specialization, includePending } = req.query;

    const where = includePending === 'true' ? {} : { isApproved: true };

    if (specialization) {
      where.specialization = specialization;
    }

    const doctors = await prisma.doctor.findMany({
      where,
      select: {
        id: true,
        userId: true,
        fullName: true,
        phone: true,
        specialization: true,
        experience: true,
        qualification: true,
        fee: true,
        about: true,
        isApproved: true,
        user: {
          select: { email: true }
        }
      },
      orderBy: { fullName: 'asc' }
    });

    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });
    
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
};

const createDoctor = async (req, res) => {
  try {
    const { email, password, fullName, phone, specialization, experience, qualification, fee, about } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Create user in Supabase Auth via admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'DOCTOR', fullName }
    });
    
    if (authError) {
      console.error('Supabase Auth Creation Error (Doctor):', authError);
      return res.status(400).json({ error: authError.message });
    }
    
    const supabaseUser = authData.user;
    
    // Create user and doctor in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          password: 'SUPABASE_AUTH',
          role: 'DOCTOR'
        }
      });
      
      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          fullName,
          phone,
          specialization,
          experience: parseInt(experience) || 0,
          qualification,
          fee: parseFloat(fee) || 0,
          about,
          isApproved: true
        }
      });
      
      return { user, doctor };
    });
    
    const createdDoctor = await prisma.doctor.findUnique({
      where: { id: result.doctor.id },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });
    res.status(201).json(createdDoctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create doctor: ' + error.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete doctor and associated user
    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }
    
    // Delete from Supabase Auth
    try {
      await supabase.auth.admin.deleteUser(doctor.userId);
    } catch (authErr) {
      console.warn('Failed to delete doctor user from Supabase Auth:', authErr);
    }
    
    await prisma.$transaction(async (tx) => {
      await tx.doctor.delete({ where: { id } });
      await tx.user.delete({ where: { id: doctor.userId } });
    });
    
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
};

const approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctor = await prisma.doctor.update({
      where: { id },
      data: { isApproved: true },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });
    
    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to approve doctor' });
  }
};

const rejectDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctor = await prisma.doctor.update({
      where: { id },
      data: { isApproved: false },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });
    
    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to reject doctor' });
  }
};

const updateDoctorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, specialization, experience, qualification, fee, about } = req.body;
    
    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        fullName,
        phone,
        specialization,
        experience: experience !== undefined ? parseInt(experience) || 0 : undefined,
        qualification,
        fee: fee !== undefined ? parseFloat(fee) || 0 : undefined,
        about
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });
    
    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update doctor profile' });
  }
};

const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    
    const where = { doctorId };
    if (date) {
      where.date = new Date(date);
    }
    
    const availability = await prisma.doctorAvailability.findMany({
      where,
      orderBy: { date: 'asc' }
    });
    
    const parsedAvailability = availability.map(av => {
      let slots = [];
      try {
        slots = av.timeSlots ? JSON.parse(av.timeSlots) : [];
      } catch (e) {
        slots = av.timeSlots ? [av.timeSlots] : [];
      }
      return { ...av, timeSlots: slots };
    });
    
    res.json(parsedAvailability);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
};

const setDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date, timeSlots } = req.body;
    
    const slotsString = Array.isArray(timeSlots) ? JSON.stringify(timeSlots) : timeSlots;
    
    const availability = await prisma.doctorAvailability.create({
      data: {
        doctorId,
        date: new Date(date),
        timeSlots: slotsString
      }
    });
    
    let parsedSlots = [];
    try {
      parsedSlots = availability.timeSlots ? JSON.parse(availability.timeSlots) : [];
    } catch (e) {
      parsedSlots = availability.timeSlots ? [availability.timeSlots] : [];
    }
    
    res.json({ ...availability, timeSlots: parsedSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to set availability' });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  deleteDoctor,
  approveDoctor,
  rejectDoctor,
  updateDoctorProfile,
  getDoctorAvailability,
  setDoctorAvailability
};
