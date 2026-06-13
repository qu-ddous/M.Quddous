require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in your .env file to seed users.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getOrCreateAuthUser(email, password, role, fullName) {
  try {
    // List users to see if they already exist in Supabase Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      throw listError;
    }

    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      console.log(`User ${email} already exists in Supabase Auth (ID: ${existing.id})`);
      return existing.id;
    }

    // Create new user
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, fullName }
    });

    if (createError) {
      throw createError;
    }

    console.log(`Created user ${email} in Supabase Auth (ID: ${data.user.id})`);
    return data.user.id;
  } catch (err) {
    console.error(`Failed to get/create Auth user ${email}:`, err.message);
    throw err;
  }
}

async function main() {
  console.log('Starting seed...');

  // 1. Create/Ensure all users exist in Supabase Auth
  const adminId = await getOrCreateAuthUser('admin@doctorhub.com', 'admin123', 'ADMIN', 'System Administrator');
  const patient1Id = await getOrCreateAuthUser('patient1@example.com', 'patient123', 'PATIENT', 'John Doe');
  const patient2Id = await getOrCreateAuthUser('patient2@example.com', 'patient123', 'PATIENT', 'Jane Smith');
  const doctor1Id = await getOrCreateAuthUser('doctor1@example.com', 'doctor123', 'DOCTOR', 'Dr. Ahmed Khan');
  const doctor2Id = await getOrCreateAuthUser('doctor2@example.com', 'doctor123', 'DOCTOR', 'Dr. Sarah Ali');
  const doctor3Id = await getOrCreateAuthUser('doctor3@example.com', 'doctor123', 'DOCTOR', 'Dr. Muhammad Hassan');
  const doctor4Id = await getOrCreateAuthUser('doctor4@example.com', 'doctor123', 'DOCTOR', 'Dr. Fatima Zahra');
  const doctor5Id = await getOrCreateAuthUser('doctor5@example.com', 'doctor123', 'DOCTOR', 'Dr. Ali Raza');
  const assistantId = await getOrCreateAuthUser('assistant@doctorhub.com', 'assistant123', 'ASSISTANT', 'Admin Assistant');

  // 2. Clean database tables to start fresh (in order of dependencies)
  console.log('Cleaning up existing database tables...');
  await prisma.notification.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.medicalReport.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.doctorAvailability.deleteMany({});
  await prisma.assistant.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.user.deleteMany({});
  // NOTE: The above only clears your LOCAL database tables.
  // Supabase Auth users are NOT deleted here — they stay in Supabase dashboard.
  // To also delete Auth users, go to Supabase → Authentication → Users and remove them manually.
  // Running seed again will reuse existing Auth users (getOrCreateAuthUser handles this).

  // 3. Insert Users & Profiles with correct Supabase Auth UUIDs
  console.log('Seeding profiles into the local database...');

  // Admin
  await prisma.user.create({
    data: {
      id: adminId,
      email: 'admin@doctorhub.com',
      password: 'SUPABASE_AUTH', // password managed by Supabase Auth
      role: 'ADMIN'
    }
  });

  // Patients
  const patient1 = await prisma.user.create({
    data: {
      id: patient1Id,
      email: 'patient1@example.com',
      password: 'SUPABASE_AUTH',
      role: 'PATIENT',
      patient: {
        create: {
          fullName: 'John Doe',
          phone: '+923001234567',
          dateOfBirth: new Date('1990-05-15'),
          address: '123 Main St, Lahore',
          bloodType: 'A+',
          allergies: 'Penicillin'
        }
      }
    },
    include: { patient: true }
  });

  const patient2 = await prisma.user.create({
    data: {
      id: patient2Id,
      email: 'patient2@example.com',
      password: 'SUPABASE_AUTH',
      role: 'PATIENT',
      patient: {
        create: {
          fullName: 'Jane Smith',
          phone: '+923007654321',
          dateOfBirth: new Date('1985-08-22'),
          address: '456 Oak Ave, Karachi',
          bloodType: 'B+',
          allergies: null
        }
      }
    },
    include: { patient: true }
  });

  // Doctors
  const doctor1 = await prisma.user.create({
    data: {
      id: doctor1Id,
      email: 'doctor1@example.com',
      password: 'SUPABASE_AUTH',
      role: 'DOCTOR',
      doctor: {
        create: {
          fullName: 'Dr. Ahmed Khan',
          phone: '+923001111222',
          specialization: 'Cardiologist',
          experience: 15,
          qualification: 'MBBS, FCPS (Cardiology)',
          fee: 1500,
          about: 'Expert in treating heart conditions with over 15 years of experience.',
          isApproved: true
        }
      }
    },
    include: { doctor: true }
  });

  const doctor2 = await prisma.user.create({
    data: {
      id: doctor2Id,
      email: 'doctor2@example.com',
      password: 'SUPABASE_AUTH',
      role: 'DOCTOR',
      doctor: {
        create: {
          fullName: 'Dr. Sarah Ali',
          phone: '+923003334445',
          specialization: 'Dermatologist',
          experience: 10,
          qualification: 'MBBS, FCPS (Dermatology)',
          fee: 1000,
          about: 'Specialized in skin care and dermatological treatments.',
          isApproved: true
        }
      }
    },
    include: { doctor: true }
  });

  await prisma.user.create({
    data: {
      id: doctor3Id,
      email: 'doctor3@example.com',
      password: 'SUPABASE_AUTH',
      role: 'DOCTOR',
      doctor: {
        create: {
          fullName: 'Dr. Muhammad Hassan',
          phone: '+923005556667',
          specialization: 'General Physician',
          experience: 8,
          qualification: 'MBBS',
          fee: 800,
          about: 'General physician providing comprehensive healthcare services.',
          isApproved: true
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      id: doctor4Id,
      email: 'doctor4@example.com',
      password: 'SUPABASE_AUTH',
      role: 'DOCTOR',
      doctor: {
        create: {
          fullName: 'Dr. Fatima Zahra',
          phone: '+923007778889',
          specialization: 'Pediatrician',
          experience: 12,
          qualification: 'MBBS, FCPS (Pediatrics)',
          fee: 1200,
          about: 'Specialized in child healthcare and pediatric medicine.',
          isApproved: true
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      id: doctor5Id,
      email: 'doctor5@example.com',
      password: 'SUPABASE_AUTH',
      role: 'DOCTOR',
      doctor: {
        create: {
          fullName: 'Dr. Ali Raza',
          phone: '+923009990001',
          specialization: 'Orthopedic Surgeon',
          experience: 20,
          qualification: 'MBBS, FCPS (Orthopedics)',
          fee: 2000,
          about: 'Expert in bone and joint surgeries with extensive experience.',
          isApproved: true
        }
      }
    }
  });

  // Assistant
  const assistantUser = await prisma.user.create({
    data: {
      id: assistantId,
      email: 'assistant@doctorhub.com',
      password: 'SUPABASE_AUTH',
      role: 'ASSISTANT',
      assistant: {
        create: {
          fullName: 'Admin Assistant',
          phone: '+923002223334'
        }
      }
    },
    include: { assistant: true }
  });

  console.log('Seeded users and main profiles successfully.');

  // 4. Create Doctor Availability
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  await prisma.doctorAvailability.create({
    data: {
      doctorId: doctor1.doctor.id,
      date: tomorrow,
      timeSlots: JSON.stringify(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'])
    }
  });

  await prisma.doctorAvailability.create({
    data: {
      doctorId: doctor1.doctor.id,
      date: dayAfter,
      timeSlots: JSON.stringify(['09:00', '10:00', '11:00', '14:00', '15:00'])
    }
  });

  await prisma.doctorAvailability.create({
    data: {
      doctorId: doctor2.doctor.id,
      date: tomorrow,
      timeSlots: JSON.stringify(['10:00', '11:00', '12:00', '15:00', '16:00', '17:00'])
    }
  });

  console.log('Seeded doctor availability successfully.');

  // 5. Create Sample Appointments
  const appointment1 = await prisma.appointment.create({
    data: {
      patientId: patient1.patient.id,
      doctorId: doctor1.doctor.id,
      date: tomorrow,
      timeSlot: '10:00',
      status: 'CONFIRMED',
      reason: 'Chest pain and shortness of breath'
    }
  });

  const appointment2 = await prisma.appointment.create({
    data: {
      patientId: patient2.patient.id,
      doctorId: doctor2.doctor.id,
      date: dayAfter,
      timeSlot: '11:00',
      status: 'PENDING',
      reason: 'Skin rash and itching'
    }
  });

  console.log('Seeded sample appointments successfully.');

  // 6. Create Sample Payments
  await prisma.payment.create({
    data: {
      patientId: patient1.patient.id,
      appointmentId: appointment1.id,
      amount: 1500,
      method: 'EASYPAISA',
      status: 'VERIFIED',
      proofUrl: 'https://example.com/payment-proof-1.jpg',
      verifiedBy: assistantUser.assistant.id,
      verifiedAt: new Date()
    }
  });

  await prisma.payment.create({
    data: {
      patientId: patient2.patient.id,
      appointmentId: appointment2.id,
      amount: 1000,
      method: 'JAZZCASH',
      status: 'PENDING',
      proofUrl: 'https://example.com/payment-proof-2.jpg'
    }
  });

  console.log('Seeded sample payments successfully.');

  // 7. Create Sample Prescription
  await prisma.prescription.create({
    data: {
      appointmentId: appointment1.id,
      doctorId: doctor1.doctor.id,
      diagnosis: 'Mild hypertension and anxiety',
      medicines: JSON.stringify([
        { medication: 'Amlodipine 5mg', dosage: 'Once daily', duration: '30 days', instructions: 'Take in the morning' },
        { medication: 'Multivitamin', dosage: 'Once daily', duration: '30 days', instructions: 'Take after breakfast' }
      ]),
      notes: 'Follow up after 2 weeks. Maintain healthy diet and exercise.',
      pdfUrl: 'https://example.com/prescription-1.pdf'
    }
  });

  console.log('Seeded sample prescriptions successfully.');

  // 8. Create Sample Medical Reports
  await prisma.medicalReport.create({
    data: {
      patientId: patient1.patient.id,
      title: 'Blood Test Report',
      type: 'Blood Test',
      fileUrl: 'https://example.com/blood-test-1.pdf',
      uploadedAt: new Date()
    }
  });

  await prisma.medicalReport.create({
    data: {
      patientId: patient1.patient.id,
      title: 'ECG Report',
      type: 'ECG',
      fileUrl: 'https://example.com/ecg-1.pdf',
      uploadedAt: new Date()
    }
  });

  await prisma.medicalReport.create({
    data: {
      patientId: patient2.patient.id,
      title: 'X-Ray Chest',
      type: 'X-Ray',
      fileUrl: 'https://example.com/xray-1.pdf',
      uploadedAt: new Date()
    }
  });

  console.log('Seeded sample medical reports successfully.');

  // 9. Create Sample Messages
  await prisma.message.create({
    data: {
      senderId: patient1.id,
      receiverId: doctor1.id,
      content: 'Hello doctor, I have some questions about my prescription.',
      isRead: true
    }
  });

  await prisma.message.create({
    data: {
      senderId: doctor1.id,
      receiverId: patient1.id,
      content: 'Sure, please go ahead with your questions.',
      isRead: false
    }
  });

  console.log('Seeded sample messages successfully.');

  // 10. Create Sample Notifications
  await prisma.notification.create({
    data: {
      userId: patient1.id,
      title: 'Appointment Confirmed',
      message: 'Your appointment with Dr. Ahmed Khan has been confirmed for tomorrow at 10:00 AM.',
      type: 'APPOINTMENT',
      isRead: false
    }
  });

  await prisma.notification.create({
    data: {
      userId: patient2.id,
      title: 'Payment Verified',
      message: 'Your payment has been verified successfully.',
      type: 'PAYMENT',
      isRead: true
    }
  });

  console.log('Seeded sample notifications successfully.');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
