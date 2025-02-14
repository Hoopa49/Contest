/**
 * API для работы с системными настройками
 */

import http from '@/utils/axios'

class SystemSettingsAPI {
  /**
   * Получение всех настроек
   */
  async getAllSettings() {
    try {
      console.debug('Fetching all settings')
      const response = await http.get('/admin/system-settings')
      
      if (!response?.data?.success) {
        console.error('Invalid response format:', response)
        throw new Error('Invalid response format')
      }

      return response.data.data
    } catch (error) {
      console.error('Error in getAllSettings:', error)
      throw error
    }
  }

  /**
   * Сохранение настроек
   */
  async saveSettings({ settings, changes, description }) {
    try {
      console.debug('Saving settings:', { settings, changes, description })
      
      // Сохраняем настройки для каждой категории
      const responses = await Promise.all(
        Object.entries(settings).map(([category, categorySettings]) =>
          http.put(`/admin/system-settings/${category}`, {
            settings: categorySettings,
            changes: changes?.[category],
            description
          })
        )
      )

      // Проверяем успешность всех запросов
      const hasErrors = responses.some(response => !response?.data?.success)
      if (hasErrors) {
        throw new Error('Ошибка при сохранении некоторых настроек')
      }

      return { success: true }
    } catch (error) {
      console.error('Error in saveSettings:', error)
      throw error
    }
  }

  /**
   * Получение истории изменений
   */
  async getHistory() {
    try {
      console.debug('Fetching settings history')
      const response = await http.get('/admin/system-settings/history')

      if (!response?.data?.success) {
        console.error('Invalid response format:', response)
        throw new Error('Invalid response format')
      }

      return response.data.data || []
    } catch (error) {
      console.error('Error in getHistory:', error)
      return []
    }
  }

  /**
   * Откат к предыдущей версии
   */
  async rollbackSettings(historyId) {
    try {
      console.debug('Rolling back settings to version:', historyId)
      const response = await http.post(`/admin/system-settings/rollback/${historyId}`)

      if (!response?.data?.success) {
        console.error('Invalid response format:', response)
        throw new Error('Invalid response format')
      }

      return response.data
    } catch (error) {
      console.error('Error in rollbackSettings:', error)
      throw error
    }
  }
}

export const systemSettingsService = new SystemSettingsAPI() 