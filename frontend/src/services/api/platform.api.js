/**
 * API для работы с платформами
 * Методы для получения и управления платформами
 */

import http from '../../utils/axios'

class PlatformAPI {
  /**
   * Получение списка всех платформ
   */
  async getAll() {
    const response = await http.get('/platforms')
    return response.data
  }

  /**
   * Получение платформы по ID
   */
  async getById(id) {
    const response = await http.get(`/platforms/${id}`)
    return response.data
  }

  /**
   * Создание новой платформы
   */
  async create(platformData) {
    const response = await http.post('/platforms', platformData)
    return response.data
  }

  /**
   * Обновление платформы
   */
  async update(id, platformData) {
    const response = await http.put(`/platforms/${id}`, platformData)
    return response.data
  }

  /**
   * Удаление платформы
   */
  async delete(id) {
    await http.delete(`/platforms/${id}`)
  }

  /**
   * Получение статистики платформы
   */
  async getStats(id) {
    const response = await http.get(`/platforms/${id}/stats`)
    return response.data
  }

  /**
   * Проверка доступности платформы
   */
  async checkAvailability(id) {
    const response = await http.get(`/platforms/${id}/availability`)
    return response.data
  }

  /**
   * Получение настроек интеграции
   */
  async getIntegrationSettings(id) {
    const response = await http.get(`/platforms/${id}/integration`)
    return response.data
  }

  /**
   * Обновление настроек интеграции
   */
  async updateIntegrationSettings(id, settings) {
    const response = await http.put(`/platforms/${id}/integration`, settings)
    return response.data
  }
}

export const platformService = new PlatformAPI() 