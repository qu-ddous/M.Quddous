# Doctor Hub - Backend API

Complete backend API for the Doctor Hub healthcare management platform.

## Tech Stack

- **Node.js** + **Express.js** - Web framework
- **Prisma** - ORM for PostgreSQL
- **PostgreSQL** - Database
- **Socket.io** - Real-time communication (chat, video calls)
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your cloud credentials:
```
DATABASE_URL="postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:6543/postgres?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
FRONTEND_URL="http://localhost:5173"
SUPABASE_URL="https://<PROJECT_REF>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="<SUPABASE_SERVICE_ROLE_KEY>"
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

5. Seed database with sample data:
```bash
npm run prisma:seed
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Doctors
- `GET /api/doctors` - Get all doctors (with optional specialization filter)
- `GET /api/doctors/:id` - Get doctor by ID
- `PUT /api/doctors/:id` - Update doctor profile (doctor only)
- `GET /api/doctors/:doctorId/availability` - Get doctor availability
- `POST /api/doctors/:doctorId/availability` - Set doctor availability (doctor only)

### Appointments
- `POST /api/appointments` - Create appointment (patient only)
- `GET /api/appointments` - Get appointments (based on user role)
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id/status` - Update appointment status

### Payments
- `POST /api/payments` - Create payment (patient only)
- `GET /api/payments` - Get payments (patient, assistant, admin)
- `PUT /api/payments/:id/verify` - Verify payment (assistant, admin)

### Patients
- `GET /api/patients/profile` - Get patient profile (patient only)
- `PUT /api/patients/profile` - Update patient profile (patient only)
- `POST /api/patients/reports` - Upload medical report (patient only)
- `GET /api/patients/reports` - Get medical reports (patient only)

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/:otherUserId` - Get conversation with user
- `PUT /api/messages/:id/read` - Mark message as read

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

### Prescriptions
- `POST /api/prescriptions` - Create prescription (doctor only)
- `GET /api/prescriptions/appointment/:appointmentId` - Get prescription by appointment

## User Roles

- **PATIENT** - Can book appointments, view doctors, chat with doctors, upload reports
- **DOCTOR** - Can manage appointments, create prescriptions, set availability
- **ASSISTANT** - Can verify payments, view bookings
- **ADMIN** - Can manage users, view all data

## Sample Data

The seed script creates:
- 1 Admin user
- 2 Patients
- 5 Doctors (Cardiologist, Dermatologist, General Physician, Pediatrician, Orthopedic Surgeon)
- 1 Assistant
- Sample appointments, payments, prescriptions, medical reports, messages, and notifications

### Sample Login Credentials

**Admin:**
- Email: admin@doctorhub.com
- Password: admin123

**Patient 1:**
- Email: patient1@example.com
- Password: patient123

**Patient 2:**
- Email: patient2@example.com
- Password: patient123

**Doctor 1:**
- Email: doctor1@example.com
- Password: doctor123

**Assistant:**
- Email: assistant@doctorhub.com
- Password: assistant123

## Real-time Features

### Socket.io Events

- `user_connected` - User connects to socket
- `send_message` - Send real-time message
- `receive_message` - Receive real-time message
- `video_call` - Initiate video call
- `incoming_call` - Receive incoming call
- `accept_call` - Accept video call
- `call_accepted` - Call accepted notification
- `end_call` - End video call
- `call_ended` - Call ended notification

## Database Schema

The database includes the following models:
- User (base user table)
- Patient (patient-specific data)
- Doctor (doctor-specific data)
- Assistant (assistant-specific data)
- Appointment (appointment records)
- DoctorAvailability (doctor schedule)
- Payment (payment records)
- Prescription (prescription records)
- MedicalReport (medical report records)
- Message (chat messages)
- Notification (user notifications)

## Security

- Passwords hashed with bcryptjs
- JWT token-based authentication
- Role-based access control (RBAC)
- Protected routes with middleware
- CORS configuration
- Input validation

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── appointmentController.js
│   │   ├── paymentController.js
│   │   ├── patientController.js
│   │   ├── messageController.js
│   │   ├── notificationController.js
│   │   └── prescriptionController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── prescriptionRoutes.js
│   ├── utils/
│   │   └── jwt.js
│   └── server.js
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── .env.example
├── package.json
└── README.md
```
