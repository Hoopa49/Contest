/**
 * API для административных функций
 * Управление пользователями, статистикой и настройками системы
 */

import http from '@/utils/axios'
import { formatDate } from '@/utils/formatters'

/**
 * @typedef {import('@/modules/youtube/schemas/admin.schema').SystemStats} SystemStats
 * @typedef {import('@/modules/youtube/schemas/admin.schema').UserAction} UserAction
 * @typedef {import('@/modules/youtube/schemas/admin.schema').AdminUser} AdminUser
 * @typedef {import('@/modules/youtube/schemas/admin.schema').SystemSetting} SystemSetting
 * @typedef {import('@/modules/youtube/schemas/admin.schema').SystemLog} SystemLog
 * @typedef {import('@/modules/youtube/schemas/admin.schema').ApiResponse} ApiResponse
 */

/**
 * Нормализация данных пользователя
 * @param {AdminUser} user - Данные пользователя
 * @returns {AdminUser} - Нормализованные данные пользователя
 */
const normalizeUser = (user) => ({
  ...user,
  created_at: formatDate(user.created_at),
  full_name: `${user.first_name} ${user.last_name}`.trim()
})

/**
 * Нормализация действия пользователя
 * @param {UserAction} action - Действие пользователя
 * @returns {UserAction} - Нормализованное действие
 */
const normalizeAction = (action) => {
  if (!action) {
    return null;
  }
  
  // Определяем дату создания из возможных полей
  const creationDate = action.created_at || action.createdAt || action.action_data?.created_at;
  
  const normalized = {
    id: action.id || '',
    type: action.action_type || 'unknown',
    platform: action.platform || '',
    status: action.status || '',
    action_type: action.action_type || 'unknown',
    action_data: action.action_data || {},
    created_at: creationDate,
    user: action.user ? normalizeUser(action.user) : {
      id: action.user_id || '',
      full_name: 'Системный пользователь',
      email: 'system@example.com'
    }
  };
  
  return normalized;
}

/**
 * Нормализация системного лога
 * @param {SystemLog} log - Системный лог
 * @returns {SystemLog} - Нормализованный лог
 */
const normalizeLog = (log) => ({
  ...log,
  created_at: formatDate(log.created_at)
})

/**
 * Класс для работы с API администратора
 */
class AdminAPI {
  /**
   * Получение списка пользователей
   * @param {Object} params - Параметры запроса
   * @returns {Promise<{data: AdminUser[]}>}
   */
  async getUsers(params = {}) {
    const { data } = await http.get('/admin/users', { params })
    return {
      ...data,
      data: Array.isArray(data.data) ? data.data.map(normalizeUser) : []
    }
  }

  /**
   * Получение пользователя по ID
   * @param {string} id - ID пользователя
   * @returns {Promise<{data: AdminUser}>}
   */
  async getUserById(id) {
    const { data } = await http.get(`/admin/users/${id}`)
    return {
      ...data,
      data: data.data ? normalizeUser(data.data) : null
    }
  }

  /**
   * Получение системной статистики
   * @param {Object} params - Параметры запроса (период, метрика)
   * @returns {Promise<{data: SystemStats}>}
   */
  async getSystemStats(params = {}) {
    const { data } = await http.get('/admin/stats', { 
      params: {
        ...params,
        _t: Date.now() // Предотвращаем кэширование
      }
    })
    return data
  }

  /**
   * Получение аналитики по категории
   * @param {Object} params - Параметры запроса (период, тип графика)
   * @returns {Promise<{data: Analytics}>}
   */
  async getAnalytics(params = {}) {
    const { data } = await http.get(`/admin/analytics/dashboard`, { 
      params: {
        ...params,
        _t: Date.now()
      }
    })
    return data
  }

  /**
   * Получение агрегированных метрик
   * @param {string} category - Категория метрик
   * @param {Object} params - Параметры запроса (период, метрики)
   * @returns {Promise<{data: Object}>}
   */
  async getAggregatedMetrics(category, params = {}) {
    const { data } = await http.get(`/admin/analytics/${category}/metrics`, {
      params: {
        ...params,
        _t: Date.now()
      }
    })
    return data
  }

  /**
   * Получение прогнозов
   * @param {Object} params - Параметры запроса (период)
   * @returns {Promise<{data: Array}>}
   */
  async getForecasts(params = {}) {
    const { data } = await http.get('/admin/analytics/forecasts', {
      params: {
        ...params,
        _t: Date.now()
      }
    })
    return data
  }

  /**
   * Получение рекомендаций
   * @returns {Promise<{data: Array}>}
   */
  async getRecommendations() {
    const { data } = await http.get('/admin/analytics/recommendations')
    return data
  }

  /**
   * Получение последних действий
   * @returns {Promise<{data: UserAction[]}>}
   */
  async getRecentActions() {
    const { data } = await http.get('/admin/recent-actions')
    return {
      ...data,
      data: Array.isArray(data.data) ? data.data.map(normalizeAction) : []
    }
  }

  /**
   * Получение системных логов
   * @param {Object} params - Параметры запроса
   * @returns {Promise<{data: SystemLog[], meta: Object}>}
   */
  async getLogs(params = {}) {
    const { data } = await http.get('/admin/logs', { params })
    return {
      ...data,
      data: Array.isArray(data.data) ? data.data.map(normalizeLog) : []
    }
  }

  /**
   * Получение настроек системы
   * @returns {Promise<{data: SystemSetting[]}>}
   */
  async getSettings() {
    const { data } = await http.get('/admin/settings')
    return data
  }

  /**
   * Обновление настроек системы
   * @param {Object} settings - Настройки для обновления
   * @returns {Promise<ApiResponse>}
   */
  async updateSettings(settings) {
    const { data } = await http.put('/admin/settings', { settings })
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
   * @param {string} userId - ID пользователя
   * @returns {Promise<ApiResponse>}
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

  /**
   * Обновление пользователя
   * @param {string} userId - ID пользователя
   * @param {Object} userData - Данные для обновления
   * @returns {Promise<{data: AdminUser}>}
   */
  async updateUser(userId, userData) {
    const { data } = await http.put(`/admin/users/${userId}`, userData)
    return {
      ...data,
      data: data.data ? normalizeUser(data.data) : null
    }
  }

  /**
   * Удаление пользователя
   * @param {string} userId - ID пользователя
   * @returns {Promise<ApiResponse>}
   */
  async deleteUser(userId) {
    const { data } = await http.delete(`/admin/users/${userId}`)
    return data
  }
}

export const adminService = new AdminAPI() 