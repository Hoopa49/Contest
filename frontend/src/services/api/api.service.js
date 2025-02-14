/**
 * Базовый сервис для работы с API
 * Предоставляет методы для выполнения HTTP запросов
 */

import http from '@/utils/axios'
import { tokenService } from './auth/token.service'

class ApiService {
  constructor() {
    this.http = http
  }

  /**
   * Получение заголовков авторизации
   */
  getAuthHeaders() {
    const token = tokenService.getAccessToken()
    return token ? {
      Authorization: `Bearer ${token}`
    } : {}
  }

  /**
   * GET запрос
   */
  async get(url, config = {}) {
    const response = await this.http.get(url, {
      ...config,
      headers: {
        ...config.headers,
        ...this.getAuthHeaders()
      }
    })

    return response.data
  }

  /**
   * POST запрос
   */
  async post(url, data = {}, config = {}) {
    const response = await this.http.post(url, data, {
      ...config,
      headers: {
        ...config.headers,
        ...this.getAuthHeaders()
      }
    })

    return response.data
  }

  /**
   * PUT запрос
   */
  async put(url, data = {}, config = {}) {
    const response = await this.http.put(url, data, {
      ...config,
      headers: {
        ...config.headers,
        ...this.getAuthHeaders()
      }
    })

    return response.data
  }

  /**
   * DELETE запрос
   */
  async delete(url, config = {}) {
    const response = await this.http.delete(url, {
      ...config,
      headers: {
        ...config.headers,
        ...this.getAuthHeaders()
      }
    })

    return response.data
  }

  /**
   * Обработка ответа от сервера
   */
  _processResponse(response) {
    if (!response || !response.data) {
      throw new Error('Пустой ответ от сервера')
    }

    const { data } = response

    // Проверяем успешность запроса
    if (data.success === false) {
      throw new Error(data.message || 'Ошибка при выполнении запроса')
    }

    return {
      data: data.data,
      message: data.message,
      meta: data.meta,
      success: true
    }
  }
}

export const apiService = new ApiService() 