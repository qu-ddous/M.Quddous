import api from './api';

export const paymentService = {
  createPayment: async (data) => {
    const response = await api.post('/payments', data);
    return response.data;
  },

  getPayments: async () => {
    const response = await api.get('/payments');
    return response.data;
  },

  verifyPayment: async (id, status) => {
    const response = await api.put(`/payments/${id}/verify`, { status });
    return response.data;
  },

  updatePayment: async (id, data) => {
    const response = await api.put(`/payments/${id}`, data);
    return response.data;
  },

  deletePayment: async (id) => {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  },
};
