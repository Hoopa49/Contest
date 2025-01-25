/**
 * Миксин для обработки ошибок в компонентах
 * Предоставляет методы для обработки ошибок и валидации форм
 */

import { useError } from '@/composables/useError'

export default {
  setup() {
    const { 
      error, 
      fieldErrors, 
      clearErrors, 
      clearFieldError,
      handleError, 
      hasFieldError, 
      getFieldError,
      getFieldErrors
    } = useError()

    return {
      error,
      fieldErrors,
      clearErrors,
      clearFieldError,
      handleError,
      hasFieldError,
      getFieldError,
      getFieldErrors
    }
  },

  methods: {
    /**
     * Безопасное выполнение асинхронной операции
     */
    async safeExecute(operation, options = {}) {
      const { showLoader = true, clearErrorsBeforeExecute = true } = options

      try {
        if (clearErrorsBeforeExecute) {
          this.clearErrors()
        }

        if (showLoader) {
          // TODO: Показать лоадер
        }

        return await operation()
      } catch (error) {
        this.handleError(error)
        throw error
      } finally {
        if (showLoader) {
          // TODO: Скрыть лоадер
        }
      }
    },

    /**
     * Безопасное выполнение операции с формой
     */
    async safeSubmit(operation, options = {}) {
      const { validateForm = true } = options

      if (validateForm && !await this.validateForm()) {
        return false
      }

      return this.safeExecute(operation, options)
    },

    /**
     * Валидация формы
     */
    async validateForm() {
      if (this.$refs.form?.validate) {
        return await this.$refs.form.validate()
      }
      return true
    }
  },

  beforeUnmount() {
    // Очищаем ошибки при уничтожении компонента
    this.clearErrors()
  }
} 