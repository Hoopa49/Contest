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
    console.debug('Making GET request:', {
      url,
      config,
      headers: this.getAuthHeaders()
    })

    const response = await this.http.get(url, {
      ...config,
      headers: {
        ...config.headers,
        ...this.getAuthHeaders()
      }
    })

    console.debug('GET response:', {
      url,
      status: response.status,
      data: response.data
    })

    return response.data
  }

  /**
   * POST запрос
   */
  async post(url, data = {}, config = {}) {
    console.debug('Making POST request:', {
      url,
      config,
      headers: this.getAuthHeaders()
    })

    const response = await this.http.post(url, data, {
      ...config,
      headers: {
        ...config.headers,
        ...this.getAuthHeaders()
      }
    })

    console.debug('POST response:', {
      url,
      status: response.status,
      data: response.data
    })

    return response.data
  }

  /**
   * PUT запрос
   */
  async put(url, data = {}, config = {}) {
    console.debug('Making PUT request:', {
      url,
      data,
      config,
      headers: this.getAuthHeaders()
    })

    const response = await this.http.put(url, data, {
      ...config,
      headers: {
        ...config.headers,
        ...this.getAuthHeaders()
      }
    })

    console.debug('PUT response:', {
      url,
      status: response.status,
      data: response.data
    })

    return response.data
  }

  /**
   * DELETE запрос
   */
  async delete(url, config = {}) {
    const response = await this.http.delete(url, config)
    return this._processResponse(response)
  }

  /**
   * Обработка ответа от сервера
   */
  _processResponse(response) {
    const { data } = response

    // Проверяем успешность запроса
    if (!data.success) {
      throw new Error(data.message || 'Ошибка при выполнении запроса')
    }

    return {
      data: data.data,
      message: data.message,
      meta: data.meta
    }
  }
}

export const apiService = new ApiService() 