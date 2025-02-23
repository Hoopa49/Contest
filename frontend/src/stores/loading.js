/**
 * Store для управления состоянием загрузки
 * Предоставляет глобальное состояние загрузки и методы для его управления
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoadingStore = defineStore('loading', () => {
  // Состояние
  const isLoading = ref(false)
  const loadingStack = ref(0)

  // Методы
  const startLoading = () => {
    loadingStack.value++
    isLoading.value = true
  }

  const stopLoading = () => {
    loadingStack.value = Math.max(0, loadingStack.value - 1)
    isLoading.value = loadingStack.value > 0
  }

  const resetLoading = () => {
    loadingStack.value = 0
    isLoading.value = false
  }

  return {
    // Состояние
    isLoading,
    loadingStack,

    // Методы
    startLoading,
    stopLoading,
    resetLoading
  }
}) 