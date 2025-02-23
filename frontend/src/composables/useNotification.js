import { useNotificationStore } from '@/stores/notification'

export function useNotification() {
  const notificationStore = useNotificationStore()

  const showNotification = (type, message, timeout = 5000) => {
    try {
      notificationStore.showToast({ 
        message, 
        type, 
        duration: timeout 
      })
    } catch (error) {
      console.error('Ошибка при показе уведомления:', error)
    }
  }

  const showSuccess = (message, timeout) => {
    showNotification('success', message, timeout)
  }

  const showError = (message, timeout = 5000) => {
    showNotification('error', message, timeout)
  }

  const showWarning = (message, timeout = 4000) => {
    showNotification('warning', message, timeout)
  }

  const showInfo = (message, timeout = 3000) => {
    showNotification('info', message, timeout)
  }

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
} 