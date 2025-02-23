/**
 * Composable для обработки ошибок
 * Предоставляет состояние и методы для управления ошибками в компонентах
 */

import { ref } from 'vue'
import { ValidationError, AuthError, NetworkError, ServerError } from '../utils/errors'
import { useLoadingStore } from '@/stores/loading'

export function useError() {
  const loadingStore = useLoadingStore()
  
  // Состояние
  const error = ref(null)
  const fieldErrors = ref({})

  // Очистка всех ошибок
  const clearErrors = () => {
    error.value = null
    fieldErrors.value = {}
  }

  // Очистка ошибки конкретного поля
  const clearFieldError = (field) => {
    if (fieldErrors.value[field]) {
      delete fieldErrors.value[field]
      if (!Object.keys(fieldErrors.value).length) {
        error.value = null
      }
    }
  }

  // Проверка наличия ошибки поля
  const hasFieldError = (field) => {
    return !!fieldErrors.value[field]
  }

  // Получение текста ошибки поля
  const getFieldError = (field) => {
    return fieldErrors.value[field]?.[0] || null
  }

  // Получение всех ошибок поля
  const getFieldErrors = (field) => {
    return fieldErrors.value[field] || []
  }

  // Обработка ошибки
  const handleError = (err) => {
    clearErrors()

    if (!err) {
      error.value = {
        type: 'unknown',
        message: 'Произошла неизвестная ошибка'
      }
      return
    }

    // Если это ошибка валидации
    if (err instanceof ValidationError) {
      error.value = {
        type: 'validation',
        message: err.message || 'Ошибка валидации'
      }
      fieldErrors.value = err.errors || {}
      return
    }

    // Если это ошибка аутентификации
    if (err instanceof AuthError) {
      error.value = {
        type: 'auth',
        message: err.message || 'Ошибка аутентификации'
      }
      return
    }

    // Если это ошибка сети
    if (err instanceof NetworkError) {
      error.value = {
        type: 'network',
        message: err.message || 'Ошибка сети'
      }
      return
    }

    // Если это ошибка сервера
    if (err instanceof ServerError) {
      error.value = {
        type: 'server',
        message: err.message || 'Ошибка сервера'
      }
      return
    }

    // Для остальных типов ошибок
    error.value = {
      type: 'unknown',
      message: err.message || 'Произошла неизвестная ошибка'
    }
  }

  /**
   * Безопасное выполнение асинхронной операции
   * @param {Function} operation - Асинхронная операция для выполнения
   * @param {Object} options - Опции выполнения
   * @param {boolean} options.showLoader - Показывать ли индикатор загрузки
   * @param {boolean} options.clearErrorsBeforeExecute - Очищать ли ошибки перед выполнением
   * @returns {Promise} Результат выполнения операции
   */
  const safeExecute = async (operation, options = {}) => {
    const { 
      showLoader = true, 
      clearErrorsBeforeExecute = true 
    } = options

    try {
      if (clearErrorsBeforeExecute) {
        clearErrors()
      }

      if (showLoader) {
        loadingStore.startLoading()
      }

      return await operation()
    } catch (err) {
      handleError(err)
      throw err
    } finally {
      if (showLoader) {
        loadingStore.stopLoading()
      }
    }
  }

  /**
   * Безопасное выполнение операции с формой
   * @param {Function} operation - Асинхронная операция для выполнения
   * @param {Object} form - Ссылка на форму Vue (v-form)
   * @param {Object} options - Опции выполнения
   * @param {boolean} options.validateForm - Выполнять ли валидацию формы
   * @returns {Promise} Результат выполнения операции
   */
  const safeSubmit = async (operation, form, options = {}) => {
    const { validateForm = true } = options

    if (validateForm && form?.validate) {
      const isValid = await form.validate()
      if (!isValid) {
        return false
      }
    }

    return safeExecute(operation, options)
  }

  return {
    error,
    fieldErrors,
    clearErrors,
    clearFieldError,
    hasFieldError,
    getFieldError,
    getFieldErrors,
    handleError,
    safeExecute,
    safeSubmit
  }
} 