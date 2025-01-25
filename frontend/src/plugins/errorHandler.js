/**
 * Плагин для обработки ошибок
 * Добавляет глобальный обработчик ошибок и логирование
 */

import { useError } from '@/composables/useError'
import http from '@/utils/axios'

// Логирование ошибки на сервер
const logError = async (error) => {
  try {
    if (!error) return

    const errorData = {
      name: error.name || 'Unknown Error',
      message: error.message || 'No message provided',
      stack: error.stack || '',
      componentName: error.componentName || null,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }

    // Отправляем ошибку на сервер используя настроенный axios
    await http.post('/logs/error', errorData)
  } catch (err) {
    console.error('Ошибка при отправке лога:', err)
  }
}

// Плагин Vue
export default {
  install: (app) => {
    const { handleError } = useError()

    // Добавляем глобальный обработчик ошибок
    app.config.errorHandler = (error, vm) => {
      // Если ошибка не определена, создаем базовую ошибку
      if (!error) {
        error = new Error('Unknown error occurred')
      }

      // Добавляем информацию о компоненте
      if (vm?.$options?.name) {
        error.componentName = vm.$options.name
      }

      // Логируем ошибку на сервер
      logError(error)

      // Обрабатываем ошибку через useError
      handleError(error)
    }

    // Добавляем обработчик для необработанных ошибок промисов
    window.addEventListener('unhandledrejection', event => {
      const error = event.reason || new Error('Unhandled Promise Rejection')
      logError(error)
      handleError(error)
    })

    // Добавляем обработчик для необработанных ошибок
    window.addEventListener('error', event => {
      const error = event.error || new Error(event.message || 'Unknown Error Event')
      logError(error)
      handleError(error)
    })

    // Добавляем глобальные методы для обработки ошибок
    app.config.globalProperties.$handleError = handleError
    app.config.globalProperties.$clearErrors = () => {
      const { clearErrors } = useError()
      clearErrors()
    }
  }
} 