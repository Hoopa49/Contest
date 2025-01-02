import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Перехватчик для добавления токена
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Перехватчик для добавления токена
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.data?.needReauth) {
      // Перенаправляем на страницу логина
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Добавляем логирование для ответов
api.interceptors.response.use(
  response => {
    console.log('Response interceptor:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('Response error:', {
      message: error.message,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        data: error.config?.data
      },
      response: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default api;