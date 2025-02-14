/**
 * Store для управления состоянием аутентификации
 */

import { defineStore } from 'pinia'
import { authService } from '@/services/api/auth.api'
import { tokenService } from '@/services/api/auth/token.service'
import { useStoreHelpers } from '@/composables/useStoreHelpers'
import { useContestsStore } from '@/stores/contests'

const { baseState, withAsync } = useStoreHelpers()

export const useAuthStore = defineStore('auth', {
  state: () => ({
    ...baseState(),
    user: null,
    isInitialized: false,
    initPromise: null,
    socialAuthWindow: null,
    isAuthenticated: false
  }),

  getters: {
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    /**
     * Проверка валидности сессии
     */
    async isSessionValid() {
      const token = tokenService.getAccessToken()
      if (!token) {
        console.debug('Сессия невалидна: токен отсутствует')
        return false
      }

      // Если токен истек, пробуем его обновить
      if (tokenService.isTokenExpired(token)) {
        console.debug('Токен истек, пробуем обновить')
        try {
          await tokenService.refreshToken()
          return true
        } catch (error) {
          console.debug('Не удалось обновить токен:', error)
          return false
        }
      }

      return true
    },

    /**
     * Инициализация состояния авторизации
     */
    async init() {
      if (this.initPromise) {
        return this.initPromise
      }

      this.initPromise = withAsync(this, async () => {
        try {
          const isValid = await this.isSessionValid()

          let result = {
            user: null,
            isAuthenticated: false
          }

          if (isValid) {
            const response = await authService.getCurrentUser()

            this.user = response.user || response
            this.isAuthenticated = true

            result = {
              user: this.user,
              isAuthenticated: true
            }

            // Загружаем избранные конкурсы после успешной инициализации
            const contestsStore = useContestsStore()
            await contestsStore.loadFavoriteContests()
          } else {
            this.clearAuth()
          }

          this.isInitialized = true
          return result
        } catch (error) {
          this.clearAuth()
          this.isInitialized = true
          throw error
        }
      })

      return this.initPromise
    },

    /**
     * Обновление состояния после успешной авторизации
     */
    async updateAuthState(user, tokens) {
      // Сохраняем токены
      tokenService.saveTokens(tokens)
      
      // Обновляем состояние
      this.user = user
      this.isAuthenticated = true

      // Загружаем избранные конкурсы
      const contestsStore = useContestsStore()
      await contestsStore.loadFavoriteContests()
      
      return { user, tokens }
    },

    /**
     * Регистрация нового пользователя
     */
    async register(userData) {
      try {
        const { user, tokens } = await authService.register(userData)
        return this.updateAuthState(user, tokens)
      } catch (error) {
        throw error
      }
    },

    /**
     * Вход в систему
     */
    async login(credentials) {
      try {
        const { user, tokens } = await authService.login(credentials)
        return this.updateAuthState(user, tokens)
      } catch (error) {
        throw error
      }
    },

    /**
     * Выход из системы
     */
    async logout() {
      return withAsync(this, async () => {
        await authService.logout()
        this.clearAuth()
      })
    },

    /**
     * Получение URL для авторизации через соцсеть
     */
    async getSocialAuthUrl(provider) {
      return withAsync(this, async () => {
        const result = await authService.getSocialAuthUrl(provider)
        return result.url
      })
    },

    /**
     * Очистка данных авторизации
     */
    clearAuth() {
      this.user = null
      this.isAuthenticated = false
      tokenService.removeTokens()
    },

    /**
     * Методы для Telegram авторизации
     */
    async getTelegramAuthUrl() {
      try {
        const data = await authService.getTelegramAuthUrl()
        return data
      } catch (error) {
        throw error
      }
    },

    async handleTelegramCallback(authData) {
      try {
        const { user, accessToken, refreshToken } = await authService.handleTelegramCallback(authData)
        
        // Сохраняем токены
        tokenService.saveTokens({ accessToken, refreshToken })
        
        // Обновляем состояние
        this.user = user
        this.isAuthenticated = true
        
        return { user, accessToken, refreshToken }
      } catch (error) {
        throw error
      }
    }
  }
}) 