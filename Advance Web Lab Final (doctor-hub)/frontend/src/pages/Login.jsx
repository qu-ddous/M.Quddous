import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message || '';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      const userRole = JSON.parse(localStorage.getItem('user')).role.toLowerCase();
      navigate(`/${userRole}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 bg-gradient-primary opacity-20"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="icon-3d-doctor mb-4">
              <svg viewBox="0 0 200 200" className="w-20 h-20 mx-auto">
                <defs>
                  <linearGradient id="doctorGradientLogin" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity: 0.9}}/>
                    <stop offset="100%" style={{stopColor: '#e0e0e0', stopOpacity: 0.7}}/>
                  </linearGradient>
                  <filter id="shadow3dLogin">
                    <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3"/>
                  </filter>
                </defs>
                <g filter="url(#shadow3dLogin)">
                  <circle cx="100" cy="70" r="35" fill="url(#doctorGradientLogin)"/>
                  <path d="M65 70 Q65 120 100 140 Q135 120 135 70" fill="url(#doctorGradientLogin)"/>
                  <rect x="85" y="130" width="30" height="50" rx="5" fill="url(#doctorGradientLogin)"/>
                  <rect x="60" y="140" width="25" height="40" rx="5" fill="url(#doctorGradientLogin)"/>
                  <rect x="115" y="140" width="25" height="40" rx="5" fill="url(#doctorGradientLogin)"/>
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
            <h1 className="text-2xl font-bold text-white">Welcome Back!</h1>
            <p className="text-gray-200 mt-2">Sign in to your account</p>
          </div>

          {successMessage && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2 accent-purple-500" />
                <span className="text-sm text-gray-200">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-purple-300 hover:text-purple-200">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full bg-white text-purple-600 hover:bg-gray-100" isLoading={loading}>
              Sign In
            </Button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="px-4 text-sm text-gray-200">or continue with</span>
            <div className="flex-1 border-t border-white/20"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors">
              <div className="icon-3d">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <span className="text-white">Google</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-colors">
              <div className="icon-3d">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </div>
              <span className="text-white">Apple</span>
            </button>
          </div>
          <div className="text-center mt-6">
            <p className="text-gray-200">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
