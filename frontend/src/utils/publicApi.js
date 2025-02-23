/**
 * Конфигурация публичного HTTP клиента
 * Для запросов, не требующих авторизации
 */

import axios from 'axios'

// Создаем инстанс axios с базовым URL
const baseURL = '/api'

const publicHttp = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000,
  withCredentials: false // Отключаем передачу credentials для публичных запросов
})

// Добавляем перехватчик запросов
publicHttp.interceptors.request.use(
  config => {
    // Добавляем случайный параметр для предотвращения кэширования
    config.params = {
      ...config.params,
      _t: Date.now()
    }

    // Убеждаемся, что нет заголовка авторизации
    if (config.headers) {
      delete config.headers.Authorization
      delete config.headers.authorization
    }

    return config
  },
  error => {
    console.error('Ошибка запроса:', error)
    return Promise.reject(error)
  }
)

// Добавляем перехватчик ответов для логирования ошибок
publicHttp.interceptors.response.use(
  response => {
    // Проверяем успешность ответа
    if (response.data && !response.data.success) {
      return Promise.reject(new Error(response.data.message || 'Ошибка запроса'))
    }
    return response
  },
  error => {
    // Подробное логирование ошибки
    console.error('Ошибка ответа:', {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      response: error.response?.data,
      headers: {
        request: error.config?.headers,
        response: error.response?.headers
      }
    })
    return Promise.reject(error)
  }
)

export default publicHttp 