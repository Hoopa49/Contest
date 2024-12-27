<!-- frontend/src/components/RegisterForm.vue -->
<template>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card>
            <v-card-title>Регистрация</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="registerUser">
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
                <v-select
                  v-model="role"
                  :items="roles"
                  label="Роль"
                  required
                ></v-select>
                <v-btn color="primary" type="submit">Зарегистрироваться</v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import api from '../services/backendApi.js';
  
  export default {
    name: 'RegisterForm',
    data() {
      return {
        email: '',
        password: '',
        role: 'user',
        roles: ['user', 'admin'] // Если хотите предоставить выбор ролей
      };
    },
    methods: {
      async registerUser() {
        try {
          const response = await api.post('/register', {
            email: this.email,
            password: this.password,
            role: this.role
          });
          alert(response.data.message);
          this.$router.push('/login');
        } catch (err) {
          console.error(err.response?.data || err.message);
          alert('Registration failed: ' + (err.response?.data?.error || err.message));
        }
      }
    }
  };
  </script>
  
  <style scoped>
  /* Добавьте стили по необходимости */
  </style>
  