import { defineStore } from 'pinia';
import api from '../services/backendApi';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role
  },

  actions: {
    async login(credentials) {
      try {
        const response = await api.post('/api/auth/login', credentials);
        this.setToken(response.data.token);
        await this.fetchUser();
        return null;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },

    async fetchUser() {
      try {
        const response = await api.get('/api/auth/profile');
        this.user = response.data;
      } catch (error) {
        console.error('Error fetching user:', error);
        this.user = null;
        throw error;
      }
    },

    setToken(token) {
      this.token = token;
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      this.router.push('/login');
    }
  }
});