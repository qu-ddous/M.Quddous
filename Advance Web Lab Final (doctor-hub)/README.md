# Doctor Hub - Healthcare Management Platform

A comprehensive healthcare management platform connecting patients with doctors, featuring appointment booking, real-time chat, video consultations, and payment management.

## 🏥 Features

### For Patients
- **Doctor Search**: Find doctors by specialization
- **Appointment Booking**: Schedule appointments with preferred time slots
- **Real-time Chat**: Communicate with doctors
- **Video Consultations**: Live video calls with doctors
- **Medical Records**: Upload and view medical reports
- **Prescriptions**: View and download prescriptions
- **Payments**: Make payments and view payment history

### For Doctors
- **Schedule Management**: Set availability and manage appointments
- **Patient Management**: View patient history and records
- **Prescriptions**: Create and manage prescriptions
- **Real-time Chat**: Communicate with patients
- **Video Consultations**: Conduct video consultations
- **Profile Management**: Update professional information

### For Assistants
- **Payment Verification**: Verify and process payments
- **Booking Management**: View and manage appointments
- **Doctor Schedules**: View doctor availability

### For Admins
- **User Management**: Manage all users (doctors, patients, assistants)
- **Doctor Approvals**: Approve/reject doctor registrations
- **Statistics**: View platform analytics and reports
- **System Overview**: Monitor platform activity

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Web framework
- **PostgreSQL** - Database
- **Prisma** - ORM
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Lucide React** - Icons

## 📁 Project Structure

```
doctor-hub/
├── backend/              # Node.js + Express backend
│   ├── src/
│   │   ├── config/      # Database configuration
│   │   ├── controllers/ # API controllers
│   │   ├── middleware/  # Auth, error handling
│   │   ├── routes/      # API routes
│   │   ├── utils/       # Utility functions
│   │   └── server.js    # Main server file
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   └── seed.js      # Seed data
│   ├── .env.example     # Environment variables template
│   └── package.json
└── frontend/            # React + Vite frontend
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── context/     # React context providers
    │   ├── pages/       # Page components
    │   ├── services/    # API service functions
    │   ├── lib/         # Utility functions
    │   └── App.jsx      # Main app component
    ├── src/.env.example # Environment variables template
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
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

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. Seed database with sample data:
```bash
npm run prisma:seed
```

7. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp src/.env.example src/.env
```

Edit `src/.env` with your backend API URL:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 👤 Sample Login Credentials

### Admin
- Email: admin@doctorhub.com
- Password: admin123

### Patient
- Email: patient1@example.com
- Password: patient123

### Doctor
- Email: doctor1@example.com
- Password: doctor123

### Assistant
- Email: assistant@doctorhub.com
- Password: assistant123

## 📊 Database Schema

The platform uses PostgreSQL with the following main models:

- **User** - Base user table with authentication
- **Patient** - Patient-specific data
- **Doctor** - Doctor-specific data
- **Assistant** - Assistant-specific data
- **Appointment** - Appointment records
- **DoctorAvailability** - Doctor schedule
- **Payment** - Payment records
- **Prescription** - Prescription records
- **MedicalReport** - Medical report records
- **Message** - Chat messages
- **Notification** - User notifications

See `backend/prisma/schema.prisma` for complete schema details.

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Role-based access control (RBAC)
- Protected API routes
- Input validation
- SQL injection prevention (Prisma)
- XSS prevention
- CORS configuration

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `PUT /api/doctors/:id` - Update doctor profile
- `GET /api/doctors/:doctorId/availability` - Get doctor availability
- `POST /api/doctors/:doctorId/availability` - Set doctor availability

### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id/status` - Update appointment status

### Payments
- `POST /api/payments` - Create payment
- `GET /api/payments` - Get payments
- `PUT /api/payments/:id/verify` - Verify payment

### Patients
- `GET /api/patients/profile` - Get patient profile
- `PUT /api/patients/profile` - Update patient profile
- `POST /api/patients/reports` - Upload medical report
- `GET /api/patients/reports` - Get medical reports

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/:otherUserId` - Get conversation
- `PUT /api/messages/:id/read` - Mark message as read

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read

### Prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions/appointment/:appointmentId` - Get prescription

## 🎨 UI Features

- **Dark/Light Mode** - Toggle between themes
- **Responsive Design** - Works on all screen sizes
- **Glassmorphism UI** - Modern design aesthetic
- **Smooth Animations** - Enhanced user experience
- **Loading States** - Visual feedback during operations
- **Error Handling** - User-friendly error messages

## 🔧 Development Scripts

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with sample data

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database (Supabase, Railway, or self-hosted)
2. Configure environment variables
3. Deploy to Railway, Render, or any Node.js hosting platform

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy to Vercel, Netlify, or any static hosting platform
3. Configure environment variables

## 📝 Future Enhancements

- [ ] Video consultation integration with WebRTC
- [ ] Email/SMS notifications (SendGrid, Twilio)
- [ ] Cloud storage integration (Supabase Storage)
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] AI-powered doctor recommendations
- [ ] Integration with health wearables

## 🤝 Contributing

This is a Final Year Project (FYP) level application. Contributions are welcome!

## 📄 License

This project is for educational purposes.

## 👨‍💻 Authors

- Developed as a Final Year Project

## 🙏 Acknowledgments

- UI design inspiration from modern healthcare platforms
- Open-source libraries and tools used
