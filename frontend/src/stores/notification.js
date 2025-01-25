/**
 * Store для управления уведомлениями
 * Управляет уведомлениями пользователя, их статусами и настройками
 */

import { defineStore } from 'pinia'
import { notificationService } from '@/services/api/notification.api'
import { useStoreHelpers } from '@/composables/useStoreHelpers'
import { useCrudHelpers } from '@/composables/useCrudHelpers'
import { useSettingsHelpers } from '@/composables/useSettingsHelpers'
import { ref, computed } from 'vue'

const { baseState, baseGetters, baseActions, withAsync } = useStoreHelpers()

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    ...baseState,
    items: [], // notifications
    unreadCount: 0,
    settings: null,
    lastFetchTime: null,
    pollingInterval: null,
    isPollingEnabled: false
  }),

  getters: {
    ...baseGetters,
    
    // Получение всех уведомлений
    allNotifications: (state) => state.items,
    
    // Количество непрочитанных уведомлений
    totalUnreadCount: (state) => state.unreadCount,
    
    // Настройки уведомлений
    notificationSettings: (state) => state.settings,
    
    // Непрочитанные уведомления
    unreadNotifications: (state) => state.items.filter(n => !n.read),
    
    // Прочитанные уведомления
    readNotifications: (state) => state.items.filter(n => n.read),
    
    // Последние 5 уведомлений
    recentNotifications: (state) => state.items.slice(0, 5),
    
    // Время последнего обновления
    lastUpdate: (state) => state.lastFetchTime
  },

  actions: {
    ...baseActions,

    // Инициализация helpers
    init() {
      const crud = useCrudHelpers(notificationService, this)
      const settings = useSettingsHelpers(notificationService, this)
      return { crud, settings }
    },

    // CRUD операции
    async fetchNotifications() {
      return withAsync(this, async () => {
        const { crud } = this.init()
        const notifications = await crud.fetchAll()
        this.items = notifications
        this.unreadCount = notifications.filter(n => !n.read).length
        this.lastFetchTime = new Date()
        return notifications
      })
    },

    // Специфичные операции
    async fetchUnreadNotifications() {
      return withAsync(this, async () => {
        const notifications = await notificationService.getUnread()
        // Обновляем только непрочитанные, сохраняя прочитанные
        const readNotifications = this.items.filter(n => n.read)
        this.items = [...notifications, ...readNotifications]
        this.unreadCount = notifications.length
        this.lastFetchTime = new Date()
        return notifications
      })
    },

    async markAsRead(id) {
      return withAsync(this, async () => {
        await notificationService.markAsRead(id)
        const notification = this.items.find(n => n.id === id)
        if (notification && !notification.read) {
          notification.read = true
          this.unreadCount = Math.max(0, this.unreadCount - 1)
        }
      })
    },

    async markAllAsRead() {
      return withAsync(this, async () => {
        await notificationService.markAllAsRead()
        this.items.forEach(n => n.read = true)
        this.unreadCount = 0
      })
    },

    async deleteNotification(id) {
      return withAsync(this, async () => {
        const { crud } = this.init()
        await crud.remove(id)
        const index = this.items.findIndex(n => n.id === id)
        if (index !== -1) {
          const notification = this.items[index]
          this.items.splice(index, 1)
          if (!notification.read) {
            this.unreadCount = Math.max(0, this.unreadCount - 1)
          }
        }
      })
    },

    // Операции с настройками
    async fetchSettings() {
      return withAsync(this, async () => {
        const { settings } = this.init()
        const settingsData = await settings.fetchSettings()
        this.settings = settingsData
        return settingsData
      })
    },

    async updateSettings(settingsData) {
      return withAsync(this, async () => {
        const { settings } = this.init()
        const updatedSettings = await settings.updateSettings(settingsData)
        this.settings = updatedSettings
        return updatedSettings
      })
    },

    // Polling уведомлений
    startPolling(interval = 30000) {
      if (this.isPollingEnabled) return
      
      this.isPollingEnabled = true
      this.pollingInterval = setInterval(async () => {
        try {
          await this.fetchUnreadNotifications()
        } catch (error) {
          console.error('Ошибка при получении уведомлений:', error)
        }
      }, interval)
    },

    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval)
        this.pollingInterval = null
      }
      this.isPollingEnabled = false
    },

    // Очистка состояния
    clearState() {
      this.stopPolling()
      this.items = []
      this.unreadCount = 0
      this.settings = null
      this.lastFetchTime = null
      this.clearError()
    }
  }
}) 