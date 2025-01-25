/**
 * Store для управления пользователями
 * Управление профилями пользователей и их настройками
 */

import { defineStore } from 'pinia'
import { userService } from '@/services/api/user.api'
import { useStoreHelpers } from '@/composables/useStoreHelpers'
import { useCrudHelpers } from '@/composables/useCrudHelpers'
import { useSettingsHelpers } from '@/composables/useSettingsHelpers'

const { baseState, baseGetters, baseActions, withAsync } = useStoreHelpers()

export const useUserStore = defineStore('user', {
  state: () => ({
    ...baseState,
    items: [], // users
    current: null, // currentUser
    stats: null, // userStats
    activity: [], // userActivity
    settings: null // notificationSettings
  }),

  getters: {
    ...baseGetters,
    getAllUsers: (state) => state.items,
    getCurrentUser: (state) => state.current,
    getUserStats: (state) => {
      if (!state.stats) return {}
      
      return {
        contestsCount: state.stats.total || 0,
        activeContests: state.stats.active || 0,
        completedContests: state.stats.completed || 0,
        draftsCount: state.stats.draft || 0,
        failedContests: state.stats.failed || 0
      }
    },
    getUserActivity: (state) => state.activity || [],
    getNotificationSettings: (state) => state.settings
  },

  actions: {
    ...baseActions,

    // Инициализация helpers
    init() {
      const crud = useCrudHelpers(userService, this)
      const settings = useSettingsHelpers(userService, this)
      return { crud, settings }
    },

    // CRUD операции
    async fetchUsers() {
      return withAsync(this, async () => {
        const { crud } = this.init()
        return crud.fetchAll()
      })
    },

    async fetchUser(id) {
      return withAsync(this, async () => {
        const { crud } = this.init()
        return crud.fetchById(id)
      })
    },

    // Специфичные операции
    async fetchCurrentUser() {
      return withAsync(this, async () => {
        const user = await userService.getCurrentUser()
        this.current = user
        return user
      })
    },

    async updateProfile(userData) {
      return withAsync(this, async () => {
        const user = await userService.updateProfile(userData)
        this.current = user
        return user
      })
    },

    async changePassword(passwordData) {
      return withAsync(this, async () => {
        await userService.changePassword(passwordData)
      })
    },

    async fetchUserStats(id) {
      return withAsync(this, async () => {
        const stats = await userService.getStats(id)
        this.stats = stats
        return stats
      })
    },

    async fetchUserActivity(id) {
      return withAsync(this, async () => {
        const activity = await userService.getActivity(id)
        this.activity = activity
        return activity
      })
    },

    // Операции с настройками
    async fetchNotificationSettings() {
      return withAsync(this, async () => {
        const { settings } = this.init()
        return settings.fetchSettings()
      })
    },

    async updateNotificationSettings(settingsData) {
      return withAsync(this, async () => {
        const { settings } = this.init()
        return settings.updateSettings(settingsData)
      })
    }
  }
}) 