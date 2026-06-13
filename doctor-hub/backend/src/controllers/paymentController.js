const prisma = require('../config/database');
const path = require('path');
const supabase = require('../config/supabase');

const createPayment = async (req, res) => {
  try {
    // Accept multipart/form-data with optional file `screenshot`
    const { patientId: bodyPatientId, appointmentId, amount, method, transactionId, bank } = req.body;

    // Resolve patientId server-side if not provided
    let patientId = bodyPatientId;
    if (!patientId) {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({ error: 'Unauthenticated: patientId missing' });
      }
      const patient = await prisma.patient.findUnique({ where: { userId } });
      if (!patient) {
        return res.status(400).json({ error: 'Patient profile not found for this user' });
      }
      patientId = patient.id;
    }

    let proofUrl = req.body.proofUrl || null;
    if (req.file && req.file.buffer) {
      try {
        const fileExt = path.extname(req.file.originalname) || '';
        const fileName = `payments/${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: false });

        if (uploadError) {
          console.error('Supabase upload error:', uploadError);
        } else {
          const { data } = supabase.storage.from('uploads').getPublicUrl(fileName);
          proofUrl = data?.publicUrl || null;
        }
      } catch (e) {
        console.error('Failed uploading to Supabase:', e);
      }
    }

    const payment = await prisma.payment.create({
      data: {
        patientId,
        appointmentId: appointmentId || null,
        amount: Number.parseFloat(amount),
        method: method ? method.toUpperCase() : 'BANK_TRANSFER',
        status: 'PENDING',
        proofUrl
      },
      include: {
        patient: true,
        appointment: true
      }
    });

    // Notify assistants/admins with transaction details so they can verify
    const infoParts = [];
    if (transactionId) infoParts.push(`Transaction ID: ${transactionId}`);
    if (bank) infoParts.push(`Bank/Channel: ${bank}`);
    const infoMessage = infoParts.length > 0 ? infoParts.join(' | ') : 'Payment submitted with proof.';

    await prisma.notification.create({
      data: {
        userId: payment.patient.userId,
        title: 'Payment Submitted',
        message: `A payment proof was submitted. ${infoMessage}`,
        type: 'PAYMENT'
      }
    });

    // Return payment and echo back the transaction metadata so frontend can show history
    res.status(201).json({ ...payment, transactionId: transactionId || null, bank: bank || null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

const getPayments = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    
    let payments;
    
    if (role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { userId },
        select: { id: true }
      });
      payments = await prisma.payment.findMany({
        where: { patientId: patient.id },
        select: {
          id: true, amount: true, method: true, status: true, proofUrl: true,
          createdAt: true, verifiedAt: true, transactionId: true,
          appointment: {
            select: {
              id: true, date: true, timeSlot: true,
              doctor: { select: { id: true, fullName: true, specialization: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (role === 'ASSISTANT' || role === 'ADMIN') {
      payments = await prisma.payment.findMany({
        select: {
          id: true, amount: true, method: true, status: true, proofUrl: true,
          createdAt: true, verifiedAt: true, verifiedBy: true,
          patient: { select: { id: true, fullName: true, userId: true } },
          appointment: {
            select: {
              id: true, date: true, timeSlot: true,
              doctor: { select: { id: true, fullName: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }
    
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        status: status.toUpperCase(),
        verifiedBy: req.user.id,
        verifiedAt: new Date()
      },
      include: {
        patient: {
          include: {
            user: true
          }
        }
      }
    });
    
    // Create notification for patient
    await prisma.notification.create({
      data: {
        userId: payment.patient.userId,
        title: 'Payment Status Updated',
        message: `Your payment has been ${status.toLowerCase()}`,
        type: 'PAYMENT'
      }
    });
    
    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, method, status } = req.body;
    
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        amount: Number.parseFloat(amount),
        method: method.toUpperCase(),
        status: status.toUpperCase()
      },
      include: {
        patient: true,
        appointment: {
          include: {
            doctor: true
          }
        }
      }
    });
    
    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
};

const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.payment.delete({
      where: { id }
    });
    
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
};

module.exports = {
  createPayment,
  getPayments,
  verifyPayment,
  updatePayment,
  deletePayment
};
