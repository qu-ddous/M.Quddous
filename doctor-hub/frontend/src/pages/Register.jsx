import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    fullName: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await register({
        email: formData.email,
        password: formData.password,
        role: formData.role,
        fullName: formData.fullName,
        phone: formData.phone,
      });
      // Doctor pending approval - redirect to login with message
      if (response?.pendingApproval) {
        navigate('/login', { 
          state: { message: '✅ Registration successful! Your doctor account is pending admin approval. You can login once verified.' }
        });
      } else {
        const userRole = formData.role.toLowerCase();
        navigate(`/${userRole}/dashboard`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-gradient-primary opacity-20"></div>
        
        <div className="w-full max-w-2xl relative z-10">
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="icon-3d-doctor mb-4">
                <svg viewBox="0 0 200 200" className="w-20 h-20 mx-auto">
                  <defs>
                    <linearGradient id="doctorGradientRegister" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity: 0.9}}/>
                      <stop offset="100%" style={{stopColor: '#e0e0e0', stopOpacity: 0.7}}/>
                    </linearGradient>
                    <filter id="shadow3dRegister">
                      <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  <g filter="url(#shadow3dRegister)">
                    <circle cx="100" cy="70" r="35" fill="url(#doctorGradientRegister)"/>
                    <path d="M65 70 Q65 120 100 140 Q135 120 135 70" fill="url(#doctorGradientRegister)"/>
                    <rect x="85" y="130" width="30" height="50" rx="5" fill="url(#doctorGradientRegister)"/>
                    <rect x="60" y="140" width="25" height="40" rx="5" fill="url(#doctorGradientRegister)"/>
                    <rect x="115" y="140" width="25" height="40" rx="5" fill="url(#doctorGradientRegister)"/>
                    <rect x="70" y="180" width="20" height="15" rx="3" fill="#4a90d9"/>
                    <rect x="110" y="180" width="20" height="15" rx="3" fill="#4a90d9"/>
                    <circle cx="90" cy="65" r="4" fill="#333"/>
                    <circle cx="110" cy="65" r="4" fill="#333"/>
                    <path d="M95 80 Q100 85 105 80" stroke="#333" strokeWidth="2" fill="none"/>
                    <path d="M70 50 Q100 30 130 50" stroke="#4a90d9" strokeWidth="4" fill="none"/>
                    <rect x="80" y="45" width="40" height="8" rx="2" fill="#4a90d9"/>
                  </g>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Select Your Role</h1>
              <p className="text-gray-200 mt-2">Choose how you want to use Doctor Hub</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => handleRoleSelect('PATIENT')}
                className="p-6 rounded-2xl hover:scale-105 transition-all duration-300 border border-white/20 hover:border-purple-400/50 bg-white/10 hover:bg-white/20"
              >
                <div className="icon-3d mb-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 mx-auto text-white">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Patient</h3>
                <p className="text-sm text-gray-200 mt-1">Book appointments and manage your health</p>
              </button>
              <button
                onClick={() => handleRoleSelect('DOCTOR')}
                className="p-6 rounded-2xl hover:scale-105 transition-all duration-300 border border-white/20 hover:border-purple-400/50 bg-white/10 hover:bg-white/20"
              >
                <div className="icon-3d mb-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 mx-auto text-white">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Doctor</h3>
                <p className="text-sm text-gray-200 mt-1">Register to join our platform (pending admin approval)</p>
              </button>
            </div>
            <div className="text-center mt-6">
              <p className="text-gray-200">
                Already have an account?{' '}
                <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 bg-gradient-primary opacity-20"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="icon-3d-doctor mb-4">
              <svg viewBox="0 0 200 200" className="w-20 h-20 mx-auto">
                <defs>
                  <linearGradient id="doctorGradientRegister2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity: 0.9}}/>
                    <stop offset="100%" style={{stopColor: '#e0e0e0', stopOpacity: 0.7}}/>
                  </linearGradient>
                  <filter id="shadow3dRegister2">
                    <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3"/>
                  </filter>
                </defs>
                <g filter="url(#shadow3dRegister2)">
                  <circle cx="100" cy="70" r="35" fill="url(#doctorGradientRegister2)"/>
                  <path d="M65 70 Q65 120 100 140 Q135 120 135 70" fill="url(#doctorGradientRegister2)"/>
                  <rect x="85" y="130" width="30" height="50" rx="5" fill="url(#doctorGradientRegister2)"/>
                  <rect x="60" y="140" width="25" height="40" rx="5" fill="url(#doctorGradientRegister2)"/>
                  <rect x="115" y="140" width="25" height="40" rx="5" fill="url(#doctorGradientRegister2)"/>
                  <rect x="70" y="180" width="20" height="15" rx="3" fill="#4a90d9"/>
                  <rect x="110" y="180" width="20" height="15" rx="3" fill="#4a90d9"/>
                  <circle cx="90" cy="65" r="4" fill="#333"/>
                  <circle cx="110" cy="65" r="4" fill="#333"/>
                  <path d="M95 80 Q100 85 105 80" stroke="#333" strokeWidth="2" fill="none"/>
                  <path d="M70 50 Q100 30 130 50" stroke="#4a90d9" strokeWidth="4" fill="none"/>
                  <rect x="80" y="45" width="40" height="8" rx="2" fill="#4a90d9"/>
                </g>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">
              Register as {formData.role}
            </h1>
            <p className="text-gray-200 mt-2">Create your account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 icon-3d">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-400">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Email</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 icon-3d">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-400">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 icon-3d">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-400">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 icon-3d">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-400">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 icon-3d">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-400">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-white text-purple-600 hover:bg-gray-100" isLoading={loading}>
              Create Account
            </Button>
          </form>
          <div className="text-center mt-6">
            <button
              onClick={() => setStep(1)}
              className="text-sm text-gray-200 hover:text-purple-400"
            >
              ← Back to role selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
