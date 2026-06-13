import api from './api';

export const messageService = {
  sendMessage: async (data) => {
    const response = await api.post('/messages', data);
    return response.data;
  },

  getMessages: async (otherUserId) => {
    const response = await api.get(`/messages/${otherUserId}`);
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/messages/${id}/read`);
    return response.data;
  },
};
