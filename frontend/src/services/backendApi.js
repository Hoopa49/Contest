import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Убираем /api отсюда
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавляем перехватчик для логирования
api.interceptors.request.use(request => {
  console.log('Starting Request:', request.method, request.url);
  return request;
});

// Добавляем перехватчик для токена
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Добавляем перехватчик для обработки ошибок
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;