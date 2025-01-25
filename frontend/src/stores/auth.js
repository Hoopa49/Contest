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
    isAdmin: (state) => {
      console.debug('Checking admin role:', {
        user: state.user,
        role: state.user?.role,
        isAdmin: state.user?.role === 'admin'
      })
      return state.user?.role === 'admin'
    }
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
          console.debug('Session validity check:', { isValid })

          let result = {
            user: null,
            isAuthenticated: false
          }

          if (isValid) {
            const response = await authService.getCurrentUser()
            console.debug('Current user data received:', {
              response,
              user: response.user || response
            })

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
          console.error('Error during initialization:', error)
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
      console.debug('Updating auth state:', {
        user,
        tokens: tokens ? { 
          accessToken: !!tokens.accessToken,
          refreshToken: !!tokens.refreshToken
        } : null
      })
      
      // Сохраняем токены
      tokenService.saveTokens(tokens)
      
      // Обновляем состояние
      this.user = user
      this.isAuthenticated = true
      
      console.debug('Auth state updated:', {
        user: this.user,
        isAuthenticated: this.isAuthenticated
      })

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
        console.error('[auth] Registration error:', error)
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
        console.error('[auth] Login error:', error.message)
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
      console.debug('Clearing auth state')
      this.user = null
      this.isAuthenticated = false
      tokenService.removeTokens()
      console.debug('Auth state cleared:', {
        user: this.user,
        isAuthenticated: this.isAuthenticated
      })
    },

    /**
     * Методы для Telegram авторизации
     */
    async getTelegramAuthUrl() {
      try {
        const data = await authService.getTelegramAuthUrl()
        return data
      } catch (error) {
        console.error('Failed to get Telegram auth URL:', error)
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
        console.error('Failed to handle Telegram callback:', error)
        throw error
      }
    }
  }
}) 