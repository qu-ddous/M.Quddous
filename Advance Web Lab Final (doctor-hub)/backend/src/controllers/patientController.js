const prisma = require('../config/database');
const path = require('path');
const supabase = require('../config/supabase');

const getPatientProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const patient = await prisma.patient.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        fullName: true,
        phone: true,
        dateOfBirth: true,
        address: true,
        bloodType: true,
        allergies: true,
        createdAt: true,
        user: {
          select: { email: true }
        },
        medicalReports: {
          select: { id: true, title: true, type: true, fileUrl: true, uploadedAt: true },
          orderBy: { uploadedAt: 'desc' },
          take: 20
        },
        appointments: {
          select: {
            id: true,
            date: true,
            timeSlot: true,
            status: true,
            doctor: {
              select: { id: true, fullName: true, specialization: true }
            }
          },
          orderBy: { date: 'desc' },
          take: 10
        }
      }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch patient profile' });
  }
};

const updatePatientProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phone, dateOfBirth, address, bloodType, allergies } = req.body;
    
    const patient = await prisma.patient.update({
      where: { userId },
      data: {
        fullName,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address,
        bloodType,
        allergies
      }
    });
    
    res.json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update patient profile' });
  }
};

const uploadMedicalReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const patient = await prisma.patient.findUnique({ where: { userId } });
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const { title, type, fileUrl, fileUrl2, fileUrl3 } = req.body;
    let uploadedFileUrl = fileUrl || null;

    if (req.file && req.file.buffer) {
      try {
        const fileExt = path.extname(req.file.originalname) || '';
        const fileName = `reports/${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: false });

        if (uploadError) {
          console.error('Supabase upload error:', uploadError);
        } else {
          const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
          uploadedFileUrl = data?.publicUrl || uploadedFileUrl;
        }
      } catch (e) {
        console.error('Failed uploading to Supabase:', e);
      }
    }
    
    const report = await prisma.medicalReport.create({
      data: {
        patientId: patient.id,
        title,
        type,
        fileUrl: uploadedFileUrl,
        fileUrl2,
        fileUrl3
      }
    });
    
    res.status(201).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload medical report' });
  }
};

const getMedicalReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const patient = await prisma.patient.findUnique({ where: { userId } });

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }
    
    const reports = await prisma.medicalReport.findMany({
      where: { patientId: patient.id },
      orderBy: { uploadedAt: 'desc' }
    });
    
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch medical reports' });
  }
};

module.exports = {
  getPatientProfile,
  updatePatientProfile,
  uploadMedicalReport,
  getMedicalReports
};
