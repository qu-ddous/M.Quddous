-- ============================================================
-- Doctor Hub - Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor to create all tables
-- ============================================================

-- Enable UUID extension (already enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('PATIENT', 'DOCTOR', 'ASSISTANT', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('EASYPAISA', 'JAZZCASH', 'BANK_TRANSFER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('APPOINTMENT', 'PAYMENT', 'MESSAGE', 'SYSTEM');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- TABLES
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role user_role NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_email ON "User" (email);
CREATE INDEX IF NOT EXISTS idx_user_role ON "User" (role);

-- Patient table
CREATE TABLE IF NOT EXISTS "Patient" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  "fullName" TEXT NOT NULL,
  phone TEXT,
  "dateOfBirth" TIMESTAMPTZ,
  address TEXT,
  "bloodType" TEXT,
  allergies TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_user ON "Patient" ("userId");

-- Doctor table
CREATE TABLE IF NOT EXISTS "Doctor" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  "fullName" TEXT NOT NULL,
  phone TEXT,
  specialization TEXT NOT NULL,
  experience INTEGER NOT NULL,
  qualification TEXT NOT NULL,
  fee DOUBLE PRECISION NOT NULL,
  about TEXT,
  "isApproved" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctor_user ON "Doctor" ("userId");
CREATE INDEX IF NOT EXISTS idx_doctor_specialization ON "Doctor" (specialization);
CREATE INDEX IF NOT EXISTS idx_doctor_approved ON "Doctor" ("isApproved");

-- Assistant table
CREATE TABLE IF NOT EXISTS "Assistant" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  "fullName" TEXT NOT NULL,
  phone TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assistant_user ON "Assistant" ("userId");

-- Appointment table
CREATE TABLE IF NOT EXISTS "Appointment" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "patientId" TEXT NOT NULL REFERENCES "Patient"(id) ON DELETE CASCADE,
  "doctorId" TEXT NOT NULL REFERENCES "Doctor"(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  "timeSlot" TEXT NOT NULL,
  status appointment_status NOT NULL DEFAULT 'PENDING',
  reason TEXT,
  notes TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointment_patient ON "Appointment" ("patientId");
CREATE INDEX IF NOT EXISTS idx_appointment_doctor ON "Appointment" ("doctorId");
CREATE INDEX IF NOT EXISTS idx_appointment_date ON "Appointment" (date);
CREATE INDEX IF NOT EXISTS idx_appointment_status ON "Appointment" (status);

-- DoctorAvailability table
CREATE TABLE IF NOT EXISTS "DoctorAvailability" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "doctorId" TEXT NOT NULL REFERENCES "Doctor"(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  "timeSlots" TEXT NOT NULL,
  "isAvailable" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_availability_doctor ON "DoctorAvailability" ("doctorId");
CREATE INDEX IF NOT EXISTS idx_availability_date ON "DoctorAvailability" (date);

-- Payment table
CREATE TABLE IF NOT EXISTS "Payment" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "patientId" TEXT NOT NULL REFERENCES "Patient"(id) ON DELETE CASCADE,
  "appointmentId" TEXT UNIQUE REFERENCES "Appointment"(id) ON DELETE SET NULL,
  amount DOUBLE PRECISION NOT NULL,
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'PENDING',
  "proofUrl" TEXT,
  "verifiedBy" TEXT,
  "verifiedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_patient ON "Payment" ("patientId");
CREATE INDEX IF NOT EXISTS idx_payment_appointment ON "Payment" ("appointmentId");
CREATE INDEX IF NOT EXISTS idx_payment_status ON "Payment" (status);

-- Prescription table
CREATE TABLE IF NOT EXISTS "Prescription" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "appointmentId" TEXT NOT NULL UNIQUE REFERENCES "Appointment"(id) ON DELETE CASCADE,
  "doctorId" TEXT NOT NULL REFERENCES "Doctor"(id) ON DELETE CASCADE,
  diagnosis TEXT NOT NULL,
  medicines TEXT NOT NULL,
  notes TEXT,
  "pdfUrl" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescription_appointment ON "Prescription" ("appointmentId");
CREATE INDEX IF NOT EXISTS idx_prescription_doctor ON "Prescription" ("doctorId");

-- MedicalReport table
CREATE TABLE IF NOT EXISTS "MedicalReport" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "patientId" TEXT NOT NULL REFERENCES "Patient"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "fileUrl2" TEXT,
  "fileUrl3" TEXT,
  "uploadedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_patient ON "MedicalReport" ("patientId");
CREATE INDEX IF NOT EXISTS idx_report_type ON "MedicalReport" (type);

-- Message table
CREATE TABLE IF NOT EXISTS "Message" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "senderId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "receiverId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_sender ON "Message" ("senderId");
CREATE INDEX IF NOT EXISTS idx_message_receiver ON "Message" ("receiverId");

-- Notification table
CREATE TABLE IF NOT EXISTS "Notification" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_user ON "Notification" ("userId");
CREATE INDEX IF NOT EXISTS idx_notification_type ON "Notification" (type);

-- ============================================================
-- AUTO-UPDATE updatedAt TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updatedAt
DO $$ 
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['User', 'Patient', 'Doctor', 'Assistant', 'Appointment', 'DoctorAvailability', 'Payment', 'Prescription'])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trigger_update_updated_at ON %I', tbl);
    EXECUTE format('CREATE TRIGGER trigger_update_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', tbl);
  END LOOP;
END $$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Enable RLS on all tables for production security.
-- The service_role key bypasses RLS, which is what the backend uses.
-- ============================================================

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Patient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Doctor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Assistant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DoctorAvailability" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Prescription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MedicalReport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

-- Allow the service_role full access (backend server uses this key)
-- Since Prisma connects via direct PostgreSQL connection string (not the Supabase JS client),
-- RLS does not apply to Prisma queries. RLS only applies to the PostgREST API (supabase-js).
-- If you want to use supabase-js from frontend directly in the future, add specific RLS policies.

-- ============================================================
-- STORAGE BUCKET SETUP (run via Supabase Dashboard or CLI)
-- ============================================================
-- 1. Go to Supabase Dashboard -> Storage
-- 2. Create a bucket named "uploads" (set to public)
-- 3. Under the bucket's policies, add:
--    - Allow public SELECT (read) for all files
--    - Allow authenticated INSERT (upload) 
--    - Allow authenticated UPDATE
--    - Allow authenticated DELETE
-- 
-- Or run this SQL to create the bucket programmatically:

INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Allow public read
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

-- Storage policy: Allow authenticated uploads  
DROP POLICY IF EXISTS "Authenticated upload" ON storage.objects;
CREATE POLICY "Authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'uploads');

-- Storage policy: Allow authenticated updates
DROP POLICY IF EXISTS "Authenticated update" ON storage.objects;
CREATE POLICY "Authenticated update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'uploads');

-- Storage policy: Allow authenticated deletes
DROP POLICY IF EXISTS "Authenticated delete" ON storage.objects;
CREATE POLICY "Authenticated delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'uploads');

