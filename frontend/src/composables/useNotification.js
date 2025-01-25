/**
 * Composable для работы с уведомлениями
 * Использует Vuetify snackbar для отображения сообщений
 */

import { ref } from 'vue'

export function useNotification() {
  const show = ref(false)
  const message = ref('')
  const color = ref('success')
  const timeout = ref(3000)

  // Показать успешное уведомление
  const showSuccess = (text, type = 'success') => {
    message.value = text
    color.value = type
    show.value = true
  }

  // Показать уведомление об ошибке
  const showError = (text) => {
    message.value = text
    color.value = 'error'
    show.value = true
  }

  // Показать информационное уведомление
  const showInfo = (text) => {
    message.value = text
    color.value = 'info'
    show.value = true
  }

  // Показать предупреждение
  const showWarning = (text) => {
    message.value = text
    color.value = 'warning'
    show.value = true
  }

  // Закрыть уведомление
  const close = () => {
    show.value = false
  }

  return {
    show,
    message,
    color,
    timeout,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    close
  }
} 