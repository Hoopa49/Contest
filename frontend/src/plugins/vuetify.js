/**
 * Конфигурация Vuetify
 * Настройка темы, локализации и компонентов
 */

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { ru } from 'vuetify/locale'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import '@/assets/styles/fonts.css'
import 'vuetify/styles'

// Создаем экземпляр Vuetify
export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#4A90E2',         // Основной бирюзовый
          'primary-darken-1': '#2B6CB0', // Темно-бирюзовый
          secondary: '#EDF2F7',       // Светло-серый
          'secondary-darken-1': '#E2E8F0', // Серый
          background: '#FFFFFF',      // Белый
          surface: '#FFFFFF',         // Белый
          'surface-bright': '#FFFFFF', // Белый
          'surface-variant': '#F7FAFC', // Очень светлый серый
          error: '#E53E3E',          // Красный
          info: '#63B3ED',           // Голубой
          success: '#48BB78',        // Зеленый
          warning: '#ECC94B'         // Желтый
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#9061FF',         // Фиолетовый
          'primary-darken-1': '#7C3AED', // Темно-фиолетовый
          secondary: '#2F2F3A',       // Темно-серый
          'secondary-darken-1': '#252534', // Еще более темный серый
          background: '#1E1E2D',      // Темно-синий
          surface: '#2A2A36',         // Темно-серый
          'surface-bright': '#2A2A36', // Темно-серый
          'surface-variant': '#1A1A24', // Почти черный
          error: '#FF5252',          // Красный
          info: '#2196F3',           // Синий
          success: '#4CAF50',        // Зеленый
          warning: '#FFC107'         // Желтый
        }
      }
    }
  },
  
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  },
  
  locale: {
    locale: 'ru',
    messages: { ru }
  },
  
  defaults: {
    VBtn: {
      variant: 'elevated',
      style: 'text-transform: none;'
    },
    VCard: {
      elevation: 2
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable'
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable'
    }
  }
}) 