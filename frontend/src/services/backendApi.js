// src/services/backendApi.js

import axios from 'axios';

// Можно вынести URL в переменную среды VITE_API_URL (настраивается в vite.config или .env)
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL
});

// (Необязательно) Интерсептор на запрос,
// чтоб автоматически подставлять токен, если он в localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
