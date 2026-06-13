import api from './api';

export const prescriptionService = {
  createPrescription: async (data) => {
    const response = await api.post('/prescriptions', data);
    return response.data;
  },

  getPrescriptionByAppointment: async (appointmentId) => {
    const response = await api.get(`/prescriptions/appointment/${appointmentId}`);
    return response.data;
  },

  getPrescriptionsByDoctor: async (doctorId) => {
    const response = await api.get(`/prescriptions/doctor/${doctorId}`);
    return response.data;
  },

  getPrescriptionsByPatient: async () => {
    const response = await api.get('/prescriptions/patient');
    return response.data;
  },
};
