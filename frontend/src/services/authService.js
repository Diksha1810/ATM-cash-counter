import { apiClient } from './apiClient';
import { saveCachedUser, clearCachedUser, getCachedUser } from './offlineDb';

export const authService = {
  async register(email, password) {
    const data = await apiClient.post('/auth/register', { email, password });
    if (data?.user) {
      await saveCachedUser(data.user);
    }
    return data;
  },

  async login(email, password) {
    const data = await apiClient.post('/auth/login', { email, password });
    if (data?.user) {
      await saveCachedUser(data.user);
    }
    return data;
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      await clearCachedUser();
    }
  },

  async getMe() {
    try {
      const data = await apiClient.get('/auth/me');
      if (data?.user) {
        await saveCachedUser(data.user);
      }
      return data.user;
    } catch (error) {
      const cached = await getCachedUser();
      if (cached) return cached;
      throw error;
    }
  },
};
