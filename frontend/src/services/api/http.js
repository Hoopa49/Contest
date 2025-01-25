import axios from 'axios'
import { tokenService } from './auth/token.service'

// Создаем экземпляр axios с базовыми настройками
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Перехватчик запросов
http.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Перехватчик ответов
http.interceptors.response.use(
  (response) => {
    // Если в ответе есть data.data, возвращаем data.data, иначе весь data
    return response.data?.data ? response.data.data : response.data
  },
  async (error) => {
    const originalRequest = error.config

    // Если ошибка 401 и это не повторный запрос после обновления токена
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Пробуем обновить токен
        const token = await tokenService.refreshToken()
        
        // Если получили новый токен, повторяем исходный запрос
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return http(originalRequest)
        }
      } catch (refreshError) {
        // Если не удалось обновить токен, очищаем авторизацию
        tokenService.removeTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Если ошибка в ответе содержит message, возвращаем его
    const message = error.response?.data?.message || error.message
    return Promise.reject(new Error(message))
  }
) 