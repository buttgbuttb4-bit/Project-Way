import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api/notifications';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const notificationApi = {
  // Get notifications for a specific group (shared by leader and members)
  getNotificationsByGroup: async (groupId, userName) => {
    try {
      const query = userName ? `?userName=${encodeURIComponent(userName)}` : '';
      const response = await api.get(`/group/${encodeURIComponent(groupId)}${query}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications for group:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId, userName) => {
    try {
      const response = await api.put(`/read/${notificationId}`, { userName });
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
};
