<template>
  <v-app-bar app color="primary" dark>
    <v-toolbar-title>Contest App</v-toolbar-title>

    <v-spacer></v-spacer>

    <template v-if="authStore.isAuthenticated">
      <v-btn text to="/contests">
        Конкурсы
      </v-btn>
      <v-btn text to="/videos">
        Видео
      </v-btn>
      <v-btn text @click="handleLogout">
        Выйти
      </v-btn>
      <v-list-item
        v-if="authStore.currentUser?.role === 'admin'"
        to="/scheduler"
        :prepend-icon="'mdi-cog'"
      >
        <v-list-item-title>Управление сборщиком</v-list-item-title>
      </v-list-item>
    </template>
    <template v-else>
      <v-btn text to="/login">
        Войти
      </v-btn>
      <v-btn text to="/register">
        Регистрация
      </v-btn>
    </template>
  </v-app-bar>
</template>

<script>
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

export default {
  name: 'Navbar',
  
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const handleLogout = async () => {
      try {
        authStore.logout();
        await router.push('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    };

    return {
      authStore,
      handleLogout
    };
  }
}
</script>

<style scoped>
.v-toolbar-title {
  cursor: pointer;
}
</style>