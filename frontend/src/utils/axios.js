/**
 * Конфигурация axios
 * Настройка HTTP клиента для работы с API
 */

import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { tokenService } from '@/services/api/auth/token.service'
import router from '@/router'
import { AuthError } from '@/utils/errors'

// Создаем инстанс axios с базовым URL
const baseURL = '/api'
console.debug('API baseURL:', baseURL)

const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Добавляем таймаут
  timeout: 10000,
  // Включаем поддержку CORS
  withCredentials: true
})

// Флаг, указывающий что идет обновление токена
let isRefreshing = false

// Очередь запросов, ожидающих обновления токена
let failedQueue = []

// Обработка запросов в очереди
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Добавляем перехватчик запросов
http.interceptors.request.use(
  config => {
    // Добавляем случайный параметр для предотвращения кэширования
    config.params = {
      ...config.params,
      _t: Date.now()
    }
    
    console.debug('Отправка запроса:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      fullPath: config.baseURL + config.url,
      headers: config.headers,
      params: config.params,
      data: config.data,
      withCredentials: config.withCredentials
    })
    const token = tokenService.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('Ошибка запроса:', {
      message: error.message,
      config: error.config,
      stack: error.stack
    })
    return Promise.reject(error)
  }
)

// Добавляем перехватчик ответов
http.interceptors.response.use(
  response => {
    console.debug('Успешный ответ:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
      config: {
        method: response.config.method,
        baseURL: response.config.baseURL,
        withCredentials: response.config.withCredentials,
        headers: response.config.headers
      }
    })
    return response
  },
  async error => {
    console.error('Ошибка ответа:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      response: error.response?.data,
      headers: error.response?.headers,
      config: {
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        withCredentials: error.config?.withCredentials,
        headers: error.config?.headers
      },
      stack: error.stack
    })

    const originalRequest = error.config

    // Если это ответ 401 и это не запрос на обновление токена
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Если токен уже обновляется, добавляем запрос в очередь
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return http(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const newToken = await tokenService.refreshToken()
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        return http(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        tokenService.removeTokens()
        throw new AuthError('No refresh token')
      } finally {
        isRefreshing = false
      }
    }

    // Если это ответ 403, перенаправляем на страницу логина
    if (error.response?.status === 403) {
      const auth = useAuthStore()
      auth.clearAuth()
      router.push({ name: 'login' })
    }

    return Promise.reject(error)
  }
)

export default http 