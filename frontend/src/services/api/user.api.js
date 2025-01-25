/**
 * API для работы с пользователями
 * Методы для получения и управления пользователями
 */

import http from '../../utils/axios'

class UserAPI {
  /**
   * Получение списка всех пользователей
   */
  async getAll() {
    const { data } = await http.get('/users')
    if (!data.success) {
      throw new Error(data.message || 'Не удалось получить список пользователей')
    }
    return data.data.users
  }

  /**
   * Получение пользователя по ID
   */
  async getById(id) {
    const { data } = await http.get(`/users/${id}`)
    if (!data.success) {
      throw new Error(data.message || 'Не удалось получить пользователя')
    }
    return data.data.user
  }

  /**
   * Получение текущего пользователя
   */
  async getCurrentUser() {
    const { data } = await http.get('/auth/me')
    if (!data.success) {
      throw new Error(data.message || 'Не удалось получить текущего пользователя')
    }
    return data.data.user
  }

  /**
   * Обновление профиля пользователя
   */
  async updateProfile(userData) {
    const { data } = await http.put('/auth/profile', userData)
    if (!data.success) {
      throw new Error(data.message || 'Не удалось обновить профиль')
    }
    return data.data.user
  }

  /**
   * Изменение пароля пользователя
   */
  async changePassword(passwordData) {
    const { data } = await http.put('/auth/password', passwordData)
    if (!data.success) {
      throw new Error(data.message || 'Не удалось изменить пароль')
    }
    return data.data
  }

  /**
   * Получение статистики пользователя
   */
  async getStats() {
    const { data } = await http.get('/users/stats')
    if (!data.success) {
      throw new Error(data.message || 'Не удалось получить статистику')
    }
    return data.data.stats
  }

  /**
   * Получение активности пользователя
   */
  async getActivity() {
    const { data } = await http.get('/users/activity')
    if (!data.success) {
      throw new Error(data.message || 'Не удалось получить активность')
    }
    return data.data.activity
  }

  /**
   * Обновление настроек уведомлений
   */
  async updateNotificationSettings(settings) {
    const { data } = await http.put('/users/me/notifications', settings)
    if (!data.success) {
      throw new Error(data.message || 'Не удалось обновить настройки уведомлений')
    }
    return data.data.settings
  }

  /**
   * Получение настроек уведомлений
   */
  async getNotificationSettings() {
    const { data } = await http.get('/users/me/notifications')
    if (!data.success) {
      throw new Error(data.message || 'Не удалось получить настройки уведомлений')
    }
    return data.data.settings
  }
}

export const userService = new UserAPI() 