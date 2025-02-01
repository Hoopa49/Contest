import { defineStore } from 'pinia'
import http from '@/utils/axios'

export const useSystemSettingsStore = defineStore('systemSettings', {
  state: () => ({
    settings: null,
    history: [],
    loading: false,
    error: null
  }),

  getters: {
    getSettingsByCategory: (state) => (category) => {
      return state.settings?.find(s => s.category === category)
    },
    
    isLoading: (state) => state.loading,
    
    hasError: (state) => !!state.error
  },

  actions: {
    async getAllSettings() {
      this.loading = true
      this.error = null
      try {
        const response = await http.get('/admin/system-settings')
        this.settings = response.data.data
        return this.settings
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to load settings'
        throw error
      } finally {
        this.loading = false
      }
    },

    async getSettingsByCategory(category) {
      this.loading = true
      this.error = null
      try {
        const response = await http.get(`/admin/system-settings/${category}`)
        const settings = response.data.data
        
        // Обновляем настройки в хранилище
        const index = this.settings?.findIndex(s => s.category === category)
        if (index !== -1) {
          this.settings[index] = settings
        } else if (this.settings) {
          this.settings.push(settings)
        } else {
          this.settings = [settings]
        }
        
        return settings
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to load settings'
        throw error
      } finally {
        this.loading = false
      }
    },

    async saveSettings(category, settings, description) {
      this.loading = true
      this.error = null
      try {
        const response = await http.put(`/admin/system-settings/${category}`, {
          settings,
          description
        })
        
        // Обновляем настройки в хранилище
        const updatedSettings = response.data.data
        const index = this.settings?.findIndex(s => s.category === category)
        if (index !== -1) {
          this.settings[index] = updatedSettings
        } else if (this.settings) {
          this.settings.push(updatedSettings)
        } else {
          this.settings = [updatedSettings]
        }
        
        return updatedSettings
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to save settings'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deactivateSettings(category) {
      this.loading = true
      this.error = null
      try {
        const response = await http.delete(`/admin/system-settings/${category}`)
        
        // Обновляем настройки в хранилище
        const deactivatedSettings = response.data.data
        const index = this.settings?.findIndex(s => s.category === category)
        if (index !== -1) {
          this.settings[index] = deactivatedSettings
        }
        
        return deactivatedSettings
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to deactivate settings'
        throw error
      } finally {
        this.loading = false
      }
    },

    async getSettingsHistory() {
      this.loading = true
      this.error = null
      try {
        const response = await http.get('/admin/system-settings/history')
        this.history = response.data.data
        return this.history
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to load settings history'
        throw error
      } finally {
        this.loading = false
      }
    },

    async rollbackSettings(historyId) {
      this.loading = true
      this.error = null
      try {
        const response = await http.post(`/admin/system-settings/rollback/${historyId}`)
        
        // Обновляем настройки после отката
        this.settings = response.data.data
        
        return this.settings
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to rollback settings'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Сброс состояния
    resetState() {
      this.settings = null
      this.history = []
      this.loading = false
      this.error = null
    }
  }
}) 