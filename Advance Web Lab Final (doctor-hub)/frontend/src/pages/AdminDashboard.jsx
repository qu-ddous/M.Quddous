import { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import { appointmentService } from '../services/appointmentService';
import { paymentService } from '../services/paymentService';
import { doctorService } from '../services/doctorService';
import { userService } from '../services/userService';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const getRoleAvatarClass = (role) => {
  if (role === 'ADMIN') return 'bg-gradient-to-br from-purple-500 to-pink-500';
  if (role === 'DOCTOR') return 'bg-gradient-to-br from-blue-500 to-cyan-500';
  if (role === 'PATIENT') return 'bg-gradient-to-br from-green-500 to-teal-500';
  return 'bg-gradient-to-br from-yellow-500 to-orange-500';
};

const getRoleBadgeClass = (role) => {
  if (role === 'ADMIN') return 'bg-purple-500/30 text-purple-300';
  if (role === 'DOCTOR') return 'bg-blue-500/30 text-blue-300';
  if (role === 'PATIENT') return 'bg-green-500/30 text-green-300';
  return 'bg-yellow-500/30 text-yellow-300';
};

const getAppointmentStatusClass = (status) => {
  if (status === 'CONFIRMED') return 'bg-green-500/30 text-green-300';
  if (status === 'PENDING') return 'bg-yellow-500/30 text-yellow-300';
  if (status === 'CANCELLED') return 'bg-red-500/30 text-red-300';
  return 'bg-blue-500/30 text-blue-300';
};

const getPaymentStatusClass = (status) => {
  if (status === 'VERIFIED') return 'bg-green-500/30 text-green-300';
  if (status === 'PENDING') return 'bg-yellow-500/30 text-yellow-300';
  return 'bg-red-500/30 text-red-300';
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState({});
  const startAction = (k) => setActionLoading(p => ({ ...p, [k]: true }));
  const stopAction = (k) => setActionLoading(p => ({ ...p, [k]: false }));

  // Dropdown states
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Modal states
  const [showCreateDoctorModal, setShowCreateDoctorModal] = useState(false);
  const [showEditDoctorModal, setShowEditDoctorModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // User modal states
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);

  // Appointment modal states
  const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDeleteAppointmentModal, setShowDeleteAppointmentModal] = useState(false);

  // Payment modal states
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDeletePaymentModal, setShowDeletePaymentModal] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    autoApproveDoctors: false,
    maintenanceMode: false,
    platformName: 'DoctorHub',
    supportEmail: 'support@doctorhub.com',
    maxAppointmentsPerDay: 50
  });

  // Form state
  const [doctorForm, setDoctorForm] = useState({
    email: '', password: '', fullName: '', phone: '',
    specialization: 'General', experience: '', qualification: 'MBBS', fee: '', about: ''
  });

  const [userForm, setUserForm] = useState({
    email: '', password: '', role: 'PATIENT', fullName: '', phone: ''
  });

  const [appointmentForm, setAppointmentForm] = useState({
    patientId: '', doctorId: '', date: '', timeSlot: '', reason: '', status: 'PENDING'
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '', method: 'EASYPAISA', status: 'PENDING'
  });

  // React Query — replaces manual fetchData + useEffect
  const { data: doctors = [], isLoading: doctorsLoading } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: doctorService.getAllDoctorsAdmin,
  });

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: appointmentService.getAppointments,
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: paymentService.getPayments,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => userService.getAllUsers().catch(() => []),
  });

  const loading = doctorsLoading || appointmentsLoading || paymentsLoading || usersLoading;

  // Doctor CRUD handlers
  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    if (actionLoading.createDoctor) return;
    startAction('createDoctor');
    try {
      await doctorService.createDoctor(doctorForm);
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      setShowCreateDoctorModal(false);
      setDoctorForm({ email: '', password: '', fullName: '', phone: '', specialization: 'General', experience: '', qualification: 'MBBS', fee: '', about: '' });
      toast.success('Doctor created ✅');
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed to create doctor'); }
    finally { stopAction('createDoctor'); }
  };

  const handleEditDoctor = async (e) => {
    e.preventDefault();
    if (actionLoading.editDoctor) return;
    startAction('editDoctor');
    try {
      await doctorService.updateDoctorProfile(selectedDoctor.id, doctorForm);
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      setShowEditDoctorModal(false);
      setSelectedDoctor(null);
      toast.success('Doctor updated ✅');
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed to update doctor'); }
    finally { stopAction('editDoctor'); }
  };

  const handleDeleteDoctor = async () => {
    if (actionLoading.deleteDoctor) return;
    startAction('deleteDoctor');
    try {
      await doctorService.deleteDoctor(selectedDoctor.id);
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      setShowDeleteModal(false); setSelectedDoctor(null);
      toast.success('Doctor removed');
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed to delete doctor'); }
    finally { stopAction('deleteDoctor'); }
  };

  const handleApproveDoctor = async (doctorId) => {
    const key = `approve_${doctorId}`;
    if (actionLoading[key]) return;
    startAction(key);
    try {
      await doctorService.approveDoctor(doctorId);
      queryClient.invalidateQueries({ queryKey: ['admin-doctors'] });
      toast.success('Doctor approved ✅');
    } catch { toast.error('Failed to approve doctor'); }
    finally { stopAction(key); }
  };

  const openEditModal = (doctor) => {
    setSelectedDoctor(doctor);
    setDoctorForm({
      email: doctor.user?.email || '',
      password: '',
      fullName: doctor.fullName,
      phone: doctor.phone,
      specialization: doctor.specialization,
      experience: doctor.experience,
      qualification: doctor.qualification,
      fee: doctor.fee,
      about: doctor.about || ''
    });
    setShowEditDoctorModal(true);
  };

  const openDeleteModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDeleteModal(true);
  };

  // User CRUD handlers
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (actionLoading.createUser) return;
    startAction('createUser');
    try {
      await userService.createUser(userForm);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowCreateUserModal(false);
      setUserForm({ email: '', password: '', role: 'PATIENT', fullName: '', phone: '' });
      toast.success('User created ✅');
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to create user');
    } finally { stopAction('createUser'); }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (actionLoading.editUser) return;
    startAction('editUser');
    try {
      await userService.updateUser(selectedUser.id, userForm);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowEditUserModal(false);
      setSelectedUser(null);
      toast.success('User updated ✅');
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to update user');
    } finally { stopAction('editUser'); }
  };

  const handleDeleteUser = async () => {
    if (actionLoading.deleteUser) return;
    startAction('deleteUser');
    try {
      await userService.deleteUser(selectedUser.id);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowDeleteUserModal(false);
      setSelectedUser(null);
      toast.success('User deleted');
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to delete user');
    } finally { stopAction('deleteUser'); }
  };

  const openEditUserModal = (user) => {
    setSelectedUser(user);
    setUserForm({
      email: user.email,
      password: '',
      role: user.role,
      fullName: '',
      phone: ''
    });
    setShowEditUserModal(true);
  };

  const openDeleteUserModal = (user) => {
    setSelectedUser(user);
    setShowDeleteUserModal(true);
  };

  // Appointment CRUD handlers
  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    if (actionLoading.editAppointment) return;
    startAction('editAppointment');
    try {
      await appointmentService.updateAppointment(selectedAppointment.id, appointmentForm);
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      setShowEditAppointmentModal(false);
      setSelectedAppointment(null);
      toast.success('Appointment updated ✅');
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to update appointment');
    } finally { stopAction('editAppointment'); }
  };

  const handleDeleteAppointment = async () => {
    if (actionLoading.deleteAppointment) return;
    startAction('deleteAppointment');
    try {
      await appointmentService.deleteAppointment(selectedAppointment.id);
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      setShowDeleteAppointmentModal(false);
      setSelectedAppointment(null);
      toast.success('Appointment deleted');
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to delete appointment');
    } finally { stopAction('deleteAppointment'); }
  };

  const handleApproveAppointment = async (appointmentId) => {
    const key = `apt_approve_${appointmentId}`;
    if (actionLoading[key]) return;
    startAction(key);
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, 'CONFIRMED');
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      toast.success('Appointment confirmed ✅');
    } catch { toast.error('Failed to confirm appointment'); }
    finally { stopAction(key); }
  };

  const handleRejectAppointment = async (appointmentId) => {
    const key = `apt_reject_${appointmentId}`;
    if (actionLoading[key]) return;
    startAction(key);
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, 'CANCELLED');
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      toast.success('Appointment cancelled');
    } catch { toast.error('Failed to cancel appointment'); }
    finally { stopAction(key); }
  };

  const openEditAppointmentModal = (appointment) => {
    setSelectedAppointment(appointment);
    setAppointmentForm({
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      date: appointment.date?.split('T')[0] || '',
      timeSlot: appointment.timeSlot || '',
      reason: appointment.reason || '',
      status: appointment.status || 'PENDING'
    });
    setShowEditAppointmentModal(true);
  };

  const openDeleteAppointmentModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDeleteAppointmentModal(true);
  };

  // Payment CRUD handlers
  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    if (actionLoading.editPayment) return;
    startAction('editPayment');
    try {
      await paymentService.updatePayment(selectedPayment.id, paymentForm);
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      setShowEditPaymentModal(false);
      setSelectedPayment(null);
      toast.success('Payment updated ✅');
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to update payment');
    } finally { stopAction('editPayment'); }
  };

  const handleDeletePayment = async () => {
    if (actionLoading.deletePayment) return;
    startAction('deletePayment');
    try {
      await paymentService.deletePayment(selectedPayment.id);
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      setShowDeletePaymentModal(false);
      setSelectedPayment(null);
      toast.success('Payment deleted');
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to delete payment');
    } finally { stopAction('deletePayment'); }
  };

  const handleVerifyPayment = async (paymentId, status) => {
    const key = `verify_pay_${paymentId}`;
    if (actionLoading[key]) return;
    startAction(key);
    try {
      await paymentService.verifyPayment(paymentId, status);
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      toast.success(status === 'VERIFIED' ? 'Payment verified ✅' : 'Payment rejected');
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to verify payment');
    } finally { stopAction(key); }
  };

  const openEditPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setPaymentForm({
      amount: payment.amount,
      method: payment.method,
      status: payment.status
    });
    setShowEditPaymentModal(true);
  };

  const openDeletePaymentModal = (payment) => {
    setSelectedPayment(payment);
    setShowDeletePaymentModal(true);
  };

  // Settings handlers
  const handleSettingsChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully 💾');
    // In a real app, this would save to backend
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;
  }

  const pendingDoctors = doctors.filter((d) => !d.isApproved);
  const totalRevenue = payments
    .filter((p) => p.status === 'VERIFIED')
    .reduce((sum, p) => sum + p.amount, 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Chart data
  const appointmentsChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Appointments',
        data: [12, 19, 3, 5, 2, appointments.length],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue (PKR)',
        data: [12000, 19000, 3000, 5000, 2000, totalRevenue],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: 'white',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      y: {
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/admin/doctors') return 'Doctors';
    if (path === '/admin/users') return 'Users';
    if (path === '/admin/appointments') return 'Appointments';
    if (path === '/admin/payments') return 'Payments';
    if (path === '/admin/settings') return 'Settings';
    return 'Dashboard';
  };

  const renderContent = () => { // NOSONAR
    const currentPage = getCurrentPage();
    
    if (currentPage === 'Doctors') {
      return (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Manage Doctors</h2>
            <button
              onClick={() => setShowCreateDoctorModal(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Doctor
            </button>
          </div>
          
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
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
            <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{doctors.filter(d => d.isApproved).length}</div>
              <div className="text-sm text-gray-200">Active</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{doctors.filter(d => !d.isApproved).length}</div>
              <div className="text-sm text-gray-200">Pending</div>
            </div>
            <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                  <polyline points="12 18 12 18 16 20"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{doctors.reduce((sum, d) => sum + (d.experience || 0), 0)}</div>
              <div className="text-sm text-gray-200">Total Experience</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search doctors..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <select className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400">
                <option value="" className="text-gray-900">All Specializations</option>
                {Array.from(new Set(doctors.map(d => d.specialization))).map(spec => (
                  <option key={spec} value={spec} className="text-gray-900">{spec}</option>
                ))}
              </select>
              <select className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400">
                <option value="" className="text-gray-900">All Status</option>
                <option value="approved" className="text-gray-900">Approved</option>
                <option value="pending" className="text-gray-900">Pending</option>
              </select>
            </div>
          </div>

          {/* Doctors List */}
          <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/20">
                    <th className="pb-3 text-gray-300 font-medium">Doctor</th>
                    <th className="pb-3 text-gray-300 font-medium">Specialization</th>
                    <th className="pb-3 text-gray-300 font-medium">Experience</th>
                    <th className="pb-3 text-gray-300 font-medium">Fee</th>
                    <th className="pb-3 text-gray-300 font-medium">Status</th>
                    <th className="pb-3 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doctor) => (
                    <tr key={doctor.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {doctor.fullName?.charAt(0) || 'D'}
                          </div>
                          <div>
                            <div className="font-medium text-white">{doctor.fullName}</div>
                            <div className="text-sm text-gray-400">{doctor.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-gray-300">{doctor.specialization}</td>
                      <td className="py-4 text-gray-300">{doctor.experience} years</td>
                      <td className="py-4 text-gray-300">Rs. {doctor.fee || 500}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 text-xs rounded-full ${doctor.isApproved ? 'bg-green-500/30 text-green-300' : 'bg-yellow-500/30 text-yellow-300'}`}>
                          {doctor.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <button className="p-2 bg-blue-500/20 hover:bg-blue-500/40 rounded-lg text-blue-400 transition-colors">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>
                          <button 
                            onClick={() => openEditModal(doctor)}
                            className="p-2 bg-purple-500/20 hover:bg-purple-500/40 rounded-lg text-purple-400 transition-colors"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          {!doctor.isApproved && (
                            <button 
                              onClick={() => handleApproveDoctor(doctor.id)}
                              className="p-2 bg-green-500/20 hover:bg-green-500/40 rounded-lg text-green-400 transition-colors"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            </button>
                          )}
                          <button 
                            onClick={() => openDeleteModal(doctor)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400 transition-colors"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentPage === 'Users') {
      return (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Manage Users</h2>
            <button
              onClick={() => setShowCreateUserModal(true)}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add User
            </button>
          </div>
          
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{users.length}</div>
              <div className="text-sm text-gray-200">Total Users</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{users.filter(u => u.role === 'ADMIN').length}</div>
              <div className="text-sm text-gray-200">Admins</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{users.filter(u => u.role === 'DOCTOR').length}</div>
              <div className="text-sm text-gray-200">Doctors</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{users.filter(u => u.role === 'PATIENT').length}</div>
              <div className="text-sm text-gray-200">Patients</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{users.filter(u => u.role === 'ASSISTANT').length}</div>
              <div className="text-sm text-gray-200">Assistants</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search users by email..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <select className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400">
                <option value="" className="text-gray-900">All Roles</option>
                <option value="ADMIN" className="text-gray-900">Admin</option>
                <option value="DOCTOR" className="text-gray-900">Doctor</option>
                <option value="PATIENT" className="text-gray-900">Patient</option>
                <option value="ASSISTANT" className="text-gray-900">Assistant</option>
              </select>
              <select className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400">
                <option value="" className="text-gray-900">Sort by</option>
                <option value="newest" className="text-gray-900">Newest First</option>
                <option value="oldest" className="text-gray-900">Oldest First</option>
                <option value="email" className="text-gray-900">Email A-Z</option>
              </select>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/20">
                    <th className="pb-3 text-gray-300 font-medium">User</th>
                    <th className="pb-3 text-gray-300 font-medium">Role</th>
                    <th className="pb-3 text-gray-300 font-medium">Joined Date</th>
                    <th className="pb-3 text-gray-300 font-medium">Status</th>
                    <th className="pb-3 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-300">No users found</td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getRoleAvatarClass(user.role)}`}>
                              {user.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-medium text-white">{user.email}</div>
                              <div className="text-sm text-gray-400">ID: {user.id.slice(0, 8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`px-3 py-1 text-xs rounded-full ${getRoleBadgeClass(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="py-4">
                          <span className="px-3 py-1 text-xs rounded-full bg-green-500/30 text-green-300">Active</span>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <button className="p-2 bg-blue-500/20 hover:bg-blue-500/40 rounded-lg text-blue-400 transition-colors">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>
                            <button 
                              onClick={() => openEditUserModal(user)}
                              className="p-2 bg-purple-500/20 hover:bg-purple-500/40 rounded-lg text-purple-400 transition-colors"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            {user.role !== 'ADMIN' && (
                              <button 
                                onClick={() => openDeleteUserModal(user)}
                                className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400 transition-colors"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentPage === 'Appointments') {
      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Manage Appointments</h2>
          
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
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
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{appointments.filter(a => a.status === 'CONFIRMED').length}</div>
              <div className="text-sm text-gray-200">Confirmed</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{appointments.filter(a => a.status === 'PENDING').length}</div>
              <div className="text-sm text-gray-200">Pending</div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
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
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search appointments..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <select className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400">
                <option value="" className="text-gray-900">All Status</option>
                <option value="CONFIRMED" className="text-gray-900">Confirmed</option>
                <option value="PENDING" className="text-gray-900">Pending</option>
                <option value="CANCELLED" className="text-gray-900">Cancelled</option>
                <option value="COMPLETED" className="text-gray-900">Completed</option>
              </select>
              <input
                type="date"
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          {/* Appointments List */}
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/20">
                    <th className="pb-3 text-gray-300 font-medium">Appointment ID</th>
                    <th className="pb-3 text-gray-300 font-medium">Patient</th>
                    <th className="pb-3 text-gray-300 font-medium">Doctor</th>
                    <th className="pb-3 text-gray-300 font-medium">Date</th>
                    <th className="pb-3 text-gray-300 font-medium">Time</th>
                    <th className="pb-3 text-gray-300 font-medium">Status</th>
                    <th className="pb-3 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-300">No appointments found</td>
                    </tr>
                  ) : (
                    appointments.map((apt) => (
                      <tr key={apt.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-4 text-gray-300">#{apt.id.slice(0, 8)}</td>
                        <td className="py-4 text-gray-300">{apt.patientId?.slice(0, 8) || 'N/A'}</td>
                        <td className="py-4 text-gray-300">{apt.doctorId?.slice(0, 8) || 'N/A'}</td>
                        <td className="py-4 text-gray-300">{new Date(apt.date).toLocaleDateString()}</td>
                        <td className="py-4 text-gray-300">{apt.timeSlot || 'N/A'}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 text-xs rounded-full ${getAppointmentStatusClass(apt.status)}`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <button className="p-2 bg-blue-500/20 hover:bg-blue-500/40 rounded-lg text-blue-400 transition-colors">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>
                            <button 
                              onClick={() => openEditAppointmentModal(apt)}
                              className="p-2 bg-purple-500/20 hover:bg-purple-500/40 rounded-lg text-purple-400 transition-colors"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            {apt.status === 'PENDING' && (
                              <>
                                <button 
                                  onClick={() => handleApproveAppointment(apt.id)}
                                  className="p-2 bg-green-500/20 hover:bg-green-500/40 rounded-lg text-green-400 transition-colors"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => handleRejectAppointment(apt.id)}
                                  className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400 transition-colors"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                  </svg>
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => openDeleteAppointmentModal(apt)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400 transition-colors"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentPage === 'Payments') {
      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Manage Payments</h2>
          
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{payments.length}</div>
              <div className="text-sm text-gray-200">Total Payments</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">Rs. {payments.filter(p => p.status === 'VERIFIED').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</div>
              <div className="text-sm text-gray-200">Verified Amount</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">Rs. {payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</div>
              <div className="text-sm text-gray-200">Pending Amount</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{payments.filter(p => p.status === 'VERIFIED').length}</div>
              <div className="text-sm text-gray-200">Verified Count</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search payments..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <select className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400">
                <option value="" className="text-gray-900">All Status</option>
                <option value="VERIFIED" className="text-gray-900">Verified</option>
                <option value="PENDING" className="text-gray-900">Pending</option>
                <option value="REJECTED" className="text-gray-900">Rejected</option>
              </select>
              <select className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400">
                <option value="" className="text-gray-900">All Methods</option>
                <option value="CASH" className="text-gray-900">Cash</option>
                <option value="CARD" className="text-gray-900">Card</option>
                <option value="BANK_TRANSFER" className="text-gray-900">Bank Transfer</option>
                <option value="EASYPAISA" className="text-gray-900">Easypaisa</option>
                <option value="JAZZCASH" className="text-gray-900">JazzCash</option>
              </select>
            </div>
          </div>

          {/* Payments List */}
          <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/20">
                    <th className="pb-3 text-gray-300 font-medium">Payment ID</th>
                    <th className="pb-3 text-gray-300 font-medium">Amount</th>
                    <th className="pb-3 text-gray-300 font-medium">Method</th>
                    <th className="pb-3 text-gray-300 font-medium">Date</th>
                    <th className="pb-3 text-gray-300 font-medium">Status</th>
                    <th className="pb-3 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-300">No payments found</td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-4 text-gray-300">#{payment.id.slice(0, 8)}</td>
                        <td className="py-4 text-gray-300 font-semibold">Rs. {payment.amount.toLocaleString()}</td>
                        <td className="py-4 text-gray-300">{payment.method}</td>
                        <td className="py-4 text-gray-300">{new Date(payment.createdAt).toLocaleDateString()}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 text-xs rounded-full ${getPaymentStatusClass(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <button className="p-2 bg-blue-500/20 hover:bg-blue-500/40 rounded-lg text-blue-400 transition-colors">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>
                            <button 
                              onClick={() => openEditPaymentModal(payment)}
                              className="p-2 bg-purple-500/20 hover:bg-purple-500/40 rounded-lg text-purple-400 transition-colors"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            {payment.status === 'PENDING' && (
                              <>
                                <button 
                                  onClick={() => handleVerifyPayment(payment.id, 'VERIFIED')}
                                  disabled={actionLoading[`verify_pay_${payment.id}`]}
                                  className="p-2 bg-green-500/20 hover:bg-green-500/40 rounded-lg text-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {actionLoading[`verify_pay_${payment.id}`]
                                    ? <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="20 6 9 17 4 12"/></svg>
                                  }
                                </button>
                                <button 
                                  onClick={() => handleVerifyPayment(payment.id, 'REJECTED')}
                                  disabled={actionLoading[`verify_pay_${payment.id}`]}
                                  className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                  </svg>
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => openDeletePaymentModal(payment)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400 transition-colors"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentPage === 'Settings') {
      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Platform Settings */}
            <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <div className="icon-3d">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-4.418 0-8 2-8 5v1h16v-1c0-3-3.582-5-8-5z"/>
                  </svg>
                </div>
                Platform Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                  <div>
                    <div className="text-white font-medium">Email Notifications</div>
                    <div className="text-sm text-gray-400">Send email alerts for new registrations</div>
                  </div>
                  <button 
                    onClick={() => handleSettingsChange('emailNotifications', !settings.emailNotifications)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${settings.emailNotifications ? 'bg-purple-500' : 'bg-gray-600'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.emailNotifications ? 'right-1' : 'left-1'}`}></span>
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                  <div>
                    <div className="text-white font-medium">Auto-approve Doctors</div>
                    <div className="text-sm text-gray-400">Automatically approve new doctor registrations</div>
                  </div>
                  <button 
                    onClick={() => handleSettingsChange('autoApproveDoctors', !settings.autoApproveDoctors)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${settings.autoApproveDoctors ? 'bg-purple-500' : 'bg-gray-600'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.autoApproveDoctors ? 'right-1' : 'left-1'}`}></span>
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                  <div>
                    <div className="text-white font-medium">Maintenance Mode</div>
                    <div className="text-sm text-gray-400">Disable platform for maintenance</div>
                  </div>
                  <button 
                    onClick={() => handleSettingsChange('maintenanceMode', !settings.maintenanceMode)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${settings.maintenanceMode ? 'bg-purple-500' : 'bg-gray-600'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.maintenanceMode ? 'right-1' : 'left-1'}`}></span>
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                  <div>
                    <div className="text-white font-medium">SMS Notifications</div>
                    <div className="text-sm text-gray-400">Send SMS alerts for appointments</div>
                  </div>
                  <button 
                    onClick={() => handleSettingsChange('smsNotifications', !settings.smsNotifications)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${settings.smsNotifications ? 'bg-purple-500' : 'bg-gray-600'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.smsNotifications ? 'right-1' : 'left-1'}`}></span>
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Settings */}
            <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <div className="icon-3d">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                Payment Settings
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-white/10 rounded-xl">
                  <label htmlFor="platform-name" className="text-white font-medium block mb-2">Platform Name</label>
                  <input 
                    id="platform-name"
                    type="text" 
                    value={settings.platformName}
                    onChange={(e) => handleSettingsChange('platformName', e.target.value)}
                    className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" 
                  />
                </div>
                <div className="p-3 bg-white/10 rounded-xl">
                  <label htmlFor="support-email" className="text-white font-medium block mb-2">Support Email</label>
                  <input 
                    id="support-email"
                    type="email" 
                    value={settings.supportEmail}
                    onChange={(e) => handleSettingsChange('supportEmail', e.target.value)}
                    className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" 
                  />
                </div>
                <div className="p-3 bg-white/10 rounded-xl">
                  <label htmlFor="max-appointments" className="text-white font-medium block mb-2">Max Appointments Per Day</label>
                  <input 
                    id="max-appointments"
                    type="number" 
                    value={settings.maxAppointmentsPerDay}
                    onChange={(e) => handleSettingsChange('maxAppointmentsPerDay', Number.parseInt(e.target.value, 10))}
                    className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" 
                  />
                </div>
                <button 
                  onClick={handleSaveSettings}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg transition-colors font-medium"
                >
                  Save Settings
                </button>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <div className="icon-3d">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                Security Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                  <div>
                    <div className="text-white font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-400">Add extra security to admin accounts</div>
                  </div>
                  <button className="w-12 h-6 bg-gray-600 rounded-full relative transition-colors">
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></span>
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                  <div>
                    <div className="text-white font-medium">Session Timeout</div>
                    <div className="text-sm text-gray-400">Auto-logout after inactivity</div>
                  </div>
                  <select className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400">
                    <option value="30" className="text-gray-900">30 minutes</option>
                    <option value="60" className="text-gray-900">1 hour</option>
                    <option value="120" className="text-gray-900">2 hours</option>
                    <option value="0" className="text-gray-900">Never</option>
                  </select>
                </div>
                <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg transition-colors font-medium">
                  Change Admin Password
                </button>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <div className="icon-3d">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                Account Settings
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/10 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">Admin Email</div>
                  <div className="text-white font-medium">{user?.email || 'admin@doctorhub.com'}</div>
                </div>
                <div className="p-4 bg-white/10 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">Role</div>
                  <div className="text-white font-medium">{user?.role || 'ADMIN'}</div>
                </div>
                <div className="p-4 bg-white/10 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">Account Created</div>
                  <div className="text-white font-medium">{new Date().toLocaleDateString()}</div>
                </div>
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors font-medium">
                  Update Profile
                </button>
              </div>
            </div>

            {/* System Settings */}
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <div className="icon-3d">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </div>
                System Settings
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-white/10 rounded-xl">
                  <label htmlFor="timezone-select" className="text-white font-medium block mb-2">Timezone</label>
                  <select id="timezone-select" className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400">
                    <option value="Asia/Karachi" className="text-gray-900">Asia/Karachi (PKT)</option>
                    <option value="UTC" className="text-gray-900">UTC</option>
                    <option value="America/New_York" className="text-gray-900">America/New_York (EST)</option>
                    <option value="Europe/London" className="text-gray-900">Europe/London (GMT)</option>
                  </select>
                </div>
                <div className="p-3 bg-white/10 rounded-xl">
                  <label htmlFor="date-format-select" className="text-white font-medium block mb-2">Date Format</label>
                  <select id="date-format-select" className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400">
                    <option value="DD/MM/YYYY" className="text-gray-900">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY" className="text-gray-900">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD" className="text-gray-900">YYYY-MM-DD</option>
                  </select>
                </div>
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg transition-colors font-medium">
                  Export All Data
                </button>
                <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg transition-colors font-medium">
                  Clear Cache
                </button>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <div className="icon-3d">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </div>
                Notification Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                  <div>
                    <div className="text-white font-medium">New Appointment Alerts</div>
                    <div className="text-sm text-gray-400">Get notified for new appointments</div>
                  </div>
                  <button className="w-12 h-6 bg-purple-500 rounded-full relative transition-colors">
                    <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></span>
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                  <div>
                    <div className="text-white font-medium">Payment Alerts</div>
                    <div className="text-sm text-gray-400">Get notified for new payments</div>
                  </div>
                  <button className="w-12 h-6 bg-purple-500 rounded-full relative transition-colors">
                    <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></span>
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                  <div>
                    <div className="text-white font-medium">Doctor Registration Alerts</div>
                    <div className="text-sm text-gray-400">Get notified for new doctor registrations</div>
                  </div>
                  <button className="w-12 h-6 bg-purple-500 rounded-full relative transition-colors">
                    <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></span>
                  </button>
                </div>
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
            {getGreeting()}, Admin!
          </h1>
          <p className="text-gray-400 mt-2">Manage the Doctor Hub platform</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
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
              {appointments.length}
            </div>
            <div className="text-sm text-gray-200">Total Patients</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
            <div className="icon-3d mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="text-2xl font-bold text-white">
              {appointments.length}
            </div>
            <div className="text-sm text-gray-200">Appointments</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
            <div className="icon-3d mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <div className="text-2xl font-bold text-white">
              Rs. {totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-200">Total Revenue</div>
          </div>
        </div>

        {/* Trending Graphs */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-4 backdrop-blur-lg border border-white/20">
            <h2 className="text-lg font-semibold text-white mb-3">Appointments Trend</h2>
            <Line data={appointmentsChartData} options={chartOptions} />
          </div>
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-4 backdrop-blur-lg border border-white/20">
            <h2 className="text-lg font-semibold text-white mb-3">Revenue Trend</h2>
            <Bar data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Pending Doctor Approvals */}
          <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">
              Pending Doctor Approvals
            </h2>
            {pendingDoctors.length === 0 ? (
              <p className="text-gray-300 text-center py-4">
                No pending approvals
              </p>
            ) : (
              <div className="space-y-4">
                {pendingDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="p-4 bg-white/10 rounded-xl border border-white/20"
                  >
                    <div className="font-medium text-white">
                      {doctor.fullName}
                    </div>
                    <div className="text-sm text-gray-300">
                      {doctor.specialization}
                    </div>
                    <div className="text-sm text-gray-300">
                      {doctor.experience} years experience
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <Button size="sm" variant="primary" className="bg-green-500 hover:bg-green-600">
                        Approve
                      </Button>
                      <Button size="sm" variant="danger" className="bg-red-500 hover:bg-red-600">
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-white/10 rounded-xl border border-white/20">
                <div className="icon-3d mr-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-purple-400">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 2 17"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {appointments.length} total appointments
                  </div>
                  <div className="text-xs text-gray-300">
                    Platform activity
                  </div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-white/10 rounded-xl border border-white/20">
                <div className="icon-3d mr-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-purple-400">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {payments.filter((p) => p.status === 'VERIFIED').length} verified payments
                  </div>
                  <div className="text-xs text-gray-300">
                    Payment processing
                  </div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-white/10 rounded-xl border border-white/20">
                <div className="icon-3d mr-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-purple-400">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {doctors.filter((d) => d.isApproved).length} active doctors
                  </div>
                  <div className="text-xs text-gray-300">
                    Healthcare providers
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* All Doctors List */}
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20 mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            All Doctors
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="bg-white/10 rounded-xl p-4 border border-white/20 hover:scale-105 transition-transform cursor-pointer">
                <div className="font-medium text-white mb-1">
                  {doctor.fullName}
                </div>
                <div className="text-sm text-purple-300 mb-2">{doctor.specialization}</div>
                <div className="text-sm text-gray-300">
                  {doctor.experience} years experience
                </div>
                <span
                  className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                    doctor.isApproved
                      ? 'bg-green-500/30 text-green-300'
                      : 'bg-yellow-500/30 text-yellow-300'
                  }`}
                >
                  {doctor.isApproved ? 'Approved' : 'Pending'}
                </span>
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
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
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
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
              </button>
              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-[9999]">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="text-white font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-700">
                      <p className="text-white text-sm">New doctor registration pending approval</p>
                      <p className="text-gray-400 text-xs mt-1">2 minutes ago</p>
                    </div>
                    <div className="p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-700">
                      <p className="text-white text-sm">Payment verification required</p>
                      <p className="text-gray-400 text-xs mt-1">5 minutes ago</p>
                    </div>
                    <div className="p-3 hover:bg-gray-800 cursor-pointer">
                      <p className="text-white text-sm">System backup completed</p>
                      <p className="text-gray-400 text-xs mt-1">1 hour ago</p>
                    </div>
                  </div>
                  <div className="p-3 border-t border-gray-700">
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
                  A
                </div>
                <span className="text-white font-medium text-sm">Admin</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-white">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-[9999]">
                  <div className="p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-700">
                    <Link to="/admin/settings" className="text-white text-sm">Settings</Link>
                  </div>
                  <div className="p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-700">
                    <span className="text-white text-sm">Help & Support</span>
                  </div>
                  <div className="p-3 hover:bg-gray-800 cursor-pointer">
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
          <Link to="/admin/dashboard" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/admin/dashboard' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/doctors" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/admin/doctors' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span>Doctors</span>
          </Link>
          <Link to="/admin/users" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/admin/users' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span>Users</span>
          </Link>
          <Link to="/admin/appointments" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/admin/appointments' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
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
          <Link to="/admin/payments" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/admin/payments' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <span>Payments</span>
          </Link>
          <Link to="/admin/settings" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/admin/settings' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
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

      {/* Create Doctor Modal */}
      {showCreateDoctorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-2xl p-6 w-full max-w-2xl border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Add New Doctor</h3>
            <form onSubmit={handleCreateDoctor} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="doctor-email" className="text-gray-300 text-sm block mb-2">Email</label>
                  <input
                    id="doctor-email"
                    type="email"
                    required
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({...doctorForm, email: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label htmlFor="doctor-password" className="text-gray-300 text-sm block mb-2">Password</label>
                  <input
                    id="doctor-password"
                    type="password"
                    required
                    value={doctorForm.password}
                    onChange={(e) => setDoctorForm({...doctorForm, password: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label htmlFor="doctor-full-name" className="text-gray-300 text-sm block mb-2">Full Name</label>
                  <input
                    id="doctor-full-name"
                    type="text"
                    required
                    value={doctorForm.fullName}
                    onChange={(e) => setDoctorForm({...doctorForm, fullName: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label htmlFor="doctor-phone" className="text-gray-300 text-sm block mb-2">Phone</label>
                  <input
                    id="doctor-phone"
                    type="tel"
                    required
                    value={doctorForm.phone}
                    onChange={(e) => setDoctorForm({...doctorForm, phone: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label htmlFor="doctor-specialization" className="text-gray-300 text-sm block mb-2">Specialization</label>
                  <select
                    id="doctor-specialization"
                    required
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({...doctorForm, specialization: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="General" className="text-gray-900">General</option>
                    <option value="Cardiologist" className="text-gray-900">Cardiologist</option>
                    <option value="Dermatologist" className="text-gray-900">Dermatologist</option>
                    <option value="Neurologist" className="text-gray-900">Neurologist</option>
                    <option value="Pediatrician" className="text-gray-900">Pediatrician</option>
                    <option value="Orthopedic" className="text-gray-900">Orthopedic</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="doctor-experience" className="text-gray-300 text-sm block mb-2">Experience (years)</label>
                  <input
                    id="doctor-experience"
                    type="number"
                    required
                    value={doctorForm.experience}
                    onChange={(e) => setDoctorForm({...doctorForm, experience: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label htmlFor="doctor-qualification" className="text-gray-300 text-sm block mb-2">Qualification</label>
                  <input
                    id="doctor-qualification"
                    type="text"
                    required
                    value={doctorForm.qualification}
                    onChange={(e) => setDoctorForm({...doctorForm, qualification: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label htmlFor="doctor-fee" className="text-gray-300 text-sm block mb-2">Fee (PKR)</label>
                  <input
                    id="doctor-fee"
                    type="number"
                    required
                    value={doctorForm.fee}
                    onChange={(e) => setDoctorForm({...doctorForm, fee: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="doctor-about" className="text-gray-300 text-sm block mb-2">About</label>
                <textarea
                  id="doctor-about"
                  value={doctorForm.about}
                  onChange={(e) => setDoctorForm({...doctorForm, about: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  rows="3"
                />
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateDoctorModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading.createDoctor}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {actionLoading.createDoctor && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                  Create Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {showEditDoctorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-2xl p-6 w-full max-w-2xl border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Edit Doctor</h3>
            <form onSubmit={handleEditDoctor} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div id="edit-doctor-email-label" className="text-gray-300 text-sm block mb-2">Email</div>
                  <input
                    id="edit-doctor-email"
                    aria-labelledby="edit-doctor-email-label"
                    type="email"
                    disabled
                    value={doctorForm.email}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <div id="edit-doctor-full-name-label" className="text-gray-300 text-sm block mb-2">Full Name</div>
                  <input
                    id="edit-doctor-full-name"
                    aria-labelledby="edit-doctor-full-name-label"
                    type="text"
                    required
                    value={doctorForm.fullName}
                    onChange={(e) => setDoctorForm({...doctorForm, fullName: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <div id="edit-doctor-phone-label" className="text-gray-300 text-sm block mb-2">Phone</div>
                  <input
                    id="edit-doctor-phone"
                    aria-labelledby="edit-doctor-phone-label"
                    type="tel"
                    required
                    value={doctorForm.phone}
                    onChange={(e) => setDoctorForm({...doctorForm, phone: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <div id="edit-doctor-specialization-label" className="text-gray-300 text-sm block mb-2">Specialization</div>
                  <select
                    id="edit-doctor-specialization"
                    aria-labelledby="edit-doctor-specialization-label"
                    required
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({...doctorForm, specialization: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="General" className="text-gray-900">General</option>
                    <option value="Cardiologist" className="text-gray-900">Cardiologist</option>
                    <option value="Dermatologist" className="text-gray-900">Dermatologist</option>
                    <option value="Neurologist" className="text-gray-900">Neurologist</option>
                    <option value="Pediatrician" className="text-gray-900">Pediatrician</option>
                    <option value="Orthopedic" className="text-gray-900">Orthopedic</option>
                  </select>
                </div>
                <div>
                  <div id="edit-doctor-experience-label" className="text-gray-300 text-sm block mb-2">Experience (years)</div>
                  <input
                    id="edit-doctor-experience"
                    aria-labelledby="edit-doctor-experience-label"
                    type="number"
                    required
                    value={doctorForm.experience}
                    onChange={(e) => setDoctorForm({...doctorForm, experience: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <div id="edit-doctor-qualification-label" className="text-gray-300 text-sm block mb-2">Qualification</div>
                  <input
                    id="edit-doctor-qualification"
                    aria-labelledby="edit-doctor-qualification-label"
                    type="text"
                    required
                    value={doctorForm.qualification}
                    onChange={(e) => setDoctorForm({...doctorForm, qualification: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <div id="edit-doctor-fee-label" className="text-gray-300 text-sm block mb-2">Fee (PKR)</div>
                  <input
                    id="edit-doctor-fee"
                    aria-labelledby="edit-doctor-fee-label"
                    type="number"
                    required
                    value={doctorForm.fee}
                    onChange={(e) => setDoctorForm({...doctorForm, fee: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>
              <div>
                <div id="edit-doctor-about-label" className="text-gray-300 text-sm block mb-2">About</div>
                <textarea
                  id="edit-doctor-about"
                  aria-labelledby="edit-doctor-about-label"
                  value={doctorForm.about}
                  onChange={(e) => setDoctorForm({...doctorForm, about: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  rows="3"
                />
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditDoctorModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading.editDoctor}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {actionLoading.editDoctor && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                  Update Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-red-900/90 to-pink-900/90 rounded-2xl p-6 w-full max-w-md border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Delete Doctor</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete {selectedDoctor?.fullName}? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDoctor}
                disabled={actionLoading.deleteDoctor}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading.deleteDoctor && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-pink-900/90 to-purple-900/90 rounded-2xl p-6 w-full max-w-2xl border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Add New User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="user-email" className="text-gray-300 text-sm block mb-2">Email</label>
                  <input
                    id="user-email"
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label htmlFor="user-password" className="text-gray-300 text-sm block mb-2">Password</label>
                  <input
                    id="user-password"
                    type="password"
                    required
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label htmlFor="user-role" className="text-gray-300 text-sm block mb-2">Role</label>
                  <select
                    id="user-role"
                    required
                    value={userForm.role}
                    onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="PATIENT" className="text-gray-900">Patient</option>
                    <option value="DOCTOR" className="text-gray-900">Doctor</option>
                    <option value="ASSISTANT" className="text-gray-900">Assistant</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="user-full-name" className="text-gray-300 text-sm block mb-2">Full Name</label>
                  <input
                    id="user-full-name"
                    type="text"
                    required
                    value={userForm.fullName}
                    onChange={(e) => setUserForm({...userForm, fullName: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="user-phone" className="text-gray-300 text-sm block mb-2">Phone</label>
                  <input
                    id="user-phone"
                    type="tel"
                    required
                    value={userForm.phone}
                    onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading.createUser}
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {actionLoading.createUser && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-pink-900/90 to-purple-900/90 rounded-2xl p-6 w-full max-w-2xl border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Edit User</h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-user-email" className="text-gray-300 text-sm block mb-2">Email</label>
                  <input
                    id="edit-user-email"
                    type="email"
                    disabled
                    value={userForm.email}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label htmlFor="edit-user-role" className="text-gray-300 text-sm block mb-2">Role</label>
                  <select
                    id="edit-user-role"
                    required
                    value={userForm.role}
                    onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="PATIENT" className="text-gray-900">Patient</option>
                    <option value="ASSISTANT" className="text-gray-900">Assistant</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading.editUser}
                  className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {actionLoading.editUser && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-red-900/90 to-pink-900/90 rounded-2xl p-6 w-full max-w-md border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Delete User</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete {selectedUser?.email}? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowDeleteUserModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading.deleteUser}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading.deleteUser && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditAppointmentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-blue-900/90 to-cyan-900/90 rounded-2xl p-6 w-full max-w-2xl border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Edit Appointment</h3>
            <form onSubmit={handleUpdateAppointment} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="appointment-patient-id" className="text-gray-300 text-sm block mb-2">Patient ID</label>
                  <input
                    id="appointment-patient-id"
                    type="text"
                    required
                    value={appointmentForm.patientId}
                    onChange={(e) => setAppointmentForm({...appointmentForm, patientId: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label htmlFor="appointment-doctor-id" className="text-gray-300 text-sm block mb-2">Doctor ID</label>
                  <input
                    id="appointment-doctor-id"
                    type="text"
                    required
                    value={appointmentForm.doctorId}
                    onChange={(e) => setAppointmentForm({...appointmentForm, doctorId: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label htmlFor="appointment-date" className="text-gray-300 text-sm block mb-2">Date</label>
                  <input
                    id="appointment-date"
                    type="date"
                    required
                    value={appointmentForm.date}
                    onChange={(e) => setAppointmentForm({...appointmentForm, date: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label htmlFor="appointment-time-slot" className="text-gray-300 text-sm block mb-2">Time Slot</label>
                  <input
                    id="appointment-time-slot"
                    type="text"
                    required
                    value={appointmentForm.timeSlot}
                    onChange={(e) => setAppointmentForm({...appointmentForm, timeSlot: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="appointment-reason" className="text-gray-300 text-sm block mb-2">Reason</label>
                  <textarea
                    id="appointment-reason"
                    value={appointmentForm.reason}
                    onChange={(e) => setAppointmentForm({...appointmentForm, reason: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    rows="3"
                  />
                </div>
                <div>
                  <label htmlFor="appointment-status" className="text-gray-300 text-sm block mb-2">Status</label>
                  <select
                    id="appointment-status"
                    required
                    value={appointmentForm.status}
                    onChange={(e) => setAppointmentForm({...appointmentForm, status: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="PENDING" className="text-gray-900">Pending</option>
                    <option value="CONFIRMED" className="text-gray-900">Confirmed</option>
                    <option value="CANCELLED" className="text-gray-900">Cancelled</option>
                    <option value="COMPLETED" className="text-gray-900">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditAppointmentModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading.editAppointment}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {actionLoading.editAppointment && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                  Update Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Appointment Modal */}
      {showDeleteAppointmentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-red-900/90 to-pink-900/90 rounded-2xl p-6 w-full max-w-md border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Delete Appointment</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete appointment #{selectedAppointment?.id?.slice(0, 8)}? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowDeleteAppointmentModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAppointment}
                disabled={actionLoading.deleteAppointment}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading.deleteAppointment && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {showEditPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-green-900/90 to-teal-900/90 rounded-2xl p-6 w-full max-w-2xl border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Edit Payment</h3>
            <form onSubmit={handleUpdatePayment} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="payment-amount" className="text-gray-300 text-sm block mb-2">Amount (PKR)</label>
                  <input
                    id="payment-amount"
                    type="number"
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label htmlFor="payment-method" className="text-gray-300 text-sm block mb-2">Method</label>
                  <select
                    id="payment-method"
                    required
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({...paymentForm, method: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="CASH" className="text-gray-900">Cash</option>
                    <option value="CARD" className="text-gray-900">Card</option>
                    <option value="BANK_TRANSFER" className="text-gray-900">Bank Transfer</option>
                    <option value="EASYPAISA" className="text-gray-900">Easypaisa</option>
                    <option value="JAZZCASH" className="text-gray-900">JazzCash</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="payment-status" className="text-gray-300 text-sm block mb-2">Status</label>
                  <select
                    id="payment-status"
                    required
                    value={paymentForm.status}
                    onChange={(e) => setPaymentForm({...paymentForm, status: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value="PENDING" className="text-gray-900">Pending</option>
                    <option value="VERIFIED" className="text-gray-900">Verified</option>
                    <option value="REJECTED" className="text-gray-900">Rejected</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditPaymentModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading.editPayment}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {actionLoading.editPayment && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                  Update Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Payment Modal */}
      {showDeletePaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-red-900/90 to-pink-900/90 rounded-2xl p-6 w-full max-w-md border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Delete Payment</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete payment #{selectedPayment?.id?.slice(0, 8)}? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowDeletePaymentModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePayment}
                disabled={actionLoading.deletePayment}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading.deletePayment && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
