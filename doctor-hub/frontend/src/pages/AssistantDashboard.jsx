import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import { Card, CardContent, CardHeader } from '../components/Card';
import { paymentService } from '../services/paymentService';
import { appointmentService } from '../services/appointmentService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const AssistantDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState({});
  const startAction = (k) => setActionLoading(p => ({ ...p, [k]: true }));
  const stopAction = (k) => setActionLoading(p => ({ ...p, [k]: false }));

  // Dropdown states
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    department: ''
  });

  // React Query - cached data fetching
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['assistant-payments'],
    queryFn: paymentService.getPayments,
  });

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['assistant-appointments'],
    queryFn: appointmentService.getAppointments,
  });

  const loading = paymentsLoading || appointmentsLoading;

  // Socket.io for real-time updates — invalidates cache instead of re-fetching manually
  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5000';
    const socket = io(SOCKET_URL);

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['assistant-payments'] });
      queryClient.invalidateQueries({ queryKey: ['assistant-appointments'] });
    };

    socket.on('new_appointment', invalidate);
    socket.on('appointment_updated', invalidate);
    socket.on('new_payment', invalidate);
    socket.on('payment_updated', invalidate);

    return () => socket.disconnect();
  }, [queryClient]);

  // Appointment handlers
  const handleVerifyAppointment = async (appointmentId) => {
    const key = `verify_apt_${appointmentId}`;
    if (actionLoading[key]) return;
    startAction(key);
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, 'CONFIRMED');
      queryClient.invalidateQueries({ queryKey: ['assistant-appointments'] });
      toast.success('Appointment verified ✅');
    } catch (error) {
      console.error('Failed to verify appointment:', error);
      toast.error('Failed to verify appointment');
    } finally {
      stopAction(key);
    }
  };

  // Payment handlers
  const handleVerifyPayment = async (paymentId, status) => {
    const key = `verify_pay_${paymentId}_${status}`;
    if (actionLoading[key]) return;
    startAction(key);
    try {
      await paymentService.verifyPayment(paymentId, status);
      queryClient.invalidateQueries({ queryKey: ['assistant-payments'] });
      toast.success(status === 'VERIFIED' ? 'Payment verified ✅' : 'Payment rejected');
    } catch (error) {
      console.error('Failed to verify payment:', error);
      toast.error('Failed to verify payment');
    } finally {
      stopAction(key);
    }
  };

  // Profile handlers
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (actionLoading.profile) return;
    startAction('profile');
    try {
      const { default: api } = await import('../services/api');
      await api.put('/assistants/profile', profileForm);
      toast.success('Profile updated ✨');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      stopAction('profile');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;
  }

  const pendingPayments = payments.filter((p) => p.status === 'PENDING');
  const todayBookings = appointments.filter(
    (apt) => new Date(apt.date).toDateString() === new Date().toDateString()
  );

  // Chart data
  const paymentsChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Payments (PKR)',
        data: [15000, 22000, 18000, 28000, 25000, 35000],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const bookingsChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Bookings',
        data: [12, 19, 15, 25, 22, 30],
        backgroundColor: 'rgba(236, 72, 153, 0.7)',
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
      y: {
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/assistant/payments') return 'Payments';
    if (path === '/assistant/bookings') return 'Bookings';
    if (path === '/assistant/patients') return 'Patients';
    if (path === '/assistant/profile') return 'Profile';
    return 'Dashboard';
  };

  const renderContent = () => {
    const currentPage = getCurrentPage();

    if (currentPage === 'Payments') {
      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Manage Payments</h2>
          
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{payments.length}</div>
              <div className="text-sm text-gray-200">Total Payments</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{payments.filter(p => p.status === 'VERIFIED').length}</div>
              <div className="text-sm text-gray-200">Verified</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{pendingPayments.length}</div>
              <div className="text-sm text-gray-200">Pending</div>
            </div>
            <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">Rs. {payments.filter(p => p.status === 'VERIFIED').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</div>
              <div className="text-sm text-gray-200">Total Verified</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20 mb-6">
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
                <option value="EASYPAISA" className="text-gray-900">Easypaisa</option>
                <option value="JAZZCASH" className="text-gray-900">JazzCash</option>
              </select>
            </div>
          </div>

          {/* Payments List */}
          <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/20">
                    <th className="pb-3 text-gray-300 font-medium">Payment ID</th>
                    <th className="pb-3 text-gray-300 font-medium">Patient</th>
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
                      <td colSpan="7" className="py-8 text-center text-gray-300">No payments found</td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-4 text-gray-300">#{payment.id.slice(0, 8)}</td>
                        <td className="py-4 text-gray-300">{payment.patient?.fullName || 'N/A'}</td>
                        <td className="py-4 text-gray-300">Rs. {payment.amount}</td>
                        <td className="py-4 text-gray-300">{payment.method}</td>
                        <td className="py-4 text-gray-300">{new Date(payment.date).toLocaleDateString()}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 text-xs rounded-full ${
                            payment.status === 'VERIFIED' ? 'bg-green-500/30 text-green-300' :
                            payment.status === 'PENDING' ? 'bg-yellow-500/30 text-yellow-300' :
                            'bg-red-500/30 text-red-300'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-4">
                          {payment.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <button onClick={() => handleVerifyPayment(payment.id, 'VERIFIED')} className="p-2 bg-green-500/20 hover:bg-green-500/40 rounded-lg text-green-400 transition-colors">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              </button>
                              <button onClick={() => handleVerifyPayment(payment.id, 'REJECTED')} className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400 transition-colors">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                  <line x1="18" y1="6" x2="6" y2="18"/>
                                  <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              </button>
                            </div>
                          )}
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

    if (currentPage === 'Bookings') {
      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Manage Bookings</h2>
          
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{appointments.length}</div>
              <div className="text-sm text-gray-200">Total Bookings</div>
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
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                  <polyline points="12 18 12 18 16 20"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{todayBookings.length}</div>
              <div className="text-sm text-gray-200">Today's Bookings</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search bookings..."
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

          {/* Bookings List */}
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/20">
                    <th className="pb-3 text-gray-300 font-medium">Booking ID</th>
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
                      <td colSpan="7" className="py-8 text-center text-gray-300">No bookings found</td>
                    </tr>
                  ) : (
                    appointments.map((apt) => (
                      <tr key={apt.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-4 text-gray-300">#{apt.id.slice(0, 8)}</td>
                        <td className="py-4 text-gray-300">{apt.patient?.fullName || 'N/A'}</td>
                        <td className="py-4 text-gray-300">Dr. {apt.doctor?.fullName || 'N/A'}</td>
                        <td className="py-4 text-gray-300">{new Date(apt.date).toLocaleDateString()}</td>
                        <td className="py-4 text-gray-300">{apt.timeSlot}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 text-xs rounded-full ${
                            apt.status === 'CONFIRMED' ? 'bg-green-500/30 text-green-300' :
                            apt.status === 'PENDING' ? 'bg-yellow-500/30 text-yellow-300' :
                            apt.status === 'CANCELLED' ? 'bg-red-500/30 text-red-300' :
                            'bg-blue-500/30 text-blue-300'
                          }`}>
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
                            {apt.status === 'PENDING' && (
                              <>
                                <button 
                                  onClick={() => handleVerifyAppointment(apt.id)}
                                  className="p-2 bg-green-500/20 hover:bg-green-500/40 rounded-lg text-green-400 transition-colors"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                    <polyline points="20 6 9 17 4 12"/>
                                  </svg>
                                </button>
                                <button className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400 transition-colors">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                  </svg>
                                </button>
                              </>
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

    if (currentPage === 'Patients') {
      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Patients List</h2>
          
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
              <div className="text-2xl font-bold text-white">{appointments.length}</div>
              <div className="text-sm text-gray-200">Total Patients</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{appointments.filter(a => a.status === 'COMPLETED').length}</div>
              <div className="text-sm text-gray-200">Completed Visits</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{appointments.filter(a => a.status === 'CONFIRMED').length}</div>
              <div className="text-sm text-gray-200">Upcoming Visits</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">15</div>
              <div className="text-sm text-gray-200">New This Month</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search patients..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <select className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400">
                <option value="" className="text-gray-900">All Patients</option>
                <option value="recent" className="text-gray-900">Recent</option>
                <option value="upcoming" className="text-gray-900">Upcoming</option>
                <option value="completed" className="text-gray-900">Completed</option>
              </select>
            </div>
          </div>

          {/* Patients List */}
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/20">
                    <th className="pb-3 text-gray-300 font-medium">Patient</th>
                    <th className="pb-3 text-gray-300 font-medium">Email</th>
                    <th className="pb-3 text-gray-300 font-medium">Last Visit</th>
                    <th className="pb-3 text-gray-300 font-medium">Next Appointment</th>
                    <th className="pb-3 text-gray-300 font-medium">Status</th>
                    <th className="pb-3 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-300">No patients found</td>
                    </tr>
                  ) : (
                    appointments.map((apt) => (
                      <tr key={apt.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                              {apt.patient?.fullName?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <div className="font-medium text-white">{apt.patient?.fullName || 'N/A'}</div>
                              <div className="text-sm text-gray-400">{apt.patient?.phone || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-gray-300">{apt.patient?.email || 'N/A'}</td>
                        <td className="py-4 text-gray-300">{new Date(apt.date).toLocaleDateString()}</td>
                        <td className="py-4 text-gray-300">{apt.status === 'CONFIRMED' ? new Date(apt.date).toLocaleDateString() : 'N/A'}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 text-xs rounded-full ${
                            apt.status === 'CONFIRMED' ? 'bg-green-500/30 text-green-300' :
                            apt.status === 'PENDING' ? 'bg-yellow-500/30 text-yellow-300' :
                            'bg-gray-500/30 text-gray-300'
                          }`}>
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
                            <button className="p-2 bg-purple-500/20 hover:bg-purple-500/40 rounded-lg text-purple-400 transition-colors">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
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

    if (currentPage === 'Profile') {
      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">My Profile</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.assistant?.fullName?.charAt(0) || 'A'}
                </div>
                <h3 className="text-xl font-semibold text-white">{user?.assistant?.fullName || 'Assistant Name'}</h3>
                <p className="text-gray-400">Assistant</p>
                <div className="mt-4 text-sm text-gray-300">
                  <div>Email: {user?.email || 'assistant@example.com'}</div>
                  <div>Phone: +92 300 1234567</div>
                </div>
              </div>
            </div>

            {/* Edit Profile */}
            <div className="md:col-span-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Edit Profile</h3>
              <form onSubmit={handleUpdateProfile} className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm block mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={profileForm.fullName || user?.assistant?.fullName || ''}
                    onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400" 
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-2">Email</label>
                  <input 
                    type="email" 
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400" 
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-2">Phone</label>
                  <input 
                    type="tel" 
                    placeholder="+92 300 1234567"
                    value={profileForm.phone || user?.assistant?.phone || ''}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400" 
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-2">Department</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Reception"
                    value={profileForm.department || user?.assistant?.department || ''}
                    onChange={(e) => setProfileForm({...profileForm, department: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400" 
                  />
                </div>
              </form>
              <div className="mt-4">
                <label className="text-gray-300 text-sm block mb-2">Bio</label>
                <textarea 
                  placeholder="Write about yourself..." 
                  rows="3"
                  value={profileForm.about || user?.assistant?.about || ''}
                  onChange={(e) => setProfileForm({...profileForm, about: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <button 
                onClick={handleUpdateProfile}
                className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>

            {/* Change Password */}
            <div className="md:col-span-3 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-300 text-sm block mb-2">Current Password</label>
                  <input type="password" placeholder="Enter current password" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-2">New Password</label>
                  <input type="password" placeholder="Enter new password" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-2">Confirm New Password</label>
                  <input type="password" placeholder="Confirm new password" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
              </div>
              <button className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors">
                Update Password
              </button>
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
            {getGreeting()}, {user?.assistant?.fullName || 'Assistant'}!
          </h1>
          <p className="text-gray-400 mt-2">Manage payments and bookings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
            <div className="icon-3d mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <div className="text-2xl font-bold text-white">
              {pendingPayments.length}
            </div>
            <div className="text-sm text-gray-200">Pending Payments</div>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
            <div className="icon-3d mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="text-2xl font-bold text-white">
              {todayBookings.length}
            </div>
            <div className="text-sm text-gray-200">Today's Bookings</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
            <div className="icon-3d mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="text-2xl font-bold text-white">
              {payments.filter((p) => p.status === 'VERIFIED').length}
            </div>
            <div className="text-sm text-gray-200">Verified Payments</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
            <div className="icon-3d mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="text-2xl font-bold text-white">
              {appointments.length}
            </div>
            <div className="text-sm text-gray-200">Total Appointments</div>
          </div>
        </div>

        {/* Trending Graphs */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-4 backdrop-blur-lg border border-white/20">
            <h2 className="text-lg font-semibold text-white mb-3">Payments Trend</h2>
            <Line data={paymentsChartData} options={chartOptions} />
          </div>
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-4 backdrop-blur-lg border border-white/20">
            <h2 className="text-lg font-semibold text-white mb-3">Bookings Trend</h2>
            <Bar data={bookingsChartData} options={chartOptions} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Pending Payments */}
          <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">
              Pending Payments
            </h2>
            {pendingPayments.length === 0 ? (
              <p className="text-gray-300 text-center py-4">
                No pending payments
              </p>
            ) : (
              <div className="space-y-4">
                {pendingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 bg-white/10 rounded-xl border border-white/20"
                  >
                    <div className="font-medium text-white">
                      {payment.patient?.fullName || 'Patient Name'}
                    </div>
                    <div className="text-sm text-gray-300">
                      Rs. {payment.amount} - {payment.method}
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <Button
                        size="sm"
                        variant="primary"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => handleVerifyPayment(payment.id, 'VERIFIED')}
                      >
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => handleVerifyPayment(payment.id, 'REJECTED')}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Bookings */}
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">
              Today's Bookings
            </h2>
            {todayBookings.length === 0 ? (
              <p className="text-gray-300 text-center py-4">
                No bookings today
              </p>
            ) : (
              <div className="space-y-4">
                {todayBookings.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 bg-white/10 rounded-xl border border-white/20"
                  >
                    <div className="font-medium text-white">
                      {appointment.patient?.fullName || 'Patient Name'}
                    </div>
                    <div className="text-sm text-gray-300">
                      Dr. {appointment.doctor?.fullName || 'Doctor Name'}
                    </div>
                    <div className="text-sm text-gray-300">
                      {appointment.timeSlot}
                    </div>
                    <span
                      className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                        appointment.status === 'CONFIRMED'
                          ? 'bg-green-500/30 text-green-300'
                          : appointment.status === 'PENDING'
                          ? 'bg-yellow-500/30 text-yellow-300'
                          : 'bg-gray-500/30 text-gray-300'
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
          <h1 className="text-xl font-bold text-white">Assistant Dashboard</h1>
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
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">4</span>
              </button>
              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-white/10">
                    <h3 className="text-white font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/10">
                      <p className="text-white text-sm">New payment verification request</p>
                      <p className="text-gray-400 text-xs mt-1">3 minutes ago</p>
                    </div>
                    <div className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/10">
                      <p className="text-white text-sm">Booking cancellation request</p>
                      <p className="text-gray-400 text-xs mt-1">10 minutes ago</p>
                    </div>
                    <div className="p-3 hover:bg-white/10 cursor-pointer">
                      <p className="text-white text-sm">Patient inquiry received</p>
                      <p className="text-gray-400 text-xs mt-1">30 minutes ago</p>
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
                  A
                </div>
                <span className="text-white font-medium text-sm">{user?.assistant?.fullName || 'Assistant'}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-white">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl z-50">
                  <div className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/10">
                    <Link to="/assistant/profile" className="text-white text-sm">Profile</Link>
                  </div>
                  <div className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/10">
                    <Link to="/assistant/settings" className="text-white text-sm">Settings</Link>
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
          <Link to="/assistant/dashboard" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/assistant/dashboard' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span>Dashboard</span>
          </Link>
          <Link to="/assistant/payments" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/assistant/payments' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <span>Payments</span>
          </Link>
          <Link to="/assistant/bookings" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/assistant/bookings' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <span>Bookings</span>
          </Link>
          <Link to="/assistant/patients" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/assistant/patients' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span>Patients</span>
          </Link>
          <Link to="/assistant/profile" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/assistant/profile' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-4.418 0-8 2-8 5v1h16v-1c0-3-3.582-5-8-5z"/>
              </svg>
            </div>
            <span>Profile</span>
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
    </div>
  );
};

export default AssistantDashboard;
