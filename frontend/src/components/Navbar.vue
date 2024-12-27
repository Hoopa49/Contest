<!-- frontend/src/components/Navbar.vue -->
<template>
  <v-app-bar app color="primary" dark>
    <v-toolbar-title>Contest App</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn text to="/">Главная</v-btn>
    <v-btn text to="/videos" v-if="isAdmin">Видео</v-btn>
    <v-btn text to="/contests" v-if="isAdmin">Конкурсы</v-btn>
    <v-btn text to="/login" v-if="!isAuthenticated">Вход</v-btn>
    <v-btn text to="/register" v-if="!isAuthenticated">Регистрация</v-btn>
    <v-btn text @click="logout" v-if="isAuthenticated">Выйти</v-btn>
  </v-app-bar>
</template>

<script>
import { useAuthStore } from '../stores/auth.js';

export default {
  name: 'Navbar',
  setup() {
    const authStore = useAuthStore();
    return {
      isAuthenticated: authStore.isAuthenticated,
      isAdmin: authStore.user?.role === 'admin'
    };
  },
  methods: {
    logout() {
      const authStore = useAuthStore();
      authStore.clearToken();
      this.$router.push('/login');
      alert('Вы вышли из системы.');
    }
  }
};
</script>

<style scoped>
/* Добавьте дополнительные стили при необходимости */
</style>
