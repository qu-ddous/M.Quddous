import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { Card, CardContent } from '../components/Card';

const Landing = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const Icon3D = ({ children, className = "" }) => (
    <div className={`icon-3d ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header/Navbar */}
      <nav className="bg-gradient-to-r from-purple-900 to-blue-900 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="icon-3d text-3xl">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-white">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-white">Doctor Hub</span>
            </div>
            <div className="hidden md:flex space-x-6">
              <button onClick={() => scrollToSection('hero')} className="text-sm text-gray-300 hover:text-white transition-colors">Home</button>
              <button onClick={() => scrollToSection('about')} className="text-sm text-gray-300 hover:text-white transition-colors">About</button>
              <button onClick={() => scrollToSection('services')} className="text-sm text-gray-300 hover:text-white transition-colors">Services</button>
              <button onClick={() => scrollToSection('features')} className="text-sm text-gray-300 hover:text-white transition-colors">Features</button>
              <button onClick={() => scrollToSection('contact')} className="text-sm text-gray-300 hover:text-white transition-colors">Contact</button>
            </div>
            <Link to="/register">
              <Button size="sm" variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="py-16 relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Find the Right Doctor for Your Better Health
              </h1>
              <p className="text-base text-gray-200">
                Your trusted healthcare platform connecting patients with qualified doctors
              </p>
              
              {/* Search Bar */}
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 icon-3d">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-gray-400">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search for disease or specialist..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <Button size="md" variant="primary">Search</Button>
              </div>

              <div className="flex space-x-3">
                <Link to="/register">
                  <Button size="md" variant="primary">Get Started</Button>
                </Link>
                <Link to="/login">
                  <Button size="md" variant="glass">Login</Button>
                </Link>
              </div>
            </div>
            
            {/* Hero Right - Premium Medical Dashboard Visual */}
            <div className="hidden md:block relative">
              {/* Main Card */}
              <div className="hero-dashboard-card relative rounded-3xl p-6 shadow-2xl overflow-hidden">
                {/* Background gradient orbs */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl pointer-events-none"></div>

                {/* Doctor Profile Header */}
                <div className="relative flex items-center gap-4 mb-5">
                  <div className="hero-avatar-ring">
                    <div className="hero-avatar">
                      <svg viewBox="0 0 80 80" className="w-full h-full">
                        <defs>
                          <linearGradient id="avatarBg" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a78bfa"/>
                            <stop offset="100%" stopColor="#3b82f6"/>
                          </linearGradient>
                          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fde8d0"/>
                            <stop offset="100%" stopColor="#f5c9a0"/>
                          </linearGradient>
                        </defs>
                        {/* Background circle */}
                        <circle cx="40" cy="40" r="40" fill="url(#avatarBg)"/>
                        {/* White coat body */}
                        <rect x="15" y="52" width="50" height="35" rx="8" fill="white" opacity="0.95"/>
                        {/* Collar */}
                        <polygon points="40,52 32,68 40,65 48,68" fill="#e8eaf6"/>
                        {/* Stethoscope */}
                        <path d="M26 58 Q20 65 24 72 Q28 78 34 76" stroke="#4a90d9" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                        <circle cx="24" cy="72" r="3" fill="#4a90d9"/>
                        <circle cx="34" cy="76" r="2.5" fill="#3b82f6"/>
                        {/* Head */}
                        <circle cx="40" cy="34" r="14" fill="url(#skinGrad)"/>
                        {/* Hair */}
                        <path d="M27 30 Q27 18 40 18 Q53 18 53 30 Q53 22 40 20 Q27 20 27 30" fill="#4a3728"/>
                        {/* Eyes */}
                        <ellipse cx="35" cy="33" rx="2" ry="2.5" fill="#2d1b0e"/>
                        <ellipse cx="45" cy="33" rx="2" ry="2.5" fill="#2d1b0e"/>
                        {/* Eye highlights */}
                        <circle cx="36" cy="32" r="0.8" fill="white"/>
                        <circle cx="46" cy="32" r="0.8" fill="white"/>
                        {/* Smile */}
                        <path d="M36 39 Q40 43 44 39" stroke="#c0725a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                        {/* Headband/Cap line */}
                        <path d="M27 28 Q40 22 53 28" stroke="#7c3aed" strokeWidth="2" fill="none"/>
                        {/* Red cross on coat */}
                        <rect x="38" y="56" width="4" height="10" rx="1" fill="#ef4444"/>
                        <rect x="35" y="59" width="10" height="4" rx="1" fill="#ef4444"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <div className="text-white font-bold text-base">Dr. Sarah Mitchell</div>
                    <div className="text-purple-300 text-xs">Senior Cardiologist</div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="hero-status-dot"></span>
                      <span className="text-green-400 text-xs">Available Now</span>
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="flex items-center gap-1 justify-end">
                      {[1,2,3,4,5].map(i => (
                        <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-yellow-400">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      ))}
                    </div>
                    <div className="text-gray-300 text-xs mt-1">4.9 (2.1k reviews)</div>
                  </div>
                </div>

                {/* Heartbeat Pulse */}
                <div className="hero-pulse-bar mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-red-400">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <span className="text-xs text-gray-300">Live Heart Rate</span>
                    <span className="ml-auto text-red-400 font-bold text-sm">72 BPM</span>
                  </div>
                  <div className="hero-ecg-container">
                    <svg viewBox="0 0 300 50" className="w-full h-10" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1"/>
                          <stop offset="50%" stopColor="#ef4444" stopOpacity="1"/>
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1"/>
                        </linearGradient>
                      </defs>
                      <polyline
                        points="0,25 30,25 40,25 50,10 55,40 60,5 65,45 70,25 100,25 130,25 140,25 150,10 155,40 160,5 165,45 170,25 200,25 230,25 240,25 250,10 255,40 260,5 265,45 270,25 300,25"
                        fill="none"
                        stroke="url(#ecgGrad)"
                        strokeWidth="2"
                        className="hero-ecg-line"
                      />
                    </svg>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="hero-stat-card">
                    <div className="hero-stat-icon bg-purple-500/20">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-purple-400">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    <div className="text-white font-bold text-lg leading-none">128</div>
                    <div className="text-gray-400 text-xs">Patients</div>
                  </div>
                  <div className="hero-stat-card">
                    <div className="hero-stat-icon bg-blue-500/20">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-blue-400">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </div>
                    <div className="text-white font-bold text-lg leading-none">14</div>
                    <div className="text-gray-400 text-xs">Today</div>
                  </div>
                  <div className="hero-stat-card">
                    <div className="hero-stat-icon bg-green-500/20">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-green-400">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <div className="text-white font-bold text-lg leading-none">98%</div>
                    <div className="text-gray-400 text-xs">Rating</div>
                  </div>
                </div>

                {/* Next Appointment */}
                <div className="hero-appointment-card mt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">J</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-xs font-semibold">John Martinez</div>
                      <div className="text-gray-400 text-xs">Routine Checkup</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-cyan-400 text-xs font-bold">2:30 PM</div>
                      <div className="text-gray-500 text-xs">Today</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge - top right */}
              <div className="hero-float-badge-1 absolute -top-3 -right-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                🟢 Online Now
              </div>
              {/* Floating badge - bottom left */}
              <div className="hero-float-badge-2 absolute -bottom-3 -left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                ⚡ Instant Booking
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-indigo-900 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-center shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="icon-3d text-4xl mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10 mx-auto text-white">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">10K+</div>
              <div className="text-sm text-white">Patients</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4 text-center shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="icon-3d text-4xl mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10 mx-auto text-white">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-sm text-white">Doctors</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-xl p-4 text-center shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="icon-3d text-4xl mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10 mx-auto text-white">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">50K+</div>
              <div className="text-sm text-white">Appointments</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-center shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="icon-3d text-4xl mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10 mx-auto text-white">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">98%</div>
              <div className="text-sm text-white">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 bg-gradient-to-br from-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">About Doctor Hub</h2>
              <p className="text-gray-200 mb-4">
                Doctor Hub is a comprehensive healthcare platform designed to connect patients with qualified doctors. Our mission is to make healthcare accessible, convenient, and reliable for everyone.
              </p>
              <p className="text-gray-200 mb-6">
                With our user-friendly interface, you can easily search for doctors, book appointments, access medical records, and communicate with healthcare professionals from the comfort of your home.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="icon-3d">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-green-400">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-200">Verified Doctors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="icon-3d">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-green-400">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-200">Secure Platform</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="icon-3d">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-green-400">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-200">24/7 Support</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 shadow-2xl animate-float">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="icon-3d text-4xl mb-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 mx-auto text-red-500">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                  <div className="text-lg font-bold text-white">Care</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="icon-3d text-4xl mb-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10 mx-auto text-blue-500">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div className="text-lg font-bold text-white">Trust</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="icon-3d text-4xl mb-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-10 h-10 mx-auto text-yellow-500">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div className="text-lg font-bold text-white">Speed</div>
                </div>
                <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                  <div className="icon-3d text-4xl mb-2">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 mx-auto text-yellow-400">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </div>
                  <div className="text-lg font-bold text-white">Quality</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-12 bg-gradient-to-br from-indigo-900 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-white mb-8">
            Our Services
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-center shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="icon-3d text-5xl mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-14 h-14 mx-auto text-white">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                Online Consultations
              </h3>
              <p className="text-sm text-white">
                Connect with doctors online through video calls or chat
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-center shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="icon-3d text-5xl mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-14 h-14 mx-auto text-white">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                Appointment Booking
              </h3>
              <p className="text-sm text-white">
                Easy and quick appointment scheduling with your preferred doctors
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-xl p-6 text-center shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="icon-3d text-5xl mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-14 h-14 mx-auto text-white">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                Doctor Profiles
              </h3>
              <p className="text-sm text-white">
                Detailed profiles with qualifications, reviews, and availability
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 bg-gradient-to-br from-purple-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-white mb-8">
            Why Choose Doctor Hub?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-center shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="icon-3d text-5xl mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-14 h-14 mx-auto text-white">
                  <path d="M22 10v6M2 10l10-5 10 5-10-5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                Qualified Doctors
              </h3>
              <p className="text-sm text-white">
                Access to verified and experienced healthcare professionals
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-center shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="icon-3d text-5xl mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-14 h-14 mx-auto text-white">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                24/7 Availability
              </h3>
              <p className="text-sm text-white">
                Book appointments anytime, anywhere with our easy-to-use platform
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-6 text-center shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="icon-3d text-5xl mb-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-14 h-14 mx-auto text-white">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                Secure & Private
              </h3>
              <p className="text-sm text-white">
                Your health data is protected with enterprise-grade security
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-gradient-to-br from-blue-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-white mb-8">
            What Our Patients Say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="flex items-center mb-4">
                <div className="icon-3d flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-400">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-sm text-white mb-4">
                "Doctor Hub made it so easy to find a specialist. The booking process was seamless and the doctor was excellent."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold text-lg">
                  S
                </div>
                <div className="ml-3">
                  <div className="text-sm font-semibold text-white">Sarah Johnson</div>
                  <div className="text-xs text-gray-200">Patient</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="flex items-center mb-4">
                <div className="icon-3d flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-400">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-sm text-white mb-4">
                "The online consultation feature is amazing. I got medical advice without leaving my home. Highly recommended!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                  M
                </div>
                <div className="ml-3">
                  <div className="text-sm font-semibold text-white">Michael Chen</div>
                  <div className="text-xs text-gray-200">Patient</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-xl p-6 shadow-lg hover:scale-105 transition-transform duration-300">
              <div className="flex items-center mb-4">
                <div className="icon-3d flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-400">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-sm text-white mb-4">
                "As a doctor, this platform has helped me reach more patients. The interface is intuitive and the support is great."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 font-bold text-lg">
                  D
                </div>
                <div className="ml-3">
                  <div className="text-sm font-semibold text-white">Dr. David Smith</div>
                  <div className="text-xs text-gray-200">Doctor</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-br from-purple-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-8 text-center shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-3">Ready to Get Started?</h2>
            <p className="text-base text-white mb-6">
              Join thousands of patients who trust Doctor Hub for their healthcare needs
            </p>
            <Link to="/register">
              <Button size="md" variant="secondary">Create Your Account</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gradient-to-r from-indigo-900 to-purple-900 border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="icon-3d text-3xl">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-white">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <span className="text-lg font-bold text-white">Doctor Hub</span>
              </div>
              <p className="text-sm text-gray-200 mb-4">
                Your trusted healthcare platform connecting patients with qualified doctors.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-200 hover:text-white transition-colors">Facebook</a>
                <a href="#" className="text-gray-200 hover:text-white transition-colors">Twitter</a>
                <a href="#" className="text-gray-200 hover:text-white transition-colors">LinkedIn</a>
                <a href="#" className="text-gray-200 hover:text-white transition-colors">Instagram</a>
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('hero')} className="text-sm text-gray-200 hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => scrollToSection('about')} className="text-sm text-gray-200 hover:text-white transition-colors">About Us</button></li>
                <li><button onClick={() => scrollToSection('services')} className="text-sm text-gray-200 hover:text-white transition-colors">Services</button></li>
                <li><button onClick={() => scrollToSection('features')} className="text-sm text-gray-200 hover:text-white transition-colors">Features</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white mb-4">Services</h3>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('services')} className="text-sm text-gray-200 hover:text-white transition-colors">Online Consultation</button></li>
                <li><button onClick={() => scrollToSection('services')} className="text-sm text-gray-200 hover:text-white transition-colors">Appointment Booking</button></li>
                <li><button onClick={() => scrollToSection('services')} className="text-sm text-gray-200 hover:text-white transition-colors">Medical Records</button></li>
                <li><button onClick={() => scrollToSection('services')} className="text-sm text-gray-200 hover:text-white transition-colors">Prescriptions</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-200">
                  <div className="icon-3d mr-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-white">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  support@doctorhub.com
                </li>
                <li className="flex items-center text-sm text-gray-200">
                  <div className="icon-3d mr-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-white">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  +1 (555) 123-4567
                </li>
                <li className="flex items-center text-sm text-gray-200">
                  <div className="icon-3d mr-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-white">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  123 Healthcare Ave, Medical City
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-200">
              © 2024 Doctor Hub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
