import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import { appointmentService } from '../services/appointmentService';
import { patientService } from '../services/patientService';
import { doctorService } from '../services/doctorService';

const PatientDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState({});

  // Dropdown states
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Modal states
  const [showBookAppointmentModal, setShowBookAppointmentModal] = useState(false);
  const [showUploadReportModal, setShowUploadReportModal] = useState(false);
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Form states
  const [appointmentForm, setAppointmentForm] = useState({
    doctorId: '',
    date: '',
    timeSlot: '',
    reason: '',
    paymentMethod: '',
    paymentProof: null,
  });

  const [reportForm, setReportForm] = useState({
    title: '',
    type: '',
    reportFile: null
  });

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    bloodGroup: '',
    allergies: '',
    address: ''
  });

  // Search/filter state — Find Doctors
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorSpecFilter, setDoctorSpecFilter] = useState('');
  const [doctorSortBy, setDoctorSortBy] = useState('');

  // Search/filter state — Appointments
  const [aptSearch, setAptSearch] = useState('');
  const [aptStatusFilter, setAptStatusFilter] = useState('');
  const [aptDateFilter, setAptDateFilter] = useState('');

  // Reschedule modal state
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleApt, setRescheduleApt] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', timeSlot: '' });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // React Query — cached data fetching
  const { data: appointments = [], isLoading: aptsLoading } = useQuery({
    queryKey: ['patient-appointments'],
    queryFn: appointmentService.getAppointments,
  });

  const { data: doctors = [], isLoading: docsLoading } = useQuery({
    queryKey: ['patient-doctors'],
    queryFn: doctorService.getAllDoctors,
  });

  const { data: medicalReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['patient-reports'],
    queryFn: patientService.getMedicalReports,
  });

  const loading = aptsLoading || docsLoading || reportsLoading;

  const startAction = (key) => setActionLoading(prev => ({ ...prev, [key]: true }));
  const stopAction = (key) => setActionLoading(prev => ({ ...prev, [key]: false }));

  // Pre-fill profile form from user data
  useEffect(() => {
    if (user?.patient) {
      setProfileForm({
        fullName: user.patient.fullName || '',
        phone: user.patient.phone || '',
        dateOfBirth: user.patient.dateOfBirth ? user.patient.dateOfBirth.split('T')[0] : '',
        bloodType: user.patient.bloodType || '',
        allergies: user.patient.allergies || '',
        address: user.patient.address || '',
      });
    }
  }, [user]);

  // Appointment handlers
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (actionLoading.book) return;

    // Validate payment fields
    if (!appointmentForm.paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    if (!appointmentForm.paymentProof) {
      toast.error('Please upload payment screenshot');
      return;
    }

    startAction('book');
    try {
      // Build FormData — sends appointment + payment proof in one request
      const formData = new FormData();
      formData.append('doctorId', appointmentForm.doctorId);
      formData.append('date', appointmentForm.date);
      formData.append('timeSlot', appointmentForm.timeSlot);
      formData.append('reason', appointmentForm.reason);
      formData.append('amount', selectedDoctor?.fee || 0);
      formData.append('method', appointmentForm.paymentMethod);
      formData.append('screenshot', appointmentForm.paymentProof);

      await appointmentService.createAppointmentWithPayment(formData);
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
      setShowBookAppointmentModal(false);
      setAppointmentForm({ doctorId: '', date: '', timeSlot: '', reason: '', paymentMethod: '', paymentProof: null });
      toast.success('Appointment booked! Payment proof submitted for verification 📅');
    } catch (error) {
      console.error('Failed to book appointment:', error);
      toast.error(error?.response?.data?.error || 'Failed to book appointment');
    } finally {
      stopAction('book');
    }
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();
    if (actionLoading.upload) return;
    startAction('upload');
    try {
      const formData = new FormData();
      formData.append('title', reportForm.title);
      formData.append('type', reportForm.type);
      if (reportForm.reportFile) formData.append('reportFile', reportForm.reportFile);
      const response = await patientService.uploadMedicalReport(formData);
      if (response) {
        setMedicalReports(prev => [response, ...prev]);
        setShowUploadReportModal(false);
        setReportForm({ title: '', type: '', reportFile: null });
      }
    } catch (error) {
      console.error('Failed to upload medical report:', error);
      alert('Failed to submit medical record');
    } finally {
      stopAction('upload');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    const key = `cancel_${appointmentId}`;
    if (actionLoading[key]) return;
    startAction(key);
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, 'CANCELLED');
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
      toast.success('Appointment cancelled');
    } catch {
      toast.error('Failed to cancel appointment');
    } finally {
      stopAction(key);
    }
  };

  const openRescheduleModal = (apt) => {
    setRescheduleApt(apt);
    setRescheduleForm({
      date: apt.date ? apt.date.split('T')[0] : '',
      timeSlot: apt.timeSlot || '',
    });
    setShowRescheduleModal(true);
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (actionLoading.reschedule) return;
    startAction('reschedule');
    try {
      await appointmentService.updateAppointment(rescheduleApt.id, {
        patientId: rescheduleApt.patientId,
        doctorId: rescheduleApt.doctorId,
        date: rescheduleForm.date,
        timeSlot: rescheduleForm.timeSlot,
        reason: rescheduleApt.reason,
        status: rescheduleApt.status,
      });
      queryClient.invalidateQueries({ queryKey: ['patient-appointments'] });
      setShowRescheduleModal(false);
      setRescheduleApt(null);
      toast.success('Appointment rescheduled ✅');
    } catch {
      toast.error('Failed to reschedule appointment');
    } finally {
      stopAction('reschedule');
    }
  };

  // Profile handlers
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (actionLoading.profile) return;
    startAction('profile');
    try {
      await patientService.updatePatientProfile({
        fullName: profileForm.fullName,
        phone: profileForm.phone,
        dateOfBirth: profileForm.dateOfBirth || null,
        bloodType: profileForm.bloodType,   // fixed: was bloodGroup
        allergies: profileForm.allergies,
        address: profileForm.address,
      });
      queryClient.invalidateQueries({ queryKey: ['patient-reports'] });
      toast.success('Profile updated ✨');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      stopAction('profile');
    }
  };

  const openBookAppointmentModal = (doctor) => {
    setSelectedDoctor(doctor);
    setAppointmentForm({ doctorId: doctor.id, date: '', timeSlot: '', reason: '', paymentMethod: '', paymentProof: null });
    setShowBookAppointmentModal(true);
  };

  const handleToggleEmailNotifications = () => setSettings(s => ({ ...s, emailNotifications: !s.emailNotifications }));
  const handleToggleSmsNotifications = () => setSettings(s => ({ ...s, smsNotifications: !s.smsNotifications }));

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (actionLoading.password) return;
    startAction('password');
    try {
      // Use Supabase client directly to update password
      const { supabase } = await import('../lib/supabase');
      const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
      if (error) throw error;
      toast.success('Password changed 🔒');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err?.message || 'Failed to change password');
    } finally {
      stopAction('password');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;
  }

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === 'CONFIRMED' && new Date(apt.date) >= new Date()
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCurrentPage = () => {
    const path = location.pathname;
    if (doctorId) return 'Doctor Detail';
    if (path === '/patient/find-doctors') return 'Find Doctors';
    if (path === '/patient/appointments') return 'Appointments';
    if (path === '/patient/medical-history') return 'Medical History';
    if (path === '/patient/prescriptions') return 'Prescriptions';
    if (path === '/patient/payments') return 'Payments';
    if (path === '/patient/chat') return 'Chat';
    if (path === '/patient/reports') return 'Reports';
    if (path === '/patient/profile') return 'Profile';
    if (path === '/patient/settings') return 'Settings';
    return 'Dashboard';
  };

  const getAppointmentStatusClass = (status) => {
    if (status === 'CONFIRMED') return 'bg-green-500/30 text-green-300';
    if (status === 'PENDING') return 'bg-yellow-500/30 text-yellow-300';
    if (status === 'CANCELLED') return 'bg-red-500/30 text-red-300';
    return 'bg-blue-500/30 text-blue-300';
  };

  const getPaymentStatusClass = (status) => {
    if (status === 'PAID') return 'bg-green-500/30 text-green-300';
    if (status === 'PENDING') return 'bg-yellow-500/30 text-yellow-300';
    return 'bg-red-500/30 text-red-300';
  };

  const renderContent = () => { // NOSONAR
    const currentPage = getCurrentPage();

    if (currentPage === 'Doctor Detail') {
      const doctor = doctors.find(d => d.id === doctorId);
      if (!doctor) {
        return (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-white mb-4">Doctor Profile Not Found</h3>
            <Button onClick={() => navigate('/patient/find-doctors')} variant="primary">
              Back to Doctors List
            </Button>
          </div>
        );
      }

      return (
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <button 
            onClick={() => navigate('/patient/find-doctors')}
            className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors font-medium bg-white/5 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Find Doctors
          </button>

          {/* Profile Header */}
          <div className="bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-3xl p-8 border border-white/20 backdrop-blur-xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white/20 shadow-2xl">
                {doctor.fullName?.charAt(0) || 'D'}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-extrabold text-white mb-2">{doctor.fullName}</h2>
                    <p className="text-purple-300 text-lg font-medium mb-3">{doctor.specialization}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm text-gray-300">
                      <span className="bg-white/10 px-3 py-1 rounded-full border border-white/10">
                        🎓 {doctor.qualification}
                      </span>
                      <span className="bg-white/10 px-3 py-1 rounded-full border border-white/10">
                        💼 {doctor.experience} Years Experience
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 px-6 py-4 rounded-2xl border border-white/10 text-center md:text-right">
                    <span className="text-xs text-gray-400 block mb-1">Consultation Fee</span>
                    <span className="text-2xl font-bold text-white">Rs. {doctor.fee}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* About & Reviews */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-md">
                <h3 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">About Doctor</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {doctor.about || `Dr. ${doctor.fullName} is a dedicated ${doctor.specialization} committed to providing exceptional care. With over ${doctor.experience} years of experience, Dr. ${doctor.fullName} brings a wealth of knowledge and expertise to the practice, ensuring patients receive the highest standard of treatment.`}
                </p>
              </div>

              <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-md">
                <h3 className="text-xl font-semibold text-white mb-4 border-b border-white/10 pb-2">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📧</span>
                    <div>
                      <span className="text-gray-400 block text-xs">Email Address</span>
                      <span>{doctor.user?.email || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📞</span>
                    <div>
                      <span className="text-gray-400 block text-xs">Phone Number</span>
                      <span>{doctor.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Book Appointment Card */}
            <div>
              <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-3xl p-6 border border-white/20 backdrop-blur-xl sticky top-6">
                <h3 className="text-xl font-bold text-white mb-4">Book Appointment</h3>
                <p className="text-sm text-gray-300 mb-6 font-medium">Select a date and time slot to book your appointment with Dr. {doctor.fullName}.</p>
                <Button 
                  onClick={() => openBookAppointmentModal(doctor)}
                  variant="primary" 
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white animate-pulse"
                >
                  Schedule Visit
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentPage === 'Find Doctors') {
      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Find Doctors</h2>
          
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{doctors.length}</div>
              <div className="text-sm text-gray-200">Total Doctors</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{doctors.filter(d => d.specialization === 'Cardiologist').length}</div>
              <div className="text-sm text-gray-200">Cardiologists</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{doctors.filter(d => d.specialization === 'Dermatologist').length}</div>
              <div className="text-sm text-gray-200">Dermatologists</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{doctors.filter(d => d.specialization === 'General').length}</div>
              <div className="text-sm text-gray-200">General</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                placeholder="Search doctors by name or specialization..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <select
                value={doctorSpecFilter}
                onChange={(e) => setDoctorSpecFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="" className="text-gray-900">All Specializations</option>
                {[...new Set(doctors.map(d => d.specialization))].sort().map(spec => (
                  <option key={spec} value={spec} className="text-gray-900">{spec}</option>
                ))}
              </select>
              <select
                value={doctorSortBy}
                onChange={(e) => setDoctorSortBy(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="" className="text-gray-900">Sort by</option>
                <option value="experience" className="text-gray-900">Experience (High→Low)</option>
                <option value="fee_asc" className="text-gray-900">Fee (Low→High)</option>
                <option value="fee_desc" className="text-gray-900">Fee (High→Low)</option>
              </select>
            </div>
          </div>

          {/* Doctors List */}
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <div className="grid md:grid-cols-3 gap-4">
              {(() => {
                let filtered = doctors.filter(d => {
                  const q = doctorSearch.toLowerCase();
                  const matchSearch = !q || d.fullName?.toLowerCase().includes(q) || d.specialization?.toLowerCase().includes(q);
                  const matchSpec = !doctorSpecFilter || d.specialization === doctorSpecFilter;
                  return matchSearch && matchSpec;
                });
                if (doctorSortBy === 'experience') filtered = [...filtered].sort((a, b) => b.experience - a.experience);
                if (doctorSortBy === 'fee_asc') filtered = [...filtered].sort((a, b) => a.fee - b.fee);
                if (doctorSortBy === 'fee_desc') filtered = [...filtered].sort((a, b) => b.fee - a.fee);
                if (filtered.length === 0) return <div className="col-span-3 text-center text-gray-400 py-8">No doctors found</div>;
                return filtered.map((doctor) => (
                <div 
                  key={doctor.id} 
                  onClick={() => navigate(`/patient/doctor/${doctor.id}`)}
                  className="p-4 bg-white/10 rounded-xl border border-white/20 hover:scale-105 transition-transform cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {doctor.fullName?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <div className="font-medium text-white">{doctor.fullName}</div>
                        <div className="text-sm text-purple-400">{doctor.specialization}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      {doctor.experience} years experience
                    </div>
                    <div className="text-sm text-gray-400 mb-3">
                      {doctor.qualification}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-white">
                        Rs. {doctor.fee}
                      </div>
                      <div className="flex items-center text-yellow-400">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        <span className="ml-1 text-sm font-medium">4.5</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      variant="primary" 
                      onClick={(e) => {
                        e.stopPropagation();
                        openBookAppointmentModal(doctor);
                      }}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                    >
                      Book
                    </Button>
                    <Button 
                      size="sm" 
                      variant="glass" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/patient/doctor/${doctor.id}`);
                      }}
                      className="flex-1 font-semibold"
                    >
                      Profile
                    </Button>
                  </div>
                </div>
              ));
              })()}
            </div>
          </div>
        </div>
      );
    }

    if (currentPage === 'Appointments') {
      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">My Appointments</h2>
          
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{appointments.length}</div>
              <div className="text-sm text-gray-200">Total Appointments</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{upcomingAppointments.length}</div>
              <div className="text-sm text-gray-200">Upcoming</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{appointments.filter(a => a.status === 'COMPLETED').length}</div>
              <div className="text-sm text-gray-200">Completed</div>
            </div>
            <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{appointments.filter(a => a.status === 'CANCELLED').length}</div>
              <div className="text-sm text-gray-200">Cancelled</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={aptSearch}
                onChange={(e) => setAptSearch(e.target.value)}
                placeholder="Search appointments..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <select
                value={aptStatusFilter}
                onChange={(e) => setAptStatusFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="" className="text-gray-900">All Status</option>
                <option value="CONFIRMED" className="text-gray-900">Confirmed</option>
                <option value="PENDING" className="text-gray-900">Pending</option>
                <option value="CANCELLED" className="text-gray-900">Cancelled</option>
                <option value="COMPLETED" className="text-gray-900">Completed</option>
              </select>
              <input
                type="date"
                value={aptDateFilter}
                onChange={(e) => setAptDateFilter(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          {/* Appointments List */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/20">
                    <th className="pb-3 text-gray-300 font-medium">ID</th>
                    <th className="pb-3 text-gray-300 font-medium">Doctor</th>
                    <th className="pb-3 text-gray-300 font-medium">Date & Time</th>
                    <th className="pb-3 text-gray-300 font-medium">Payment</th>
                    <th className="pb-3 text-gray-300 font-medium">Status</th>
                    <th className="pb-3 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filtered = appointments.filter(apt => {
                      const q = aptSearch.toLowerCase();
                      const matchSearch = !q || apt.doctor?.fullName?.toLowerCase().includes(q) || apt.reason?.toLowerCase().includes(q);
                      const matchStatus = !aptStatusFilter || apt.status === aptStatusFilter;
                      const matchDate = !aptDateFilter || new Date(apt.date).toDateString() === new Date(aptDateFilter).toDateString();
                      return matchSearch && matchStatus && matchDate;
                    });
                    if (filtered.length === 0) return (
                      <tr><td colSpan="6" className="py-8 text-center text-gray-300">No appointments found</td></tr>
                    );
                    return filtered.map((apt) => (
                      <tr key={apt.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-4 text-gray-300 text-xs">#{apt.id.slice(0, 8)}</td>
                        <td className="py-4">
                          <div className="text-white text-sm font-medium">Dr. {apt.doctor?.fullName || 'N/A'}</div>
                          <div className="text-xs text-purple-400">{apt.doctor?.specialization || ''}</div>
                          {apt.reason && <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[120px]">{apt.reason}</div>}
                        </td>
                        <td className="py-4">
                          <div className="text-white text-sm font-medium">
                            {new Date(apt.date).toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="text-xs text-blue-300 mt-0.5">🕐 {apt.timeSlot || 'N/A'}</div>
                        </td>
                        <td className="py-4">
                          {apt.payment ? (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              apt.payment.status === 'VERIFIED' ? 'bg-green-500/30 text-green-300' :
                              apt.payment.status === 'REJECTED' ? 'bg-red-500/30 text-red-300' :
                              'bg-yellow-500/30 text-yellow-300'
                            }`}>
                              {apt.payment.status === 'VERIFIED' ? '✓ Paid' :
                               apt.payment.status === 'REJECTED' ? '✗ Rejected' : '⏳ Pending'}
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-gray-500/30 text-gray-400">No payment</span>
                          )}
                        </td>
                        <td className="py-4">
                          <span className={`px-3 py-1 text-xs rounded-full ${getAppointmentStatusClass(apt.status)}`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2 flex-wrap">
                            {/* Cancel — only for PENDING */}
                            {apt.status === 'PENDING' && (
                              <button
                                onClick={() => handleCancelAppointment(apt.id)}
                                disabled={actionLoading[`cancel_${apt.id}`]}
                                title="Cancel appointment"
                                className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading[`cancel_${apt.id}`]
                                  ? <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                }
                              </button>
                            )}
                            {/* Reschedule — only for PENDING */}
                            {apt.status === 'PENDING' && (
                              <button
                                onClick={() => openRescheduleModal(apt)}
                                title="Reschedule appointment"
                                className="p-2 bg-yellow-500/20 hover:bg-yellow-500/40 rounded-lg text-yellow-400 transition-colors"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                                  <path d="M3 3v5h5"/>
                                  <path d="M12 7v5l4 2"/>
                                </svg>
                              </button>
                            )}
                            {/* Cancel for CONFIRMED too */}
                            {apt.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleCancelAppointment(apt.id)}
                                disabled={actionLoading[`cancel_${apt.id}`]}
                                title="Cancel appointment"
                                className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading[`cancel_${apt.id}`]
                                  ? <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                  : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                }
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (currentPage === 'Medical History') {
      const completedAppointments = appointments.filter(a => a.status === 'COMPLETED');
      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Medical History</h2>
          <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            {completedAppointments.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No medical history found</div>
            ) : (
              <div className="space-y-4">
                {completedAppointments.map((apt) => (
                  <div key={apt.id} className="p-4 bg-white/10 rounded-xl border border-white/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-white">Consultation</div>
                      <div className="text-sm text-gray-400">{new Date(apt.date).toLocaleDateString()}</div>
                    </div>
                    <div className="text-sm text-gray-300">Dr. {apt.doctor?.fullName || 'N/A'} - {apt.doctor?.specialization || 'Doctor'}</div>
                    <div className="text-sm text-gray-400 mt-1">Reason: {apt.reason || 'General consultation'}</div>
                    <div className="text-sm text-green-400 mt-2">Completed</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (currentPage === 'Prescriptions') {
      const prescriptions = appointments
        .filter(a => a.prescription && a.status === 'COMPLETED')
        .map(a => a.prescription);
      
      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Prescriptions</h2>
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            {prescriptions.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No prescriptions found</div>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((presc) => (
                  <div key={presc.id} className="p-4 bg-white/10 rounded-xl border border-white/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-white">{presc.medication || 'Medication'}</div>
                      <div className="text-sm text-gray-400">{new Date(presc.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-sm text-gray-300">Dr. {presc.doctor?.fullName || 'N/A'} - {presc.dosage || 'Take as prescribed'}</div>
                    <div className="text-sm text-gray-400 mt-1">Instructions: {presc.instructions || 'Follow doctor\'s advice'}</div>
                    <button className="mt-2 text-sm text-blue-400 hover:text-blue-300">Download PDF</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (currentPage === 'Payments') {
      const payments = appointments
        .filter(a => a.payment)
        .map(a => a.payment);
      
      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Payments</h2>
          <div className="flex items-center justify-between mb-4">
            <div />
            <button onClick={() => navigate('/patient/payments/manual')} className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md">Submit Payment Proof</button>
          </div>
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            {payments.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No payments found</div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-4 bg-white/10 rounded-xl border border-white/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-white">{payment.description || 'Consultation Fee'}</div>
                      <div className="text-sm text-gray-400">{new Date(payment.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-sm text-gray-300">Dr. {payment.doctor?.fullName || 'N/A'} - Rs. {payment.amount}</div>
                    <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${getPaymentStatusClass(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (currentPage === 'Chat') {
      // Only show doctors whose appointment request has been accepted (CONFIRMED or COMPLETED)
      const acceptedDoctorIds = new Set(
        appointments
          .filter(apt => apt.status === 'CONFIRMED' || apt.status === 'COMPLETED')
          .map(apt => apt.doctorId)
      );
      const chatDoctors = doctors.filter((doctor) => acceptedDoctorIds.has(doctor.id));
      
      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Chat with Doctors</h2>
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            {chatDoctors.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No doctors available for chat.</div>
            ) : (
              <div className="space-y-4">
                {chatDoctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() => {
                      if (!user) {
                        // fallback to login if unauthenticated
                        globalThis.location.href = '/login';
                        return;
                      }
                      navigate(`/patient/chat/${doctor.id}`);
                    }}
                    className="w-full text-left p-4 bg-white/10 rounded-xl border border-white/20 flex items-center gap-4 cursor-pointer hover:bg-white/20"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                      {doctor.fullName?.charAt(0) || 'D'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">{doctor.fullName}</div>
                      <div className="text-sm text-gray-400">{doctor.specialization}</div>
                    </div>
                    <div className="text-sm text-green-400">Online</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (currentPage === 'Reports') {
      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Medical Reports</h2>
          <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            {medicalReports.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No medical reports found</div>
            ) : (
              <div className="space-y-4">
                {medicalReports.map((report) => (
                  <div key={report.id} className="p-4 bg-white/10 rounded-xl border border-white/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-white">{report.title || report.type || 'Medical Report'}</div>
                      <div className="text-sm text-gray-400">{new Date(report.uploadedAt || report.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-sm text-gray-300">{report.type || 'Report details'}</div>
                    <a
                      href={report.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm text-blue-400 hover:text-blue-300"
                    >
                      View File
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (currentPage === 'Profile') {
      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">My Profile</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.patient?.fullName?.charAt(0) || 'P'}
                </div>
                <h3 className="text-xl font-semibold text-white">{user?.patient?.fullName || 'Patient Name'}</h3>
                <p className="text-gray-400">Patient</p>
                <div className="mt-4 text-sm text-gray-300">
                  <div>Email: {user?.email || 'patient@example.com'}</div>
                  <div>Phone: {user?.patient?.phone || '+92 300 1234567'}</div>
                  <div>Blood Type: {user?.patient?.bloodType || 'N/A'}</div>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Edit Profile</h3>
              <form onSubmit={handleUpdateProfile} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="patient-full-name" className="text-gray-300 text-sm block mb-2">Full Name</label>
                  <input 
                    id="patient-full-name"
                    type="text" 
                    value={profileForm.fullName || user?.patient?.fullName || ''}
                    onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400" 
                  />
                </div>
                <div>
                  <label htmlFor="patient-email" className="text-gray-300 text-sm block mb-2">Email</label>
                  <input 
                    id="patient-email"
                    type="email" 
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400" 
                  />
                </div>
                <div>
                  <label htmlFor="patient-phone" className="text-gray-300 text-sm block mb-2">Phone</label>
                  <input 
                    id="patient-phone"
                    type="tel" 
                    value={profileForm.phone || user?.patient?.phone || ''}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400" 
                  />
                </div>
                <div>
                  <label htmlFor="patient-blood-type" className="text-gray-300 text-sm block mb-2">Blood Type</label>
                  <select 
                    id="patient-blood-type"
                    value={profileForm.bloodType || user?.patient?.bloodType || ''}
                    onChange={(e) => setProfileForm({...profileForm, bloodType: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="" className="text-gray-900">Select Blood Type</option>
                    <option value="A+" className="text-gray-900">A+</option>
                    <option value="A-" className="text-gray-900">A-</option>
                    <option value="B+" className="text-gray-900">B+</option>
                    <option value="B-" className="text-gray-900">B-</option>
                    <option value="AB+" className="text-gray-900">AB+</option>
                    <option value="AB-" className="text-gray-900">AB-</option>
                    <option value="O+" className="text-gray-900">O+</option>
                    <option value="O-" className="text-gray-900">O-</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <button 
                    type="submit"
                    disabled={actionLoading.profile}
                    className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {actionLoading.profile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    }

    if (currentPage === 'Settings') {
      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
          <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-xl border border-white/20 flex justify-between items-center">
                <div>
                  <div className="font-medium text-white">Email Notifications</div>
                  <div className="text-sm text-gray-400">Receive email updates about appointments</div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleEmailNotifications}
                  aria-pressed={settings.emailNotifications}
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.emailNotifications ? 'bg-green-500' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.emailNotifications ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
              <div className="p-4 bg-white/10 rounded-xl border border-white/20 flex justify-between items-center">
                <div>
                  <div className="font-medium text-white">SMS Notifications</div>
                  <div className="text-sm text-gray-400">Receive SMS reminders for appointments</div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleSmsNotifications}
                  aria-pressed={settings.smsNotifications}
                  className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.smsNotifications ? 'bg-green-500' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.smsNotifications ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
              <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                <div className="font-medium text-white mb-2">Change Password</div>
                <form onSubmit={handleChangePassword}>
                  <input 
                    type="password" 
                    placeholder="Current Password" 
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-2" 
                  />
                  <input 
                    type="password" 
                    placeholder="New Password" 
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-2" 
                  />
                  <input 
                    type="password" 
                    placeholder="Confirm New Password" 
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-2" 
                  />
                  <button 
                    type="submit"
                    disabled={actionLoading.password}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {actionLoading.password ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default Dashboard content
    return (
      <>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            {getGreeting()}, {user?.patient?.fullName || 'Patient'}!
          </h1>
          <p className="text-gray-400 mt-2">Manage your health appointments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
            <div className="icon-3d mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="text-2xl font-bold text-white">
              {upcomingAppointments.length}
            </div>
            <div className="text-sm text-gray-200">Upcoming Appointments</div>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
            <div className="icon-3d mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="text-2xl font-bold text-white">
              {new Set(appointments.map(a => a.doctorId)).size}
            </div>
            <div className="text-sm text-gray-200">Doctors Visited</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
            <div className="icon-3d mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="text-2xl font-bold text-white">
              {appointments.filter(a => a.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-gray-200">Completed Visits</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
            <div className="icon-3d mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="text-2xl font-bold text-white">
              {user?.patient?.bloodType || 'N/A'}
            </div>
            <div className="text-sm text-gray-200">Blood Type</div>
          </div>
        </div>

        {/* Trending Graphs */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <h2 className="text-lg font-semibold text-white mb-3">Appointments Trend</h2>
            <p className="text-gray-400 text-sm">Chart feature coming soon</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <h2 className="text-lg font-semibold text-white mb-3">Health Score Trend</h2>
            <p className="text-gray-400 text-sm">Chart feature coming soon</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button type="button" onClick={() => setShowBookAppointmentModal(true)} className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-6 text-center backdrop-blur-lg border border-white/20 hover:scale-105 transition-transform cursor-pointer">
            <div className="icon-3d mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="font-medium text-white">Book Appointment</div>
          </button>
          <button type="button" onClick={() => setShowUploadReportModal(true)} className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-6 text-center backdrop-blur-lg border border-white/20 hover:scale-105 transition-transform cursor-pointer">
            <div className="icon-3d mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div className="font-medium text-white">Upload Report</div>
          </button>
          <Link to="/patient/chat" className="bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl p-6 text-center backdrop-blur-lg border border-white/20 hover:scale-105 transition-transform cursor-pointer">
            <div className="icon-3d mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className="font-medium text-white">Chat with Doctor</div>
          </Link>
          <Link to="/patient/payments/manual" className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 text-center backdrop-blur-lg border border-white/20 hover:scale-105 transition-transform cursor-pointer">
            <div className="icon-3d mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div className="font-medium text-white">Submit Payment</div>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Upcoming Appointment */}
          <div className="md:col-span-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">
              Upcoming Appointment
            </h2>
            {upcomingAppointments.length === 0 ? (
              <p className="text-gray-300 text-center py-4">
                No upcoming appointments
              </p>
            ) : (
              <div className="p-6 bg-white/10 rounded-xl border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-medium text-white text-lg">
                      {upcomingAppointments[0].doctor?.fullName || 'Doctor Name'}
                    </div>
                    <div className="text-sm text-purple-400">
                      {upcomingAppointments[0].doctor?.specialization || 'Specialization'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">
                      {new Date(upcomingAppointments[0].date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-400">
                      {upcomingAppointments[0].timeSlot}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 text-sm rounded-full bg-green-500/30 text-green-300">
                    {upcomingAppointments[0].status}
                  </span>
                  <Button size="sm" className="bg-purple-500 hover:bg-purple-600">View Details</Button>
                </div>
              </div>
            )}
          </div>

          {/* Health Overview */}
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">
              Health Overview
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20">
                <div className="flex items-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-purple-400 mr-3">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                  <span className="text-white">Blood Type</span>
                </div>
                <span className="font-medium text-white">
                  {user?.patient?.bloodType || 'Not specified'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20">
                <div className="flex items-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-purple-400 mr-3">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span className="text-white">Total Appointments</span>
                </div>
                <span className="font-medium text-white">
                  {appointments.length}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20">
                <div className="flex items-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-purple-400 mr-3">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                  </svg>
                  <span className="text-white">Doctors Visited</span>
                </div>
                <span className="font-medium text-white">
                  {new Set(appointments.map(a => a.doctorId)).size}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Find Doctors Section */}
        <div className="mt-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">
            Find a Doctor
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {doctors.slice(0, 6).map((doctor) => (
              <div key={doctor.id} className="p-4 bg-white/10 rounded-xl border border-white/20 hover:scale-105 transition-transform cursor-pointer">
                <div className="font-medium text-white mb-1">
                  {doctor.fullName}
                </div>
                <div className="text-sm text-purple-400 mb-2">{doctor.specialization}</div>
                <div className="text-sm text-gray-400">
                  {doctor.experience} years experience
                </div>
                <div className="text-sm font-medium text-white mt-2">
                  Rs. {doctor.fee}
                </div>
                <Link to={`/patient/doctor/${doctor.id}`}>
                  <Button size="sm" className="w-full mt-3 bg-purple-500 hover:bg-purple-600 text-white">
                    View Profile
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Bar */}
      <header className="bg-gradient-to-b from-purple-900/50 to-blue-900/50 backdrop-blur-lg border-b border-white/10 px-8 py-3">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Patient Dashboard</h1>
          <div className="flex items-center gap-4">
            {/* Notification Icon with Dropdown */}
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowNotificationDropdown(!showNotificationDropdown);
                }}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-white">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">2</span>
              </button>
              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-white/10">
                    <h3 className="text-white font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/10">
                      <p className="text-white text-sm">Appointment confirmed for tomorrow</p>
                      <p className="text-gray-400 text-xs mt-1">10 minutes ago</p>
                    </div>
                    <div className="p-3 hover:bg-white/10 cursor-pointer">
                      <p className="text-white text-sm">Prescription ready for pickup</p>
                      <p className="text-gray-400 text-xs mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="p-3 border-t border-white/10">
                    <button className="w-full text-purple-400 hover:text-purple-300 text-sm">View All Notifications</button>
                  </div>
                </div>
              )}
            </div>
            {/* Profile Icon with Dropdown */}
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowProfileDropdown(!showProfileDropdown);
                }}
                className="flex items-center gap-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  P
                </div>
                <span className="text-white font-medium text-sm">{user?.patient?.fullName || 'Patient'}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-white">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl z-50">
                  <div className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/10">
                    <Link to="/patient/profile" className="text-white text-sm">Profile</Link>
                  </div>
                  <div className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/10">
                    <Link to="/patient/settings" className="text-white text-sm">Settings</Link>
                  </div>
                  <div className="p-3 hover:bg-white/10 cursor-pointer">
                    <Link to="/login" className="text-red-400 text-sm">Logout</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>


      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="bg-gradient-to-b from-purple-900/50 to-blue-900/50 w-64 min-h-screen p-6 border-r border-white/10 backdrop-blur-lg sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center space-x-2 mb-8">
          <div className="icon-3d">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 text-purple-400">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Doctor Hub</span>
        </div>
        
        <nav className="space-y-2">
          <Link to="/patient/dashboard" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/patient/dashboard' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span>Dashboard</span>
          </Link>
          <Link to="/patient/find-doctors" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/patient/find-doctors' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <span>Find Doctors</span>
          </Link>
          <Link to="/patient/appointments" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/patient/appointments' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <span>Appointments</span>
          </Link>
          <Link to="/patient/medical-history" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/patient/medical-history' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <span>Medical History</span>
          </Link>
          <Link to="/patient/prescriptions" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/patient/prescriptions' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
            </div>
            <span>Prescriptions</span>
          </Link>
          <Link to="/patient/payments" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/patient/payments' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <span>Payments</span>
          </Link>
          <Link to="/patient/chat" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/patient/chat' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span>Chat</span>
          </Link>
          <Link to="/patient/reports" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/patient/reports' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <line x1="10" y1="9" x2="8" y2="9"/>
              </svg>
            </div>
            <span>Reports</span>
          </Link>
          <Link to="/patient/profile" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/patient/profile' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span>Profile</span>
          </Link>
          <Link to="/patient/settings" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/patient/settings' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-4.418 0-8 2-8 5v1h16v-1c0-3-3.582-5-8-5z"/>
              </svg>
            </div>
            <span>Settings</span>
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Link to="/login" className="flex items-center space-x-3 p-3 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors">
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {renderContent()}
      </main>
    </div>

      {/* Book Appointment Modal — includes payment proof (required) */}
      {showBookAppointmentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-blue-900/90 to-cyan-900/90 rounded-2xl p-6 w-full max-w-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-1">Book Appointment</h3>
            <p className="text-sm text-gray-400 mb-4">Payment proof is required to confirm your appointment.</p>
            <form onSubmit={handleBookAppointment} className="space-y-4">

              {/* Doctor (read-only) */}
              <div>
                <label className="text-gray-300 text-sm block mb-2">Doctor</label>
                <input
                  type="text"
                  value={`Dr. ${selectedDoctor?.fullName || ''} — Rs. ${selectedDoctor?.fee || ''}`}
                  disabled
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-gray-400"
                />
              </div>

              {/* Date + Time */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm block mb-2">Date *</label>
                  <input
                    type="date"
                    value={appointmentForm.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setAppointmentForm({...appointmentForm, date: e.target.value})}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-2">Time Slot *</label>
                  <select
                    value={appointmentForm.timeSlot}
                    onChange={(e) => setAppointmentForm({...appointmentForm, timeSlot: e.target.value})}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="" className="text-gray-900">Select Time</option>
                    <option value="09:00 AM - 10:00 AM" className="text-gray-900">09:00 AM - 10:00 AM</option>
                    <option value="10:00 AM - 11:00 AM" className="text-gray-900">10:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 12:00 PM" className="text-gray-900">11:00 AM - 12:00 PM</option>
                    <option value="02:00 PM - 03:00 PM" className="text-gray-900">02:00 PM - 03:00 PM</option>
                    <option value="03:00 PM - 04:00 PM" className="text-gray-900">03:00 PM - 04:00 PM</option>
                    <option value="04:00 PM - 05:00 PM" className="text-gray-900">04:00 PM - 05:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="text-gray-300 text-sm block mb-2">Reason for Visit *</label>
                <textarea
                  value={appointmentForm.reason}
                  onChange={(e) => setAppointmentForm({...appointmentForm, reason: e.target.value})}
                  rows="2"
                  required
                  placeholder="Describe your symptoms or reason..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-white/20 pt-4">
                <h4 className="text-white font-semibold mb-3">💳 Payment Details (Required)</h4>
              </div>

              {/* Payment Method + Amount */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm block mb-2">Payment Method *</label>
                  <select
                    value={appointmentForm.paymentMethod}
                    onChange={(e) => setAppointmentForm({...appointmentForm, paymentMethod: e.target.value})}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="" className="text-gray-900">Select Method</option>
                    <option value="EASYPAISA" className="text-gray-900">Easypaisa</option>
                    <option value="JAZZCASH" className="text-gray-900">JazzCash</option>
                    <option value="BANK_TRANSFER" className="text-gray-900">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-2">Amount (PKR)</label>
                  <input
                    type="number"
                    value={selectedDoctor?.fee || ''}
                    disabled
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-gray-400"
                  />
                </div>
              </div>

              {/* Payment Proof Screenshot */}
              <div>
                <label className="text-gray-300 text-sm block mb-2">Payment Screenshot *</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setAppointmentForm({...appointmentForm, paymentProof: e.target.files[0]})}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white file:text-sm hover:file:bg-purple-600 cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-1">Upload screenshot of your payment (Easypaisa/JazzCash/Bank)</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookAppointmentModal(false);
                    setAppointmentForm({ doctorId: '', date: '', timeSlot: '', reason: '', paymentMethod: '', paymentProof: null });
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading.book}
                  className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {actionLoading.book && (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  )}
                  {actionLoading.book ? 'Booking...' : 'Book & Pay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Appointment Modal */}
      {showRescheduleModal && rescheduleApt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-yellow-900/90 to-orange-900/90 rounded-2xl p-6 w-full max-w-md border border-white/20">
            <h3 className="text-xl font-bold text-white mb-1">Reschedule Appointment</h3>
            <p className="text-sm text-gray-400 mb-4">
              Dr. {rescheduleApt.doctor?.fullName} — Only available before approval
            </p>
            <form onSubmit={handleReschedule} className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm block mb-2">New Date *</label>
                <input
                  type="date"
                  value={rescheduleForm.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm block mb-2">New Time Slot *</label>
                <select
                  value={rescheduleForm.timeSlot}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, timeSlot: e.target.value })}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="" className="text-gray-900">Select Time</option>
                  <option value="09:00 AM - 10:00 AM" className="text-gray-900">09:00 AM - 10:00 AM</option>
                  <option value="10:00 AM - 11:00 AM" className="text-gray-900">10:00 AM - 11:00 AM</option>
                  <option value="11:00 AM - 12:00 PM" className="text-gray-900">11:00 AM - 12:00 PM</option>
                  <option value="02:00 PM - 03:00 PM" className="text-gray-900">02:00 PM - 03:00 PM</option>
                  <option value="03:00 PM - 04:00 PM" className="text-gray-900">03:00 PM - 04:00 PM</option>
                  <option value="04:00 PM - 05:00 PM" className="text-gray-900">04:00 PM - 05:00 PM</option>
                </select>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-sm text-gray-300">
                <div>Current: {new Date(rescheduleApt.date).toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' })} — {rescheduleApt.timeSlot}</div>
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowRescheduleModal(false); setRescheduleApt(null); }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading.reschedule}
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {actionLoading.reschedule && (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  )}
                  {actionLoading.reschedule ? 'Saving...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Report Modal */}
      {showUploadReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-pink-900/90 to-purple-900/90 rounded-2xl p-6 w-full max-w-2xl border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Submit Medical Record</h3>
            <form onSubmit={handleUploadReport} className="space-y-4">
              <div>
                <label htmlFor="report-title" className="text-gray-300 text-sm block mb-2">Report Title</label>
                <input
                  id="report-title"
                  type="text"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="report-type" className="text-gray-300 text-sm block mb-2">Report Type</label>
                  <input
                    id="report-type"
                    type="text"
                    value={reportForm.type}
                    onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label htmlFor="report-file" className="text-gray-300 text-sm block mb-2">Report File</label>
                  <input
                    id="report-file"
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setReportForm({ ...reportForm, reportFile: e.target.files?.[0] || null })}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowUploadReportModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading.upload}
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {actionLoading.upload ? 'Submitting...' : 'Submit Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
