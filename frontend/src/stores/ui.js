/**
 * Store для управления UI состоянием
 * Управляет темой, модальными окнами и уведомлениями
 */

import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    theme: localStorage.getItem('theme') || 'light',
    sidebarOpen: false,
    modal: {
      isOpen: false,
      component: null,
      props: {}
    },
    toast: {
      show: false,
      message: '',
      type: 'info',
      duration: 3000
    }
  }),

  getters: {
    isDarkTheme: (state) => state.theme === 'dark',
    isSidebarOpen: (state) => state.sidebarOpen,
    getModal: (state) => state.modal,
    getToast: (state) => state.toast
  },

  actions: {
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', this.theme)
    },

    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },

    setSidebar(isOpen) {
      this.sidebarOpen = isOpen
    },

    openModal({ component, props = {} }) {
      this.modal = {
        isOpen: true,
        component,
        props
      }
    },

    closeModal() {
      this.modal = {
        isOpen: false,
        component: null,
        props: {}
      }
    },

    showToast({ message, type = 'info', duration = 3000 }) {
      this.toast = {
        show: true,
        message,
        type,
        duration
      }

      setTimeout(() => {
        this.hideToast()
      }, duration)
    },

    hideToast() {
      this.toast.show = false
      this.toast.message = ''
    }
  }
}) 