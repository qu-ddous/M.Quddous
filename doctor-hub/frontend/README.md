# Doctor Hub - Frontend

Frontend application for the Doctor Hub healthcare management platform.

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **TanStack Query** - Data fetching
- **Lucide React** - Icons

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp src/.env.example src/.env
```

Edit `src/.env` with your backend API URL:
```
VITE_API_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── Navbar.jsx
│   │   └── Loading.jsx
│   ├── context/         # React context providers
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/          # Page components
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── PatientDashboard.jsx
│   │   ├── DoctorDashboard.jsx
│   │   ├── AssistantDashboard.jsx
│   │   └── AdminDashboard.jsx
│   ├── services/       # API service functions
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── doctorService.js
│   │   ├── appointmentService.js
│   │   ├── paymentService.js
│   │   ├── patientService.js
│   │   ├── messageService.js
│   │   ├── notificationService.js
│   │   └── prescriptionService.js
│   ├── lib/            # Utility functions
│   │   └── utils.js
│   ├── App.jsx         # Main app component with routing
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles with Tailwind
├── public/             # Static assets
├── index.html          # HTML template
├── tailwind.config.js  # Tailwind configuration
├── vite.config.js      # Vite configuration
└── package.json        # Dependencies
```

## Features

### Authentication
- User registration with role selection
- Login with email and password
- Protected routes based on user role
- JWT token management

### User Roles
- **Patient** - Book appointments, view doctors, chat with doctors
- **Doctor** - Manage appointments, create prescriptions, set availability
- **Assistant** - Verify payments, view bookings
- **Admin** - Manage users, view statistics

### Pages
- **Landing Page** - Hero section, features, statistics
- **Login/Register** - Authentication pages
- **Patient Dashboard** - Health overview, appointments, doctor search
- **Doctor Dashboard** - Schedule, patient list, appointment requests
- **Assistant Dashboard** - Payment verification, bookings
- **Admin Dashboard** - Statistics, doctor management, user management

### UI Components
- Button - Reusable button with variants
- Input - Form input with validation
- Card - Content container
- Modal - Dialog component
- Navbar - Navigation bar with theme toggle
- Loading - Loading spinner

### Theme
- Dark/Light mode toggle
- Persistent theme preference
- Tailwind CSS styling

## API Integration

All API calls are handled through service functions in the `services/` directory:
- `api.js` - Axios instance with interceptors
- `authService.js` - Authentication endpoints
- `doctorService.js` - Doctor-related endpoints
- `appointmentService.js` - Appointment endpoints
- `paymentService.js` - Payment endpoints
- `patientService.js` - Patient endpoints
- `messageService.js` - Chat endpoints
- `notificationService.js` - Notification endpoints
- `prescriptionService.js` - Prescription endpoints

## Real-time Features

Socket.io integration for:
- Real-time chat between patients and doctors
- Video call notifications
- Live appointment updates

## State Management

- React Context for global state (Auth, Theme)
- Local component state for UI state
- TanStack Query for server state (planned)

## Styling

- Tailwind CSS for utility-first styling
- Custom color scheme (primary, secondary)
- Responsive design
- Dark mode support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

The frontend is designed to work with the Doctor Hub backend API. Make sure the backend is running before starting the frontend.

Backend URL: `http://localhost:5000`
Frontend URL: `http://localhost:5173`
