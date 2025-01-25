/**
 * API для работы с уведомлениями
 * Методы для получения и управления уведомлениями пользователя
 */

import http from '../../utils/axios'

class NotificationAPI {
  /**
   * Получение всех уведомлений пользователя
   */
  async getAll() {
    const response = await http.get('/notifications')
    return response.data
  }

  /**
   * Получение непрочитанных уведомлений
   */
  async getUnread() {
    const response = await http.get('/notifications/unread')
    return response.data
  }

  /**
   * Отметить уведомление как прочитанное
   */
  async markAsRead(id) {
    const response = await http.put(`/notifications/${id}/read`)
    return response.data
  }

  /**
   * Отметить все уведомления как прочитанные
   */
  async markAllAsRead() {
    const response = await http.put('/notifications/read-all')
    return response.data
  }

  /**
   * Удаление уведомления
   */
  async delete(id) {
    await http.delete(`/notifications/${id}`)
  }

  /**
   * Получение настроек уведомлений
   */
  async getSettings() {
    const response = await http.get('/notifications/settings')
    return response.data
  }

  /**
   * Обновление настроек уведомлений
   */
  async updateSettings(settings) {
    const response = await http.put('/notifications/settings', settings)
    return response.data
  }
}

export const notificationService = new NotificationAPI() 