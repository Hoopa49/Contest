/**
 * Store для административных функций
 * Управление пользователями, статистикой и настройками системы
 */

import { defineStore } from 'pinia'
import { adminService } from '@/services/api/admin.api'
import { useStoreHelpers } from '@/composables/useStoreHelpers'
import { useCrudHelpers } from '@/composables/useCrudHelpers'
import { useSettingsHelpers } from '@/composables/useSettingsHelpers'
import { ref } from 'vue'

const { baseState, baseGetters, baseActions, withAsync } = useStoreHelpers()

/**
 * Хранилище для управления административными функциями
 */
export const useAdminStore = defineStore('admin', () => {
  // State
  const state = ref({
    ...baseState,
    items: [], // users
    stats: null, // systemStats
    analytics: null, // аналитика
    settings: null, // общие настройки
    apiSettings: null, // настройки API
    notificationSettings: null, // настройки уведомлений
    activity: [], // recentActions
    logs: [], // системные логи
    contests: [], // список конкурсов на модерации
    integrationEvents: [], // события интеграций
    integrationActivity: null, // активность интеграций
    filters: {
      users: {},
      contests: {},
      logs: {}
    }
  })

  // Refs
  const activeTab = ref(localStorage.getItem('adminActiveTab') || 'dashboard')

  // Getters
  const getActiveTab = () => activeTab.value
  const getUsers = () => state.value.items
  const getUserById = (id) => state.value.items.find(user => user.id === id)
  const getSystemStats = () => state.value.stats
  const getAnalytics = () => state.value.analytics
  const getSettings = () => state.value.settings
  const getApiSettings = () => state.value.apiSettings
  const getNotificationSettings = () => state.value.notificationSettings
  const getRecentActions = () => state.value.activity || []
  const getLogs = () => state.value.logs || []
  const getContestsForModeration = () => state.value.contests
  const getUsersFilter = () => state.value.filters.users
  const getContestsFilter = () => state.value.filters.contests
  const getLogsFilter = () => state.value.filters.logs
  const getIntegrationEvents = async () => {
    return withAsync(state.value, async () => {
      try {
        const response = await adminService.getIntegrationEvents()
        state.value.integrationEvents = Array.isArray(response.data) ? response.data : []
        return state.value.integrationEvents
      } catch (error) {
        console.error('Error fetching integration events:', error)
        state.value.integrationEvents = []
        return []
      }
    })
  }
  const getIntegrationActivity = async (timeRange) => {
    return withAsync(state.value, async () => {
      try {
        const response = await adminService.getIntegrationActivity(timeRange)
        state.value.integrationActivity = response.data || null
        return state.value.integrationActivity
      } catch (error) {
        console.error('Error fetching integration activity:', error)
        state.value.integrationActivity = null
        return null
      }
    })
  }
  const getIntegrationStats = async () => {
    return withAsync(state.value, async () => {
      try {
        const data = await adminService.getIntegrationStats()
        
        // Проверяем наличие данных
        if (!data) {
          console.warn('Нет данных от сервера при получении статистики интеграций')
          return null
        }

        // Создаем структуру данных для фронтенда
        const stats = {
          totalRequests: Number(data.totalRequests) || 0,
          successfulRequests: Number(data.successfulRequests) || 0,
          failedRequests: Number(data.failedRequests) || 0,
          platforms: {}
        }

        // Проверяем и форматируем данные платформ
        if (data.platforms && typeof data.platforms === 'object') {
          Object.entries(data.platforms).forEach(([platform, platformData]) => {
            if (platformData) {
              stats.platforms[platform] = {
                enabled: Boolean(platformData.enabled),
                lastSync: platformData.lastSync || null,
                contestsFound: Number(platformData.contestsFound) || 0,
                errorCount: Number(platformData.errorCount) || 0,
                requests: Number(platformData.requests) || 0,
                successfulRequests: Number(platformData.successfulRequests) || 0,
                failedRequests: Number(platformData.failedRequests) || 0
              }
            }
          })
        }

        return stats
      } catch (error) {
        console.error('Ошибка при получении статистики интеграций:', error)
        return null
      }
    }, {
      storeName: 'admin/getIntegrationStats',
      showLoading: false // Отключаем индикатор загрузки для частых обновлений
    })
  }

  // Actions
  const setActiveTab = (tab) => {
    activeTab.value = tab
    localStorage.setItem('adminActiveTab', tab)
  }

  const init = () => {
    const crud = useCrudHelpers(adminService, state.value)
    const settings = useSettingsHelpers(adminService, state.value)
    return { crud, settings }
  }

  const fetchUsers = async (params = {}) => {
    return withAsync(state.value, async () => {
      const response = await adminService.getUsers(params)
      const users = Array.isArray(response.data) ? response.data : []
      state.value.items = users.map(user => ({
        ...user,
        is_blocked: user.is_blocked
      }))
      return state.value.items
    })
  }

  const fetchSystemStats = async () => {
    return withAsync(state.value, async () => {
      const response = await adminService.getSystemStats()
      state.value.stats = response.data || null
      return state.value.stats
    })
  }

  const fetchRecentActions = async () => {
    return withAsync(state.value, async () => {
      try {
        const response = await adminService.getRecentActions()
        state.value.activity = Array.isArray(response.data) ? response.data : []
        return state.value.activity
      } catch (error) {
        console.error('Error fetching recent actions:', error)
        state.value.activity = []
        throw error
      }
    })
  }

  const fetchLogs = async (params = {}) => {
    return withAsync(state.value, async () => {
      const response = await adminService.getLogs(params)
      state.value.logs = Array.isArray(response.data) ? response.data : []
      return state.value.logs
    })
  }

  const fetchSettings = async () => {
    return withAsync(state.value, async () => {
      const response = await adminService.getSettings()
      state.value.settings = response.data || null
      return state.value.settings
    })
  }

  const updateSettings = async (settingsData) => {
    return withAsync(state.value, async () => {
      const response = await adminService.updateSettings(settingsData)
      state.value.settings = response.data || null
      return state.value.settings
    })
  }

  const toggleUserStatus = async (userId) => {
    return withAsync(state.value, async () => {
      await adminService.toggleUserStatus(userId)
      await fetchUsers()
    })
  }

  return {
    // State
    activeTab,
    // Getters
    getActiveTab,
    getUsers,
    getUserById,
    getSystemStats,
    getAnalytics,
    getSettings,
    getApiSettings,
    getNotificationSettings,
    getRecentActions,
    getLogs,
    getContestsForModeration,
    getUsersFilter,
    getContestsFilter,
    getLogsFilter,
    getIntegrationEvents,
    getIntegrationActivity,
    getIntegrationStats,
    // Actions
    init,
    setActiveTab,
    fetchUsers,
    fetchSystemStats,
    fetchRecentActions,
    fetchLogs,
    fetchSettings,
    updateSettings,
    toggleUserStatus
  }
}) 