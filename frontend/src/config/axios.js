import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Перехватчик для добавления токена и обновления активности
api.interceptors.request.use(config => {
  const authStore = useAuthStore()
  
  // Добавляем токен в заголовки
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  
  // Обновляем время активности при каждом запросе
  if (authStore.isAuthenticated) {
    authStore.updateActivity()
  }
  
  return config
})

// Перехватчик для обработки ошибок и проверки сессии
api.interceptors.response.use(
  response => response,
  async error => {
    const authStore = useAuthStore()
    
    // Если ошибка авторизации и пользователь был авторизован
    if (error.response?.status === 401 && authStore.isAuthenticated) {
      // Проверяем валидность сессии
      if (!authStore.isSessionValid) {
        await authStore.logoutUser()
        window.location.reload()
      }
    }
    
    return Promise.reject(error)
  }
)

export default api 