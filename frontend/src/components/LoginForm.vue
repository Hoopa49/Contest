<!-- frontend/src/components/LoginForm.vue -->
<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title>Вход</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="loginUser">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Пароль"
                type="password"
                required
              ></v-text-field>
              <v-btn color="primary" type="submit">Войти</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import api from '../services/backendApi.js';
import { useAuthStore } from '../stores/auth.js';
import { useToast } from 'vue-toastification';

export default {
  name: 'LoginForm',
  data() {
    return {
      email: '',
      password: ''
    };
  },
  setup() {
    const authStore = useAuthStore();
    const toast = useToast();
    return { authStore, toast };
  },
  methods: {
    async loginUser() {
      try {
        const response = await api.post('/login', {
          email: this.email,
          password: this.password
        });
        const { token, user } = response.data;

        // Сохраняем токен в Pinia store
        this.authStore.setToken(token);
        this.authStore.user = user;

        this.toast.success(`Добро пожаловать, ${user.email}!`);
        this.$router.push('/');
      } catch (err) {
        console.error(err.response?.data || err.message);
        this.toast.error('Вход не удался: ' + (err.response?.data?.error || err.message));
      }
    }
  }
};
</script>

<style scoped>
/* Добавьте стили по необходимости */
</style>
