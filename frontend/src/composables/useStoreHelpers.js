/**
 * Composable для переиспользования общей логики store
 * Содержит общие методы для работы с загрузкой и ошибками
 */

import { storeToRefs } from 'pinia'

export const useStoreHelpers = () => {
  /**
   * Базовое состояние
   */
  const baseState = () => ({
    isLoading: false,
    error: null
  })

  /**
   * Форматирование ошибки для сохранения в store
   */
  const formatError = (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message
    }
    if (error.message) {
      return error.message
    }
    return 'Произошла неизвестная ошибка'
  }

  /**
   * Обертка для асинхронных действий
   */
  const withAsync = async (store, action, options = {}) => {
    const { 
      showLoading = true, 
      logError = true,
      storeName = store.$id
    } = options

    try {
      if (showLoading) {
        store.isLoading = true
      }
      store.error = null

      const result = await action()
      
      // Проверяем результат
      if (result === undefined || result === null) {
        console.warn(`[${storeName}] Action returned ${result}`)
        return { success: false, error: 'Действие не вернуло результат' }
      }
      
      // Если результат уже имеет поле success, возвращаем как есть
      if (typeof result === 'object' && 'success' in result) {
        return result
      }
      
      // Оборачиваем результат в стандартный формат
      return {
        success: true,
        data: result
      }
    } catch (err) {
      const formattedError = formatError(err)
      store.error = formattedError
      if (logError) {
        console.error(`[${storeName}] Error:`, err)
      }
      return {
        success: false,
        error: formattedError
      }
    } finally {
      if (showLoading) {
        store.isLoading = false
      }
    }
  }

  return {
    baseState,
    withAsync,
    formatError
  }
} 