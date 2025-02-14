import { defineStore } from 'pinia'
import { systemSettingsService } from '@/services/api/system-settings.api'
import { useStoreHelpers } from '@/composables/useStoreHelpers'

const { baseState, withAsync } = useStoreHelpers()

export const useSystemSettingsStore = defineStore('systemSettings', {
  state: () => ({
    ...baseState(),
    settings: null,
    history: [],
    isLoading: false,
    error: null
  }),

  getters: {
    settingsForCategory: (state) => (category) => {
      if (!state.settings) return null
      return state.settings[category] || null
    },
    
    loading: (state) => state.isLoading,
    
    hasError: (state) => !!state.error
  },

  actions: {
    async getAllSettings() {
      return withAsync(this, async () => {
        try {
          const response = await systemSettingsService.getAllSettings()
          console.log('Ответ от API:', response)
          
          // Проверяем и форматируем данные
          if (response && typeof response === 'object') {
            const formattedSettings = {}
            
            const formatValue = (value) => {
              if (!value || typeof value !== 'object') {
                // Преобразуем строковые числа в числа
                if (typeof value === 'string' && !isNaN(value)) {
                  return Number(value)
                }
                return value
              }
              
              const formatted = {}
              Object.entries(value).forEach(([k, v]) => {
                formatted[k] = formatValue(v)
              })
              return formatted
            }
            
            Object.entries(response).forEach(([category, settings]) => {
              if (settings && typeof settings === 'object') {
                console.log(`Форматирование категории ${category}:`, settings)
                formattedSettings[category] = formatValue(settings)
                console.log(`Отформатированные настройки для ${category}:`, formattedSettings[category])
              }
            })
            
            console.log('Итоговые отформатированные настройки:', formattedSettings)
            this.settings = formattedSettings
            return formattedSettings
          }
          
          throw new Error('Invalid settings data format')
        } catch (error) {
          console.error('Ошибка при получении настроек:', error)
          this.error = error.message
          throw error
        }
      })
    },

    async getSettingsByCategory(category) {
      this.isLoading = true
      this.error = null
      try {
        const response = await systemSettingsService.getSettingsByCategory(category)
        
        if (response?.success && response?.data) {
          // Обновляем настройки в store
          if (!this.settings) {
            this.settings = {}
          }
          this.settings[category] = response.data
          return response.data
        }
        
        throw new Error(`Failed to load settings for category ${category}`)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async saveSettings({ settings, changes, description }) {
      return withAsync(this, async () => {
        try {
          const response = await systemSettingsService.saveSettings({
            settings,
            changes,
            description
          })
          
          if (response.success) {
            this.settings = settings
            return { success: true }
          } else {
            throw new Error(response.message || 'Ошибка при сохранении настроек')
          }
        } catch (error) {
          console.error('Ошибка при сохранении настроек:', error)
          this.error = error.message
          return { 
            success: false, 
            error: this.error 
          }
        }
      })
    },

    async deactivateSettings(category) {
      this.isLoading = true
      this.error = null
      try {
        const response = await systemSettingsService.deactivateSettings(category)
        
        if (response?.success && response?.data) {
          // Обновляем настройки в store после деактивации
          if (this.settings && this.settings[category]) {
            this.settings[category] = response.data
          }
          return response.data
        }
        
        throw new Error('Failed to deactivate settings')
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async getHistory() {
      this.isLoading = true
      try {
        const response = await systemSettingsService.getHistory()
        this.history = response || []
        return {
          success: true,
          data: this.history
        }
      } catch (error) {
        console.error('Ошибка при получении истории:', error)
        this.error = error.message
        this.history = []
        return {
          success: false,
          data: [],
          error: error.message
        }
      } finally {
        this.isLoading = false
      }
    },

    async rollbackSettings(historyId) {
      return withAsync(this, async () => {
        try {
          const response = await systemSettingsService.rollbackSettings(historyId)
          
          if (response?.success && response?.data) {
            await this.getAllSettings()
            return response.data
          }
          
          throw new Error('Не удалось выполнить откат настроек')
        } catch (error) {
          console.error('Ошибка при откате настроек:', error)
          this.error = error.message
          throw error
        }
      })
    },

    // Сброс состояния
    resetState() {
      this.settings = null
      this.history = []
      this.isLoading = false
      this.error = null
    },

    clearError() {
      this.error = null
    }
  }
}) 