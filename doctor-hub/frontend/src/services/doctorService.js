import api from './api';

export const doctorService = {
  getAllDoctors: async (params = {}) => {
    const response = await api.get('/doctors', { params });
    return response.data;
  },

  getDoctorById: async (id) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },

  updateDoctorProfile: async (id, data) => {
    const response = await api.put(`/doctors/${id}`, data);
    return response.data;
  },

  getDoctorAvailability: async (doctorId, params = {}) => {
    const response = await api.get(`/doctors/${doctorId}/availability`, { params });
    return response.data;
  },

  setDoctorAvailability: async (doctorId, data) => {
    const response = await api.post(`/doctors/${doctorId}/availability`, data);
    return response.data;
  },

  createDoctor: async (data) => {
    const response = await api.post('/doctors', data);
    return response.data;
  },

  deleteDoctor: async (id) => {
    const response = await api.delete(`/doctors/${id}`);
    return response.data;
  },

  approveDoctor: async (id) => {
    const response = await api.put(`/doctors/${id}/approve`);
    return response.data;
  },

  getAllDoctorsAdmin: async () => {
    const response = await api.get('/doctors', { params: { includePending: true } });
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },
};
