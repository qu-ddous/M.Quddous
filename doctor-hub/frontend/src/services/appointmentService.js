import api from './api';

export const appointmentService = {
  createAppointment: async (data) => {
    const response = await api.post('/appointments', data);
    return response.data;
  },

  // Book appointment + upload payment proof in one request
  createAppointmentWithPayment: async (formData) => {
    const response = await api.post('/appointments/with-payment', formData);
    return response.data;
  },

  getAppointments: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },

  getAppointmentById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  updateAppointmentStatus: async (id, status) => {
    const response = await api.put(`/appointments/${id}/status`, { status });
    return response.data;
  },

  updateAppointment: async (id, data) => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  },

  deleteAppointment: async (id) => {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  },
};
