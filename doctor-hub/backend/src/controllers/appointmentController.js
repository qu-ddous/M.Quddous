const prisma = require('../config/database');
const path = require('path');
const supabase = require('../config/supabase');

// Lean select for appointments list — avoids over-fetching
const appointmentListSelect = {
  id: true,
  date: true,
  timeSlot: true,
  reason: true,
  status: true,
  createdAt: true,
  patientId: true,
  doctorId: true,
  patient: {
    select: {
      id: true,
      fullName: true,
      phone: true,
      userId: true,
    }
  },
  doctor: {
    select: {
      id: true,
      fullName: true,
      specialization: true,
      fee: true,
      userId: true,
    }
  },
  payment: {
    select: { id: true, status: true, amount: true, method: true }
  },
  prescription: {
    select: { id: true, diagnosis: true }
  }
};

const createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, timeSlot, reason } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    let resolvedPatientId = patientId;

    // For patient users, always resolve patientId from the authenticated account.
    if (role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { userId }
      });

      if (!patient) {
        return res.status(404).json({ error: 'Patient profile not found' });
      }

      resolvedPatientId = patient.id;
    }

    if (!resolvedPatientId) {
      return res.status(400).json({ error: 'patientId is required' });
    }
    
    const appointment = await prisma.appointment.create({
      data: {
        patientId: resolvedPatientId,
        doctorId,
        date: new Date(date),
        timeSlot,
        reason,
        status: 'PENDING'
      },
      include: {
        patient: {
          include: {
            user: true
          }
        },
        doctor: {
          include: {
            user: true
          }
        }
      }
    });
    
    // Create notification for doctor
    await prisma.notification.create({
      data: {
        userId: appointment.doctor.userId,
        title: 'New Appointment Request',
        message: `You have a new appointment request from ${appointment.patient.fullName}`,
        type: 'APPOINTMENT'
      }
    });
    
    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
};

const getAppointments = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    
    let appointments;
    
    if (role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { userId }
      });
      
      if (!patient) {
        return res.status(404).json({ error: 'Patient profile not found' });
      }
      
      appointments = await prisma.appointment.findMany({
        where: { patientId: patient.id },
        select: appointmentListSelect,
        orderBy: { date: 'desc' }
      });
    } else if (role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({
        where: { userId }
      });
      
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor profile not found' });
      }
      
      appointments = await prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        select: appointmentListSelect,
        orderBy: { date: 'desc' }
      });
    } else {
      appointments = await prisma.appointment.findMany({
        select: appointmentListSelect,
        orderBy: { date: 'desc' }
      });
    }
    
    const parsedAppointments = appointments.map(apt => {
      if (apt.prescription) {
        return {
          ...apt,
          prescription: parsePrescription(apt.prescription)
        };
      }
      return apt;
    });
    res.json(parsedAppointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments', details: error.message });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: true
          }
        },
        doctor: {
          include: {
            user: true
          }
        },
        payment: true,
        prescription: true
      }
    });
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    if (appointment && appointment.prescription) {
      appointment.prescription = parsePrescription(appointment.prescription);
    }
    
    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        patient: {
          include: {
            user: true
          }
        },
        doctor: {
          include: {
            user: true
          }
        }
      }
    });
    
    // Create notification for patient
    await prisma.notification.create({
      data: {
        userId: appointment.patient.userId,
        title: 'Appointment Status Updated',
        message: `Your appointment has been ${status.toLowerCase()}`,
        type: 'APPOINTMENT'
      }
    });
    
    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { patientId, doctorId, date, timeSlot, reason, status } = req.body;
    
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        patientId,
        doctorId,
        date: new Date(date),
        timeSlot,
        reason,
        status
      },
      include: {
        patient: {
          include: {
            user: true
          }
        },
        doctor: {
          include: {
            user: true
          }
        }
      }
    });
    
    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.appointment.delete({
      where: { id }
    });
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
};

const parsePrescription = (prescription) => {
  if (!prescription) return null;
  let medicinesList = [];
  try {
    medicinesList = prescription.medicines ? JSON.parse(prescription.medicines) : [];
  } catch (e) {
    medicinesList = [];
  }
  
  const result = { ...prescription, medicines: medicinesList };
  
  if (medicinesList && medicinesList.length > 0) {
    result.medication = medicinesList[0].medication;
    result.dosage = medicinesList[0].dosage;
    result.duration = medicinesList[0].duration;
    result.instructions = medicinesList[0].instructions;
  }
  
  return result;
};

// ─── Create Appointment WITH Payment proof (atomic) ─────────────────────────
// Patient books + uploads payment proof in one step.
// Appointment stays PENDING until assistant verifies payment.
const createAppointmentWithPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { doctorId, date, timeSlot, reason, amount, method } = req.body;

    if (!doctorId || !date || !timeSlot || !amount || !method) {
      return res.status(400).json({ error: 'doctorId, date, timeSlot, amount, method are required' });
    }

    // Resolve patient
    const patient = await prisma.patient.findUnique({
      where: { userId },
      select: { id: true, userId: true }
    });
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    // Upload payment proof if file attached
    let proofUrl = null;
    if (req.file && req.file.buffer) {
      try {
        const fileExt = path.extname(req.file.originalname) || '';
        const fileName = `payments/${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
        if (!uploadError) {
          const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
          proofUrl = data?.publicUrl || null;
        }
      } catch (e) {
        console.error('Payment proof upload failed:', e);
      }
    }

    // Create appointment + payment atomically
    const result = await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.create({
        data: {
          patientId: patient.id,
          doctorId,
          date: new Date(date),
          timeSlot,
          reason: reason || null,
          status: 'PENDING'   // stays pending until payment verified
        }
      });

      const payment = await tx.payment.create({
        data: {
          patientId: patient.id,
          appointmentId: appointment.id,
          amount: parseFloat(amount),
          method: method.toUpperCase(),
          status: 'PENDING',
          proofUrl
        }
      });

      return { appointment, payment };
    });

    // Notify doctor (fire-and-forget)
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { userId: true, fullName: true }
    });
    if (doctor) {
      prisma.notification.create({
        data: {
          userId: doctor.userId,
          title: 'New Appointment Request',
          message: `New appointment request with payment proof submitted`,
          type: 'APPOINTMENT'
        }
      }).catch(() => {});
    }

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create appointment with payment' });
  }
};

module.exports = {
  createAppointment,
  createAppointmentWithPayment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment
};
