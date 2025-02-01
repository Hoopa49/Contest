/**
 * API для административных функций
 * Управление пользователями, статистикой и настройками системы
 */

import http from '@/utils/axios'

/**
 * Класс для работы с API администратора
 */
class AdminAPI {
  /**
   * Получение списка пользователей
   */
  async getUsers(params = {}) {
    const { data } = await http.get('/admin/users', { params })
    return data
  }

  /**
   * Получение пользователя по ID
   */
  async getUserById(id) {
    const { data } = await http.get(`/admin/users/${id}`)
    return data
  }

  /**
   * Получение системной статистики
   */
  async getSystemStats() {
    const { data } = await http.get('/admin/stats')
    return data
  }

  /**
   * Получение аналитики
   */
  async getAnalytics(params = {}) {
    const { data } = await http.get('/admin/analytics', { params })
    return data
  }

  /**
   * Получение последних действий
   */
  async getRecentActions() {
    const { data } = await http.get('/admin/activity')
    return data
  }

  /**
   * Получение системных логов
   */
  async getLogs(params = {}) {
    const { data } = await http.get('/admin/logs', { params })
    return data
  }

  /**
   * Получение общих настроек
   */
  async getSettings() {
    const { data } = await http.get('/admin/settings')
    return data
  }

  /**
   * Обновление общих настроек
   */
  async updateSettings(settings) {
    const { data } = await http.put('/admin/settings', settings)
    return data
  }

  /**
   * Получение настроек API
   */
  async getApiSettings() {
    const { data } = await http.get('/admin/settings/api')
    return data
  }

  /**
   * Обновление настроек API
   */
  async updateApiSettings(settings) {
    const { data } = await http.put('/admin/settings/api', settings)
    return data
  }

  /**
   * Получение настроек уведомлений
   */
  async getNotificationSettings() {
    const { data } = await http.get('/admin/settings/notifications')
    return data
  }

  /**
   * Обновление настроек уведомлений
   */
  async updateNotificationSettings(settings) {
    const { data } = await http.put('/admin/settings/notifications', settings)
    return data
  }

  /**
   * Переключение статуса пользователя
   */
  async toggleUserStatus(userId) {
    const { data } = await http.post(`/admin/users/${userId}/toggle-status`)
    return data
  }

  /**
   * Получение конкурсов на модерации
   */
  async getContestsForModeration(params = {}) {
    const { data } = await http.get('/admin/contests/moderation', { params })
    return data
  }

  /**
   * Одобрение конкурса
   */
  async approveContest(contestId) {
    const { data } = await http.post(`/admin/contests/${contestId}/approve`)
    return data
  }

  /**
   * Отклонение конкурса
   */
  async rejectContest(contestId, reason) {
    const { data } = await http.post(`/admin/contests/${contestId}/reject`, { reason })
    return data
  }

  /**
   * Получение событий интеграций
   */
  async getIntegrationEvents() {
    const { data } = await http.get('/admin/integrations/events')
    return data
  }

  /**
   * Получение активности интеграций
   */
  async getIntegrationActivity(timeRange) {
    const { data } = await http.get('/admin/integrations/activity', { 
      params: { 
        timeRange,
        _t: Date.now() // Добавляем timestamp для предотвращения кэширования
      } 
    })
    return data
  }

  /**
   * Получение статистики интеграций
   */
  async getIntegrationStats() {
    const response = await http.get('/admin/integrations/stats')
    return response.data
  }

  /**
   * Включение/выключение интеграции
   */
  async toggleIntegration(platform, enabled) {
    const { data } = await http.post(`/admin/integrations/${platform}/toggle`, { enabled })
    return data
  }

  /**
   * Сохранение настроек интеграции
   */
  async saveIntegrationSettings(platform, settings) {
    const { data } = await http.put(`/admin/integrations/${platform}/settings`, settings)
    return data
  }

  /**
   * Запуск поиска для интеграции
   */
  async runIntegrationSearch(platform, params) {
    const { data } = await http.post(`/admin/integrations/${platform}/search`, params)
    return data
  }
}

export const adminService = new AdminAPI() 