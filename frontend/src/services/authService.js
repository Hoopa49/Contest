import api from './backendApi';

export const authService = {
  async login(credentials) {
    console.log('authService.login called with:', credentials);
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('authService.login response:', response);
      return response;
    } catch (error) {
      console.error('authService.login error:', error);
      throw error;
    }
  },

  async register(credentials) {
    return await api.post('/auth/register', credentials);
  },

  async getProfile() {
    return await api.get('/auth/profile');
  }
};

export default authService; 