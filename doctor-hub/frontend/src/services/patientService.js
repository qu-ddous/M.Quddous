import api from './api';

export const patientService = {
  getPatientProfile: async () => {
    const response = await api.get('/patients/profile');
    return response.data;
  },

  updatePatientProfile: async (data) => {
    const response = await api.put('/patients/profile', data);
    return response.data;
  },

  uploadMedicalReport: async (data) => {
    const response = await api.post('/patients/reports', data);
    return response.data;
  },

  getMedicalReports: async () => {
    const response = await api.get('/patients/reports');
    return response.data;
  },
};
