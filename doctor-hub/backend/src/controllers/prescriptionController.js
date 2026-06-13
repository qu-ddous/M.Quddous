const prisma = require('../config/database');
const path = require('path');
const supabase = require('../config/supabase');

const createPrescription = async (req, res) => {
  try {
    const { appointmentId, diagnosis, medicines, notes, pdfUrl } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ error: 'appointmentId is required' });
    }

    // Load appointment to get doctor and patient info
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: { include: { user: true } }, doctor: true }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const doctorId = appointment.doctorId;

    // Normalize medicines: accept either `medicines` array or fields from the doctor's form
    let medicinesPayload = medicines;
    if (!medicinesPayload) {
      const { medication, dosage, duration, instructions } = req.body;
      if (medication || dosage || duration || instructions) {
        medicinesPayload = [{ medication, dosage, duration, instructions }];
      } else {
        medicinesPayload = [];
      }
    }

    const diagnosisValue = diagnosis || req.body.instructions || 'Not provided';

    let finalPdfUrl = pdfUrl || null;
    if (req.file && req.file.buffer) {
      try {
        const fileExt = path.extname(req.file.originalname) || '';
        const fileName = `prescriptions/${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: false });

        if (uploadError) {
          console.error('Supabase upload error:', uploadError);
        } else {
          const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
          finalPdfUrl = data?.publicUrl || null;
        }
      } catch (e) {
        console.error('Failed uploading prescription PDF to Supabase:', e);
      }
    }

    const prescription = await prisma.prescription.create({
      data: {
        appointmentId,
        doctorId,
        diagnosis: diagnosisValue,
        medicines: JSON.stringify(medicinesPayload),
        notes,
        pdfUrl: finalPdfUrl
      },
      include: {
        appointment: {
          include: {
            patient: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    // Create notification for patient
    try {
      await prisma.notification.create({
        data: {
          userId: prescription.appointment.patient.userId,
          title: 'New Prescription',
          message: 'Your doctor has created a new prescription for you',
          type: 'SYSTEM'
        }
      });
    } catch (notifyErr) {
      console.error('Failed to create notification:', notifyErr);
    }

    res.status(201).json(parsePrescription(prescription));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create prescription', details: error.message });
  }
};

const getPrescriptionByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    const prescription = await prisma.prescription.findUnique({
      where: { appointmentId },
      include: {
        appointment: {
          include: {
            doctor: true,
            patient: true
          }
        }
      }
    });
    
    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    
    res.json(parsePrescription(prescription));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch prescription' });
  }
};

const getPrescriptionsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const prescriptions = await prisma.prescription.findMany({
      where: {
        doctorId: doctorId
      },
      include: {
        appointment: {
          include: {
            doctor: true,
            patient: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(prescriptions.map(parsePrescription));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch prescriptions' });
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

module.exports = {
  createPrescription,
  getPrescriptionByAppointment,
  getPrescriptionsByDoctor
};
