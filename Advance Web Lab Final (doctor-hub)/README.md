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
<img width="1903" height="1026" alt="L1" src="https://github.com/user-attachments/assets/fdeee0bb-1b90-46d2-b4e1-1e72bbb1fc3f" />
<img width="1917" height="1027" alt="L2" src="https://github.com/user-attachments/assets/00dc8223-3efd-4570-abce-b1ab53f9e11a" />
<img width="1920" height="872" alt="L3" src="https://github.com/user-attachments/assets/eff99b5e-53d4-40e4-bed2-4297d6d2dc50" />
<img width="1905" height="878" alt="L5" src="https://github.com/user-attachments/assets/f97d13fb-ff4f-4147-8c15-8434a57ff8c6" />
<img width="1907" height="867" alt="Login" src="https://github.com/user-attachments/assets/af4120c0-289c-4576-959b-346986aea54c" />
<img width="1842" height="865" alt="login1" src="https://github.com/user-attachments/assets/78cddd33-8d43-4442-bf5d-2e87cc984691" />
<img width="1740" height="865" alt="regiter" src="https://github.com/user-attachments/assets/423fbc97-f9dd-4736-b282-da8a05cf32e7" />
<img width="1917" height="1022" alt="admin" src="https://github.com/user-attachments/assets/5132cdc0-3e1b-439a-bf6c-2346ac9c2ea9" />
<img width="1920" height="867" alt="admin 1" src="https://github.com/user-attachments/assets/009b47fb-1e65-4bf7-b34b-f35cd01fcc11" />
<img width="1915" height="876" alt="admin 2" src="https://github.com/user-attachments/assets/253911b8-2a43-4809-92b9-7df32bf6bf08" />
<img width="1920" height="856" alt="admin 3" src="https://github.com/user-attachments/assets/d6a129aa-2828-438d-af84-b13ff1dfcc22" />
<img width="1920" height="861" alt="admin 4" src="https://github.com/user-<img width="1912" height="1028" alt="patient" src="https://github.com/user-attachments/assets/597677f8-a732-4499-add7-aad0af86fcb5" />
attachments/assets/99e2cb93-05cf-45b8-a73e-c581147372b6" />
<img width="1915" height="885" alt="patient 1" src="https://github.com/user-attachments/assets/70e0e1c0-c2de-4856-afc6-3c52eef316b2" />
<img width="1918" height="847" alt="patient 2" src="https://github.com/user-attachments/assets/b9cfe8f2-7108-4581-af0c-808f86c50fd6" />
<img width="1887" height="883" alt="patient 3" src="https://github.com/user-attachments/assets/c7a1ad42-7867-46d6-8961-5c5b7e4215f0" />
<img width="1906" height="1032" alt="doctor " src="https://github.com/user-attachments/assets/6169fcd1-e585-4e61-8e37-f3407779f1d5" />
<img width="1912" height="883" alt="doctor1" src="https://github.com/user-attachments/assets/0cae2638-898e-4589-95f4-721fa8145910" />
<img width="1916" height="892" alt="doctor 2" src="https://github.com/user-attachments/assets/85708b2f-a003-4142-8e7d-f5a4ea6ddc35" />
<img width="1908" height="860" alt="doctor 3" src="https://github.com/user-attachments/assets/57bc7057-a536-4f71-91eb-e40300cdd275" />
<img width="1913" height="887" alt="doctor 4" src="https://github.com/user-attachments/assets/4296b06a-a00d-48b4-ab27-a16f189097ce" />
<img width="1890" height="888" alt="doctor 5" src="https://github.com/user-attachments/assets/95e28879-abbb-4c86-8979-815fd00c4a3d" />
<img width="1920" height="875" alt="assistent" src="https://github.com/user-attachments/assets/bffc84ab-8b1f-4eaa-a71d-e488e113bb83" />
<img width="1920" height="877" alt="assitent 1" src="https://github.com/user-attachments/assets/2e434996-3e0c-45be-9029-180a43c1d879" />
<img width="1896" height="856" alt="assitne t3" src="https://github.com/user-attachments/assets/4d31113a-24f1-4dd1-bd98-495705db3ff1" />
<img width="1917" height="887" alt="assitn 4" src="https://github.com/user-attachments/assets/ea719dd4-5fe7-4830-aeb6-5abe9084deb1" />



