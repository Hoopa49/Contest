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
        return result
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

    /**
     * Запрос на сброс пароля
     */
    async resetPassword(email) {
      return withAsync(this, async () => {
        const result = await authService.resetPassword(email)
        return result
      })
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
    },

    /**
     * Авторизация через социальные сети
     */
    async socialLogin(provider) {
      return withAsync(this, async () => {
        try {
          // Получаем URL для авторизации
          const authData = await this.getSocialAuthUrl(provider)
          
          if (!authData) {
            console.error('Не удалось получить URL для авторизации:', authData)
            throw new Error('Не удалось получить URL для авторизации')
          }
          
          // Определяем URL для авторизации
          let authUrl
          if (typeof authData === 'string') {
            authUrl = authData
          } else if (typeof authData === 'object') {
            if (authData.data) {
              authUrl = authData.data
            } else if (authData.url) {
              authUrl = authData.url
            } else {
              console.error('Неверный формат URL для авторизации:', authData)
              throw new Error('Неверный формат URL для авторизации')
            }
          }
          
          if (!authUrl) {
            console.error('URL для авторизации отсутствует:', authData)
            throw new Error('URL для авторизации отсутствует')
          }

          // Создаем уникальный идентификатор для окна
          const windowName = `${provider}Auth_${Date.now()}`
          
          // Открываем окно авторизации
          const width = 600
          const height = 600
          const left = Math.max(0, (window.innerWidth - width) / 2)
          const top = Math.max(0, (window.innerHeight - height) / 2)
          
          const windowFeatures = [
            `width=${width}`,
            `height=${height}`,
            `left=${left}`,
            `top=${top}`,
            'menubar=no',
            'toolbar=no',
            'location=no',
            'status=no',
            'scrollbars=yes'
          ].join(',')
          
          const authWindow = window.open(authUrl, windowName, windowFeatures)
          
          if (!authWindow) {
            throw new Error('Не удалось открыть окно авторизации. Проверьте, не блокирует ли браузер всплывающие окна.')
          }

          return new Promise((resolve, reject) => {
            let checkClosedInterval = null
            const maxWaitTime = 300000 // 5 минут
            const startTime = Date.now()

            // Функция очистки
            const cleanup = () => {
              if (checkClosedInterval) {
                clearInterval(checkClosedInterval)
                checkClosedInterval = null
              }
              
              try {
                if (authWindow && !authWindow.closed) {
                  authWindow.close()
                }
              } catch (e) {
                console.debug('Ошибка при закрытии окна:', e)
              }
            }

            // Проверяем закрытие окна и URL
            checkClosedInterval = setInterval(() => {
              try {
                // Проверяем, не истекло ли время ожидания
                if (Date.now() - startTime > maxWaitTime) {
                  cleanup()
                  reject(new Error('Превышено время ожидания авторизации'))
                  return
                }

                // Проверяем, не закрыто ли окно
                if (authWindow.closed) {
                  cleanup()
                  reject(new Error('Окно авторизации было закрыто'))
                  return
                }

                // Проверяем URL окна
                try {
                  const currentUrl = authWindow.location.href
                  if (currentUrl.includes('auth/callback') || currentUrl.includes('auth/success')) {
                    cleanup()
                    // После успешной авторизации обновляем состояние
                    this.init().then(({ user }) => {
                      if (user) {
                        resolve({ user })
                      } else {
                        reject(new Error('Не удалось получить данные пользователя'))
                      }
                    }).catch(reject)
                  }
                } catch (e) {
                  // Игнорируем ошибки доступа к location из-за Same-Origin Policy
                }
              } catch (e) {
                cleanup()
                reject(e)
              }
            }, 1000)

            // Устанавливаем обработчик для закрытия окна при уходе со страницы
            window.addEventListener('unload', cleanup)
          })
        } catch (error) {
          console.error('Ошибка при авторизации через соцсеть:', {
            message: error.message,
            response: error.response?.data,
            stack: error.stack
          })
          throw error
        }
      })
    }
  }
}) 