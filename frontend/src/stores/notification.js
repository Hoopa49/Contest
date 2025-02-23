/**
 * Store для управления уведомлениями
 * Управляет уведомлениями пользователя, их статусами и настройками
 */

import { defineStore } from 'pinia'
import { notificationService } from '@/services/api/notification.api'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notification', () => {
  // Состояние
  const toasts = ref([])
  const toastPosition = ref('top-right')
  const modal = ref({ isOpen: false, component: null, props: {} })

  // Состояние для уведомлений пользователя
  const notifications = ref([])
  const unreadCount = ref(0)
  const settings = ref(null)
  const lastFetchTime = ref(null)
  const pollingInterval = ref(null)
  const isPollingEnabled = ref(false)
  const loading = ref(false)
  const storeError = ref(null)

  // Методы для тостов
  const showToast = ({ type = 'info', title = '', message = '', duration = 5000 }) => {
    const id = Date.now()
    toasts.value.push({
      id,
      type,
      title,
      message,
      duration,
      show: true
    })

    // Автоматическое удаление
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index !== -1) {
      toasts.value[index].show = false
      setTimeout(() => {
        toasts.value = toasts.value.filter(toast => toast.id !== id)
      }, 300) // Задержка для анимации
    }
  }

  const clearToasts = () => {
    toasts.value = []
  }

  const setToastPosition = (position) => {
    toastPosition.value = position
  }

  // Методы для модальных окон
  const showModal = (component, props = {}) => {
    modal.value = {
      isOpen: true,
      component,
      props
    }
  }

  const closeModal = () => {
    modal.value = {
      isOpen: false,
      component: null,
      props: {}
    }
  }

  // Хелперы для разных типов уведомлений
  const success = (message, title = '') => showToast({ type: 'success', title, message })
  const showError = (message, title = '') => showToast({ type: 'error', title, message })
  const warning = (message, title = '') => showToast({ type: 'warning', title, message })
  const info = (message, title = '') => showToast({ type: 'info', title, message })

  // Геттеры для уведомлений пользователя
  const allNotifications = () => notifications.value
  const unreadNotifications = () => notifications.value.filter(n => !n.read)
  const readNotifications = () => notifications.value.filter(n => n.read)
  const recentNotifications = () => notifications.value.slice(0, 5)
  const totalUnreadCount = () => unreadCount.value
  const notificationSettings = () => settings.value
  const lastUpdate = () => lastFetchTime.value

  // Actions для уведомлений пользователя
  const fetchNotifications = async () => {
    try {
      loading.value = true
      const { data } = await notificationService.getAll()
      notifications.value = data
      unreadCount.value = data.filter(n => !n.read).length
      lastFetchTime.value = new Date()
      return data
    } catch (err) {
      storeError.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchUnreadNotifications = async () => {
    try {
      loading.value = true
      const { data } = await notificationService.getUnread()
      // Обновляем только непрочитанные, сохраняя прочитанные
      const readNotifications = notifications.value.filter(n => n.read)
      notifications.value = [...data, ...readNotifications]
      unreadCount.value = data.length
      lastFetchTime.value = new Date()
      return data
    } catch (err) {
      storeError.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      const notification = notifications.value.find(n => n.id === id)
      if (notification && !notification.read) {
        notification.read = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (err) {
      storeError.value = err
      throw err
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      notifications.value.forEach(n => n.read = true)
      unreadCount.value = 0
    } catch (err) {
      storeError.value = err
      throw err
    }
  }

  const deleteNotification = async (id) => {
    try {
      await notificationService.delete(id)
      const index = notifications.value.findIndex(n => n.id === id)
      if (index !== -1) {
        const notification = notifications.value[index]
        notifications.value.splice(index, 1)
        if (!notification.read) {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
      }
    } catch (err) {
      storeError.value = err
      throw err
    }
  }

  // Управление настройками
  const fetchSettings = async () => {
    try {
      const { data } = await notificationService.getSettings()
      settings.value = data
      return data
    } catch (err) {
      storeError.value = err
      throw err
    }
  }

  const updateSettings = async (settings) => {
    try {
      const { data } = await notificationService.updateSettings(settings)
      settings.value = data
      return data
    } catch (err) {
      storeError.value = err
      throw err
    }
  }

  // Управление polling
  const startPolling = (interval = 30000) => {
    if (isPollingEnabled.value) return
    
    isPollingEnabled.value = true
    pollingInterval.value = setInterval(async () => {
      try {
        await fetchUnreadNotifications()
      } catch (err) {
        console.error('Ошибка при получении уведомлений:', err)
      }
    }, interval)
  }

  const stopPolling = () => {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
    }
    isPollingEnabled.value = false
  }

  // Очистка состояния
  const clearState = () => {
    stopPolling()
    notifications.value = []
    unreadCount.value = 0
    settings.value = null
    lastFetchTime.value = null
    storeError.value = null
    loading.value = false
    clearToasts()
  }

  return {
    // Состояние
    toasts,
    toastPosition,
    modal,
    notifications,
    unreadCount,
    settings,
    lastFetchTime,
    pollingInterval,
    isPollingEnabled,
    loading,
    storeError,

    // Методы
    showToast,
    removeToast,
    clearToasts,
    setToastPosition,
    showModal,
    closeModal,

    // Хелперы
    success,
    showError,
    warning,
    info,

    // Геттеры для уведомлений пользователя
    allNotifications,
    unreadNotifications,
    readNotifications,
    recentNotifications,
    totalUnreadCount,
    notificationSettings,
    lastUpdate,

    // Actions для уведомлений пользователя
    fetchNotifications,
    fetchUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,

    // Управление настройками
    fetchSettings,
    updateSettings,

    // Управление polling
    startPolling,
    stopPolling,

    // Очистка состояния
    clearState
  }
}) 