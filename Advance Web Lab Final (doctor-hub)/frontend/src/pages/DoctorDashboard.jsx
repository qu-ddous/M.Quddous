import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import { Card, CardContent, CardHeader } from '../components/Card';
import { appointmentService } from '../services/appointmentService';
import { prescriptionService } from '../services/prescriptionService';
import { doctorService } from '../services/doctorService';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState({});
  const startAction = (key) => setActionLoading(prev => ({ ...prev, [key]: true }));
  const stopAction = (key) => setActionLoading(prev => ({ ...prev, [key]: false }));

  // Dropdown states
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Modal states
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Form states
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: '',
    medication: '',
    dosage: '',
    duration: '',
    instructions: ''
  });

  const [availabilityForm, setAvailabilityForm] = useState({
    date: '',
    startTime: '',
    endTime: ''
  });

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    specialization: '',
    experience: '',
    qualification: '',
    fee: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user?.doctor) {
      setProfileForm({
        fullName: user.doctor.fullName || '',
        phone: user.doctor.phone || '',
        specialization: user.doctor.specialization || '',
        experience: user.doctor.experience || '',
        qualification: user.doctor.qualification || '',
        fee: user.doctor.fee || '',
        about: user.doctor.about || ''
      });
    }
  }, [user]);

  // React Query — cached data fetching
  const { data: appointments = [], isLoading: aptsLoading } = useQuery({
    queryKey: ['doctor-appointments'],
    queryFn: appointmentService.getAppointments,
  });

  const { data: prescriptions = [], isLoading: prescsLoading } = useQuery({
    queryKey: ['doctor-prescriptions', user?.doctor?.id],
    queryFn: () => prescriptionService.getPrescriptionsByDoctor(user.doctor.id),
    enabled: !!user?.doctor?.id,
  });

  const { data: availability = [], isLoading: availLoading } = useQuery({
    queryKey: ['doctor-availability', user?.doctor?.id],
    queryFn: () => doctorService.getDoctorAvailability(user.doctor.id),
    enabled: !!user?.doctor?.id,
  });

  const loading = aptsLoading || prescsLoading || availLoading;

  // Appointment handlers
  const handleApproveAppointment = async (appointmentId) => {
    const key = `approve_${appointmentId}`;
    if (actionLoading[key]) return;
    startAction(key);
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, 'CONFIRMED');
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      toast.success('Appointment approved ✅');
    } catch {
      toast.error('Failed to approve appointment');
    } finally { stopAction(key); }
  };

  const handleRejectAppointment = async (appointmentId) => {
    const key = `reject_${appointmentId}`;
    if (actionLoading[key]) return;
    startAction(key);
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, 'CANCELLED');
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      toast.success('Appointment cancelled');
    } catch {
      toast.error('Failed to reject appointment');
    } finally { stopAction(key); }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    const key = `complete_${appointmentId}`;
    if (actionLoading[key]) return;
    startAction(key);
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, 'COMPLETED');
      queryClient.invalidateQueries({ queryKey: ['doctor-appointments'] });
      toast.success('Appointment marked as completed 🎉');
    } catch {
      toast.error('Failed to complete appointment');
    } finally { stopAction(key); }
  };

  // Prescription handlers
  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (actionLoading.prescription) return;
    startAction('prescription');
    try {
      await prescriptionService.createPrescription({
        ...prescriptionForm,
        doctorId: user?.doctor?.id,
        appointmentId: selectedAppointment?.id,
      });
      queryClient.invalidateQueries({ queryKey: ['doctor-prescriptions', user?.doctor?.id] });
      setShowPrescriptionModal(false);
      setPrescriptionForm({ patientId: '', medication: '', dosage: '', duration: '', instructions: '' });
      toast.success('Prescription created successfully 💊');
    } catch {
      toast.error('Failed to create prescription');
    } finally { stopAction('prescription'); }
  };

  // Availability handlers
  const handleAddAvailability = async (e) => {
    e.preventDefault();
    if (actionLoading.availability) return;
    startAction('availability');
    try {
      await doctorService.setDoctorAvailability(user?.doctor?.id, {
        date: availabilityForm.date,
        timeSlots: [`${availabilityForm.startTime} - ${availabilityForm.endTime}`],
      });
      queryClient.invalidateQueries({ queryKey: ['doctor-availability', user?.doctor?.id] });
      setAvailabilityForm({ date: '', startTime: '', endTime: '' });
      toast.success('Availability slot added 📅');
    } catch {
      toast.error('Failed to add availability');
    } finally { stopAction('availability'); }
  };

  // Profile handlers
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (actionLoading.profile) return;
    startAction('profile');
    try {
      await doctorService.updateDoctorProfile(user?.doctor?.id, profileForm);
      toast.success('Profile updated successfully ✨');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      stopAction('profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (actionLoading.password) return;
    startAction('password');
    try {
      await doctorService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Password changed successfully 🔒');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast.error('Failed to change password');
    } finally {
      stopAction('password');
    }
  };

  const openPrescriptionModal = (appointment) => {
    setSelectedAppointment(appointment);
    setPrescriptionForm({
      patientId: appointment.patientId,
      medication: '',
      dosage: '',
      duration: '',
      instructions: ''
    });
    setShowPrescriptionModal(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;
  }

  const todayAppointments = appointments.filter(
    (apt) => new Date(apt.date).toDateString() === new Date().toDateString()
  );

  const pendingAppointments = appointments.filter((apt) => apt.status === 'PENDING');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/doctor/schedule') return 'Schedule';
    if (path === '/doctor/appointments') return 'Appointments';
    if (path === '/doctor/patients') return 'Patients';
    if (path === '/doctor/prescriptions') return 'Prescriptions';
    if (path === '/doctor/profile') return 'Profile';
    return 'Dashboard';
  };

  const renderContent = () => {
    const currentPage = getCurrentPage();

    if (currentPage === 'Schedule') {
      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Manage Schedule</h2>
          
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
              <div className="text-2xl font-bold text-white">{todayAppointments.length}</div>
              <div className="text-sm text-gray-200">Today's Appointments</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{appointments.filter(a => a.status === 'CONFIRMED').length}</div>
              <div className="text-sm text-gray-200">Upcoming</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">5</div>
              <div className="text-sm text-gray-200">Available Slots</div>
            </div>
            <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                  <polyline points="12 18 12 18 16 20"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">6</div>
              <div className="text-sm text-gray-200">Working Days</div>
            </div>
          </div>

          {/* Add Availability */}
          <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Add Availability</h3>
            <form onSubmit={handleAddAvailability} className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-gray-300 text-sm block mb-2">Date</label>
                <input 
                  type="date" 
                  value={availabilityForm.date}
                  onChange={(e) => setAvailabilityForm({...availabilityForm, date: e.target.value})}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400" 
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm block mb-2">Start Time</label>
                <input 
                  type="time" 
                  value={availabilityForm.startTime}
                  onChange={(e) => setAvailabilityForm({...availabilityForm, startTime: e.target.value})}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400" 
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm block mb-2">End Time</label>
                <input 
                  type="time" 
                  value={availabilityForm.endTime}
                  onChange={(e) => setAvailabilityForm({...availabilityForm, endTime: e.target.value})}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400" 
                />
              </div>
              <div className="md:col-span-3">
                <button 
                  type="submit"
                  disabled={actionLoading.availability}
                  className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {actionLoading.availability ? 'Adding Slot...' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>

          {/* Weekly Schedule */}
          <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Weekly Schedule</h3>
            <div className="grid md:grid-cols-7 gap-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                const dayAvailability = availability.filter(a => {
                  const date = new Date(a.date);
                  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  return dayNames[date.getDay()] === day;
                });
                return (
                  <div key={day} className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-white font-medium mb-2">{day}</div>
                    {dayAvailability.length > 0 ? (
                      <>
                        <div className="text-sm text-green-400">
                          {dayAvailability[0].timeSlots?.[0] || 'Available'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{dayAvailability.length} slots</div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-400">Not set</div>
                        <div className="text-xs text-gray-500 mt-1">0 slots</div>
                      </>
                    )}
                  </div>
                );
              })}
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
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{appointments.filter(a => a.status === 'COMPLETED').length}</div>
              <div className="text-sm text-gray-200">Completed</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20 mb-6">
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
                <option value="COMPLETED" className="text-gray-900">Completed</option>
                <option value="CANCELLED" className="text-gray-900">Cancelled</option>
              </select>
              <input
                type="date"
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          {/* Appointments List */}
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/20">
                    <th className="pb-3 text-gray-300 font-medium">Appointment ID</th>
                    <th className="pb-3 text-gray-300 font-medium">Patient</th>
                    <th className="pb-3 text-gray-300 font-medium">Date</th>
                    <th className="pb-3 text-gray-300 font-medium">Time</th>
                    <th className="pb-3 text-gray-300 font-medium">Reason</th>
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
                        <td className="py-4 text-gray-300">{apt.patient?.fullName || 'N/A'}</td>
                        <td className="py-4 text-gray-300">{new Date(apt.date).toLocaleDateString()}</td>
                        <td className="py-4 text-gray-300">{apt.timeSlot || 'N/A'}</td>
                        <td className="py-4 text-gray-300">{apt.reason || 'N/A'}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 text-xs rounded-full ${
                            apt.status === 'CONFIRMED' ? 'bg-green-500/30 text-green-300' :
                            apt.status === 'PENDING' ? 'bg-yellow-500/30 text-yellow-300' :
                            apt.status === 'COMPLETED' ? 'bg-blue-500/30 text-blue-300' :
                            'bg-red-500/30 text-red-300'
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
                            {apt.status === 'CONFIRMED' && (
                              <button 
                                onClick={() => handleCompleteAppointment(apt.id)}
                                className="p-2 bg-blue-500/20 hover:bg-blue-500/40 rounded-lg text-blue-400 transition-colors"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              </button>
                            )}
                            <button 
                              onClick={() => openPrescriptionModal(apt)}
                              className="p-2 bg-green-500/20 hover:bg-green-500/40 rounded-lg text-green-400 transition-colors"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10 9 9 9 8 9"/>
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

    if (currentPage === 'Patients') {
      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">My Patients</h2>
          
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
              <div className="text-2xl font-bold text-white">12</div>
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
                    <th className="pb-3 text-gray-300 font-medium">Last Visit</th>
                    <th className="pb-3 text-gray-300 font-medium">Next Appointment</th>
                    <th className="pb-3 text-gray-300 font-medium">Status</th>
                    <th className="pb-3 text-gray-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-300">No patients found</td>
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
                              <div className="text-sm text-gray-400">{apt.patient?.email || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
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

    if (currentPage === 'Prescriptions') {
      return (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Prescriptions</h2>
          
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{prescriptions.length}</div>
              <div className="text-sm text-gray-200">Total Prescriptions</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{prescriptions.filter(p => {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                return new Date(p.createdAt) >= oneWeekAgo;
              }).length}</div>
              <div className="text-sm text-gray-200">This Week</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{prescriptions.filter(p => p.status === 'PENDING').length}</div>
              <div className="text-sm text-gray-200">Pending</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
              <div className="icon-3d mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </div>
              <div className="text-2xl font-bold text-white">{prescriptions.filter(p => p.status === 'COMPLETED').length}</div>
              <div className="text-sm text-gray-200">Completed</div>
            </div>
          </div>

          {/* Add New Prescription */}
          <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Prescription</h3>
            <form onSubmit={handleCreatePrescription} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-300 text-sm block mb-2">Patient</label>
                <select 
                  value={prescriptionForm.patientId}
                  onChange={(e) => setPrescriptionForm({...prescriptionForm, patientId: e.target.value})}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="" className="text-gray-900">Select Patient</option>
                  {appointments.slice(0, 5).map((apt) => (
                    <option key={apt.id} value={apt.patient?.id} className="text-gray-900">{apt.patient?.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-300 text-sm block mb-2">Medication</label>
                <input 
                  type="text" 
                  placeholder="Enter medication name"
                  value={prescriptionForm.medication}
                  onChange={(e) => setPrescriptionForm({...prescriptionForm, medication: e.target.value})}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400" 
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm block mb-2">Dosage</label>
                <input 
                  type="text" 
                  placeholder="e.g., 500mg twice daily"
                  value={prescriptionForm.dosage}
                  onChange={(e) => setPrescriptionForm({...prescriptionForm, dosage: e.target.value})}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400" 
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm block mb-2">Duration</label>
                <input 
                  type="text" 
                  placeholder="e.g., 7 days"
                  value={prescriptionForm.duration}
                  onChange={(e) => setPrescriptionForm({...prescriptionForm, duration: e.target.value})}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-gray-300 text-sm block mb-2">Instructions</label>
                <textarea 
                  placeholder="Additional instructions..."
                  rows="3"
                  value={prescriptionForm.instructions}
                  onChange={(e) => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div className="md:col-span-2">
                <button 
                  type="submit"
                  disabled={actionLoading.prescription}
                  className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {actionLoading.prescription ? 'Creating...' : 'Create Prescription'}
                </button>
              </div>
            </form>
          </div>

          {/* Recent Prescriptions */}
          <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Prescriptions</h3>
            <div className="space-y-4">
              {prescriptions.length === 0 ? (
                <div className="text-center text-gray-400 py-8">No prescriptions found</div>
              ) : (
                prescriptions.slice(0, 5).map((prescription) => (
                  <div key={prescription.id} className="p-4 bg-white/10 rounded-xl border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-white">Prescription #{prescription.id}</div>
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        prescription.status === 'COMPLETED' ? 'bg-green-500/30 text-green-300' :
                        prescription.status === 'PENDING' ? 'bg-yellow-500/30 text-yellow-300' :
                        'bg-gray-500/30 text-gray-300'
                      }`}>
                        {prescription.status || 'Completed'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300 mb-1">Patient: {prescription.appointment?.patient?.fullName || 'N/A'}</div>
                    <div className="text-sm text-gray-300 mb-1">Medication: {prescription.diagnosis || 'N/A'}</div>
                    <div className="text-sm text-gray-400">Date: {new Date(prescription.createdAt).toLocaleDateString()}</div>
                  </div>
                ))
              )}
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
                  {user?.doctor?.fullName?.charAt(0) || 'D'}
                </div>
                <h3 className="text-xl font-semibold text-white">{user?.doctor?.fullName || 'Doctor Name'}</h3>
                <p className="text-gray-400">{user?.doctor?.specialization || 'Specialization'}</p>
                <div className="mt-4 text-sm text-gray-300">
                  <div>Experience: {user?.doctor?.experience || 0} years</div>
                  <div>Email: {user?.email || 'doctor@example.com'}</div>
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
                    value={profileForm.fullName || user?.doctor?.fullName || ''}
                    onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400" 
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-2">Specialization</label>
                  <input 
                    type="text" 
                    value={profileForm.specialization || user?.doctor?.specialization || ''}
                    onChange={(e) => setProfileForm({...profileForm, specialization: e.target.value})}
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
                    value={profileForm.phone || user?.doctor?.phone || ''}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400" 
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-2">Experience (years)</label>
                  <input 
                    type="number" 
                    value={profileForm.experience || user?.doctor?.experience || 0}
                    onChange={(e) => setProfileForm({...profileForm, experience: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400" 
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-2">Consultation Fee</label>
                  <input 
                    type="number" 
                    value={profileForm.fee}
                    onChange={(e) => setProfileForm({...profileForm, fee: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-gray-300 text-sm block mb-2">Bio</label>
                  <textarea 
                    placeholder="Write about yourself..."
                    rows="3"
                    value={profileForm.about}
                    onChange={(e) => setProfileForm({...profileForm, about: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
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

            {/* Change Password */}
            <div className="md:col-span-3 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
              <form onSubmit={handleChangePassword}>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-gray-300 text-sm block mb-2">Current Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter current password" 
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400" 
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm block mb-2">New Password</label>
                    <input 
                      type="password" 
                      placeholder="Enter new password" 
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400" 
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm block mb-2">Confirm New Password</label>
                    <input 
                      type="password" 
                      placeholder="Confirm new password" 
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400" 
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={actionLoading.password}
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {actionLoading.password ? 'Updating...' : 'Update Password'}
                </button>
              </form>
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
            {getGreeting()}, Dr. {user?.doctor?.fullName || 'Doctor'}!
          </h1>
          <p className="text-gray-400 mt-2">Manage your appointments and patients</p>
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
              {todayAppointments.length}
            </div>
            <div className="text-sm text-gray-200">Today's Appointments</div>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
            <div className="icon-3d mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="text-2xl font-bold text-white">
              {pendingAppointments.length}
            </div>
            <div className="text-sm text-gray-200">Pending Requests</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
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
          <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-6 text-center shadow-2xl hover:scale-105 transition-transform">
            <div className="icon-3d mb-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 mx-auto text-white">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div className="text-2xl font-bold text-white">
              Rs. {appointments.filter(a => a.status === 'COMPLETED').length * (user?.doctor?.fee || 500).toLocaleString()}
            </div>
            <div className="text-sm text-gray-200">Total Earnings</div>
          </div>
        </div>

        {/* Trending Graphs */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <h2 className="text-lg font-semibold text-white mb-3">Appointments Trend</h2>
            <p className="text-gray-400 text-sm">Chart feature coming soon</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <h2 className="text-lg font-semibold text-white mb-3">Revenue Trend</h2>
            <p className="text-gray-400 text-sm">Chart feature coming soon</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Today's Schedule */}
          <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">
              Today's Schedule
            </h2>
            {todayAppointments.length === 0 ? (
              <p className="text-gray-300 text-center py-4">
                No appointments today
              </p>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 bg-white/10 rounded-xl border border-white/20"
                  >
                    <div className="font-medium text-white">
                      {appointment.patient?.fullName || 'Patient Name'}
                    </div>
                    <div className="text-sm text-gray-300">
                      {appointment.timeSlot}
                    </div>
                    <div className="flex items-center mt-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
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
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Requests */}
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">
              Pending Appointment Requests
            </h2>
            {pendingAppointments.length === 0 ? (
              <p className="text-gray-300 text-center py-4">
                No pending requests
              </p>
            ) : (
              <div className="space-y-4">
                {pendingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 bg-white/10 rounded-xl border border-white/20"
                  >
                    <div className="font-medium text-white">
                      {appointment.patient?.fullName || 'Patient Name'}
                    </div>
                    <div className="text-sm text-gray-300">
                      {new Date(appointment.date).toLocaleDateString()} at {appointment.timeSlot}
                    </div>
                    <div className="text-sm text-gray-300 mt-1">
                      {appointment.reason || 'Consultation'}
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <Button size="sm" variant="primary" className="bg-green-500 hover:bg-green-600">
                        Accept
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
        </div>

        {/* Upcoming Appointments */}
        <div className="mt-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 backdrop-blur-lg border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">
            Upcoming Appointments
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-white/20">
                  <th className="pb-3 text-gray-300 font-medium">Patient</th>
                  <th className="pb-3 text-gray-300 font-medium">Date</th>
                  <th className="pb-3 text-gray-300 font-medium">Time</th>
                  <th className="pb-3 text-gray-300 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.filter(a => a.status === 'CONFIRMED').slice(0, 5).map((apt) => (
                  <tr key={apt.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-4 text-gray-300">{apt.patient?.fullName || 'N/A'}</td>
                    <td className="py-4 text-gray-300">{new Date(apt.date).toLocaleDateString()}</td>
                    <td className="py-4 text-gray-300">{apt.timeSlot}</td>
                    <td className="py-4">
                      <span className="px-3 py-1 text-xs rounded-full bg-green-500/30 text-green-300">
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Bar */}
      <header className="bg-gradient-to-b from-green-900/50 to-teal-900/50 backdrop-blur-lg border-b border-white/10 px-8 py-3">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Doctor Dashboard</h1>
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
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">5</span>
              </button>
              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-white/10">
                    <h3 className="text-white font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/10">
                      <p className="text-white text-sm">New appointment request from John Doe</p>
                      <p className="text-gray-400 text-xs mt-1">5 minutes ago</p>
                    </div>
                    <div className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/10">
                      <p className="text-white text-sm">Patient canceled appointment</p>
                      <p className="text-gray-400 text-xs mt-1">15 minutes ago</p>
                    </div>
                    <div className="p-3 hover:bg-white/10 cursor-pointer">
                      <p className="text-white text-sm">Prescription refill request</p>
                      <p className="text-gray-400 text-xs mt-1">1 hour ago</p>
                    </div>
                  </div>
                  <div className="p-3 border-t border-white/10">
                    <button className="w-full text-green-400 hover:text-green-300 text-sm">View All Notifications</button>
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
                <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  D
                </div>
                <span className="text-white font-medium text-sm">Dr. {user?.doctor?.fullName || 'Doctor'}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-white">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-xl z-50">
                  <div className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/10">
                    <Link to="/doctor/profile" className="text-white text-sm">Profile</Link>
                  </div>
                  <div className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/10">
                    <Link to="/doctor/settings" className="text-white text-sm">Settings</Link>
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
        <aside className="bg-gradient-to-b from-green-900/50 to-teal-900/50 w-64 min-h-screen p-6 border-r border-white/10 backdrop-blur-lg sticky top-0 h-screen overflow-y-auto">
        <div className="flex items-center space-x-2 mb-8">
          <div className="icon-3d">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 text-purple-400">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Doctor Hub</span>
        </div>
        
        <nav className="space-y-2">
          <Link to="/doctor/dashboard" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/doctor/dashboard' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span>Dashboard</span>
          </Link>
          <Link to="/doctor/schedule" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/doctor/schedule' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <span>Schedule</span>
          </Link>
          <Link to="/doctor/appointments" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/doctor/appointments' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <span>Appointments</span>
          </Link>
          <Link to="/doctor/patients" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/doctor/patients' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
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
          <Link to="/doctor/prescriptions" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/doctor/prescriptions' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <div className="icon-3d">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <span>Prescriptions</span>
          </Link>
          <Link to="/doctor/profile" className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${location.pathname === '/doctor/profile' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
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

      {/* Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-green-900/90 to-teal-900/90 rounded-2xl p-6 w-full max-w-2xl border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Create Prescription</h3>
            <form onSubmit={handleCreatePrescription} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm block mb-2">Patient</label>
                  <input
                    type="text"
                    value={appointments.find(a => a.id === selectedAppointment?.id)?.patient?.fullName || ''}
                    disabled
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-2">Medication</label>
                  <input
                    type="text"
                    value={prescriptionForm.medication}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, medication: e.target.value})}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-2">Dosage</label>
                  <input
                    type="text"
                    value={prescriptionForm.dosage}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, dosage: e.target.value})}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm block mb-2">Duration</label>
                  <input
                    type="text"
                    value={prescriptionForm.duration}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, duration: e.target.value})}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-300 text-sm block mb-2">Instructions</label>
                <textarea
                  value={prescriptionForm.instructions}
                  onChange={(e) => setPrescriptionForm({...prescriptionForm, instructions: e.target.value})}
                  rows="3"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowPrescriptionModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                 <button
                  type="submit"
                  disabled={actionLoading.prescription}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {actionLoading.prescription ? 'Creating...' : 'Create Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
