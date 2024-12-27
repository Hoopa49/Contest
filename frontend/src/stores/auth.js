// frontend/src/stores/auth.js
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null
  }),
  actions: {
    setToken(token) {
      this.token = token;
      localStorage.setItem('token', token);
    },
    clearToken() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
    },
    async fetchUser() {
      if (!this.token) return;
      try {
        // Расшифровка токена
        const payload = JSON.parse(atob(this.token.split('.')[1]));
        this.user = {
          id: payload.userId,
          role: payload.role
        };
      } catch (error) {
        console.error('Ошибка при расшифровке токена:', error);
        this.clearToken();
      }
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin'
  }
});
