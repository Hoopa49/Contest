import { defineStore } from 'pinia';
import api from '../services/backendApi';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token')
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user
  },

  actions: {
    async login(credentials) {
      try {
        const response = await api.post('/api/auth/login', credentials);
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem('token', this.token);
        return response.data;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },

    async fetchUser() {
      try {
        const response = await api.get('/api/auth/profile');
        this.user = response.data;
        return response.data;
      } catch (error) {
        console.error('Fetch user error:', error);
        throw error;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
    }
  }
});