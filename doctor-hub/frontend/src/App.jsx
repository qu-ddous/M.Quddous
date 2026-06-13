import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import PropTypes from 'prop-types';
import Loading from './components/Loading';

// Lazy-load pages — code-split for faster initial load
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'));
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard'));
const AssistantDashboard = lazy(() => import('./pages/AssistantDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ChatRoom = lazy(() => import('./pages/ChatRoom'));
const ManualPayment = lazy(() => import('./pages/ManualPayment'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,       // 5 min cache
      gcTime: 10 * 60 * 1000,          // 10 min garbage collect
    },
    mutations: {
      retry: 0,
    },
  },
});

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role.toLowerCase();

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={`/${userRole}/dashboard`} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e1b4b',
            color: '#e2e8f0',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Patient routes */}
                <Route path="/patient/dashboard"        element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
                <Route path="/patient/doctor/:doctorId"  element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
                <Route path="/patient/find-doctors"     element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
                <Route path="/patient/appointments"     element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
                <Route path="/patient/medical-history"  element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
                <Route path="/patient/prescriptions"    element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
                <Route path="/patient/payments"         element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
                <Route path="/patient/payments/manual"  element={<ProtectedRoute allowedRoles={['patient']}><ManualPayment /></ProtectedRoute>} />
                <Route path="/patient/chat"             element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
                <Route path="/patient/chat/:doctorId"   element={<ProtectedRoute allowedRoles={['patient']}><ChatRoom /></ProtectedRoute>} />
                <Route path="/patient/reports"          element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
                <Route path="/patient/profile"          element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
                <Route path="/patient/settings"         element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />

                {/* Doctor routes */}
                <Route path="/doctor/dashboard"     element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
                <Route path="/doctor/schedule"      element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
                <Route path="/doctor/appointments"  element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
                <Route path="/doctor/patients"      element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
                <Route path="/doctor/prescriptions" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
                <Route path="/doctor/profile"       element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />

                {/* Assistant routes */}
                <Route path="/assistant/dashboard"  element={<ProtectedRoute allowedRoles={['assistant']}><AssistantDashboard /></ProtectedRoute>} />
                <Route path="/assistant/payments"   element={<ProtectedRoute allowedRoles={['assistant']}><AssistantDashboard /></ProtectedRoute>} />
                <Route path="/assistant/bookings"   element={<ProtectedRoute allowedRoles={['assistant']}><AssistantDashboard /></ProtectedRoute>} />
                <Route path="/assistant/patients"   element={<ProtectedRoute allowedRoles={['assistant']}><AssistantDashboard /></ProtectedRoute>} />
                <Route path="/assistant/profile"    element={<ProtectedRoute allowedRoles={['assistant']}><AssistantDashboard /></ProtectedRoute>} />

                {/* Admin routes */}
                <Route path="/admin/dashboard"    element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/doctors"      element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users"        element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/payments"     element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/settings"     element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
