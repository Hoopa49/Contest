<template>
    <div>
      <h2>Login</h2>
      <form @submit.prevent="loginUser">
        <label>Email: <input v-model="email" type="text" /></label><br/>
        <label>Password: <input v-model="password" type="password" /></label><br/>
        <button type="submit">Login</button>
      </form>
    </div>
  </template>
  
  <script>
  import api from '../services/backendApi.js';
  
  export default {
    name: 'LoginForm',
    data() {
      return {
        email: '',
        password: ''
      };
    },
    methods: {
      async loginUser() {
        try {
          const response = await api.post('/login', {
            email: this.email,
            password: this.password
          });
          const { token, user } = response.data;
  
          // Сохраним токен в localStorage
          localStorage.setItem('token', token);
  
          alert(`Welcome, ${user.email} (role: ${user.role})!`);
        } catch (err) {
          console.error(err);
          alert('Login failed');
        }
      }
    }
  };
  </script>
  