/**
 * Store для управления UI состоянием
 * Управляет темой, модальными окнами и уведомлениями
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // Состояние
  const isDarkTheme = ref(false)
  const sidebarOpen = ref(false)
  const modal = ref({
    isOpen: false,
    component: null,
    props: {}
  })
  const toast = ref({
    show: false,
    message: '',
    type: 'info',
    duration: 3000
  })

  // Методы
  const toggleTheme = () => {
    isDarkTheme.value = !isDarkTheme.value
    document.documentElement.setAttribute('data-theme', isDarkTheme.value ? 'dark' : 'light')
    localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')
  }

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  const setSidebar = (isOpen) => {
    sidebarOpen.value = isOpen
  }

  const openModal = ({ component, props = {} }) => {
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

  const showToast = ({ message, type = 'info', duration = 3000 }) => {
    toast.value = {
      show: true,
      message,
      type,
      duration
    }

    setTimeout(() => {
      hideToast()
    }, duration)
  }

  const hideToast = () => {
    toast.value.show = false
    toast.value.message = ''
  }

  // Инициализация темы
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDarkTheme.value = savedTheme === 'dark'
    } else {
      isDarkTheme.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    document.documentElement.setAttribute('data-theme', isDarkTheme.value ? 'dark' : 'light')
  }

  // Вызываем инициализацию при создании store
  initTheme()

  return {
    // Состояние
    isDarkTheme,
    sidebarOpen,
    modal,
    toast,

    // Методы
    toggleTheme,
    toggleSidebar,
    setSidebar,
    openModal,
    closeModal,
    showToast,
    hideToast
  }
}) 