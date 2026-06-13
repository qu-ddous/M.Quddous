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

# 🎨 UI Features

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
<img width="1903" height="1026" alt="L1" src="https://github.com/user-attachments/assets/98ccc083-fcfe-4786-99b9-73870fe42be1" />
<img width="1890" height="888" alt="doctor 5" src="https://github.com/user-attachments/assets/53499c5f-46ae-4147-b223-08571579830e" />
<img width="1913" height="887" alt="doctor 4" src="https://github.com/user-attachments/assets/53b4723a-9ac3-4483-8d4c-b74e8946dcbf" />
<img width="1908" height="860" alt="doctor 3" src="https://github.com/user-attachments/assets/de57476e-1bad-4b3a-be12-0249230e797d" />
<img width="1916" height="892" alt="doctor 2" src="https://github.com/user-attachments/assets/d67cead2-d9be-45ec-9011-f331040b8ea0" />
<img width="1912" height="883" alt="doctor1" src="https://github.com/user-attachments/assets/72803ab6-ae74-48e3-80f7-c231dcd75bc8" />
<img width="1906" height="1032" alt="doctor " src="https://github.com/user-attachments/assets/478fe3ea-ccb4-438c-876e-cdd0f5b2004e" />
<img width="1887" height="883" alt="patient 3" src="https://github.com/user-attachments/assets/6d86c020-7162-41da-9347-671aee62fea3" />
<img width="1918" height="847" alt="patient 2" src="https://github.com/user-attachments/assets/aee1d881-d112-4e1e-a1d8-ff450140b48f" />
<img width="1915" height="885" alt="patient 1" src="https://github.com/user-attachments/assets/e0579844-849d-4ca4-956e-719f31385445" />
<img width="1912" height="1028" alt="patient" src="https://github.com/user-attachments/assets/3e149c72-da21-44f7-b632-cbf4f170c0ee" />
<img width="1920" height="861" alt="admin 4" src="https://github.com/user-attachments/assets/b989e6c4-9e3f-4d7d-be28-4b369beb947d" />
<img width="1920" height="856" alt="admin 3" src="https://github.com/user-attachments/assets/96f9a851-4c64-4732-9fe7-4ed09aa5e525" />
<img width="1915" height="876" alt="admin 2" src="https://github.com/user-attachments/assets/8d4f23e0-f9e1-4c8f-8660-9105538f5fce" />
<img width="1917" height="887" alt="assitn 4" src="https://github.com/user-attachments/assets/53a0b024-2e15-467a-a1ae-ed6c82d35171" />
<img width="1896" height="856" alt="assitne t3" src="https://github.com/user-attachments/assets/c7fb4f2b-608e-4093-b3ed-c2a024ee842d" />
<img width="1920" height="877" alt="assitent 1" src="https://github.com/user-attachments/assets/829b56b9-d67a-48c4-8ac1-ab4bc227e2b0" />
<img width="1920" height="875" alt="assistent" src="https://github.com/user-attachments/assets/0dd38e3b-802a-49e1-bc60-d23cf2b171e2" />
<img width="1920" height="867" alt="admin 1" src="https://github.com/user-attachments/assets/a7b2b894-8854-4045-9521-1201ac80a695" />
<img width="1917" height="1022" alt="admin" src="https://github.com/user-attachments/assets/651c3206-4576-4df1-98a6-578bc7e3016b" />
<img width="1740" height="865" alt="regiter" src="https://github.com/user-attachments/assets/ea393c5d-3f74-41b1-90ec-de5dfde8f540" />
<img width="1842" height="865" alt="login1" src="https://github.com/user-attachments/assets/c43a4410-564d-4810-86a5-fc374e3cba95" />
<img width="1907" height="867" alt="Login" src="https://github.com/user-attachments/assets/2d2e6c0d-d17b-43d9-99d2-9191a6bbb902" />
<img width="1905" height="878" alt="L5" src="https://github.com/user-attachments/assets/05101f64-c83a-4623-a5e8-3731d8cd746e" />
<img width="1920" height="872" alt="L3" src="https://github.com/user-attachments/assets/ee68c657-6757-4c8f-a2a6-ac6a24f794eb" />
<img width="1917" height="1027" alt="L2" src="https://github.com/user-attachments/assets/0a8d21cf-5529-4b37-b8ca-914d712ee482" />


