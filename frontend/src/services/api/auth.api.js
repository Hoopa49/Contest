/**
 * API сервис для аутентификации
 * Обрабатывает запросы, связанные с регистрацией, входом и управлением профилем пользователя
 */

import http from '@/utils/axios'
import { AuthError } from '@/utils/errors'
import { tokenService } from './auth/token.service'
import { apiService } from './api.service'

class AuthAPI {
  /**
   * Регистрация нового пользователя
   */
  async register(data) {
    console.log('Данные для регистрации:', data)
    
    try {
      const response = await http.post('/auth/register', data)
      console.log('Ответ от сервера:', response)
      
      if (response.data?.success && response.data?.data) {
        const { user, accessToken, refreshToken } = response.data.data
        
        // Сохраняем токены
        tokenService.saveTokens({ 
          accessToken,
          refreshToken
        })
        
        return { 
          success: true,
          user,
          tokens: {
            accessToken,
            refreshToken
          }
        }
      }
      
      return {
        success: false,
        message: response.data?.message || 'Ошибка при регистрации'
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error)
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Ошибка при регистрации'
      }
    }
  }

  /**
   * Аутентификация пользователя
   */
  async login(credentials) {
    try {
      console.debug('Login attempt:', { email: credentials.email })
      
      const response = await http.post('/auth/login', credentials)
      
      console.debug('Raw login response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      })

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Ошибка входа')
      }

      const accessToken = response.data?.data?.accessToken
      if (!accessToken) {
        throw new Error('Отсутствует токен доступа')
      }

      // Сохраняем токен
      tokenService.saveTokens({ 
        accessToken,
        refreshToken: null // Пока не используем refresh token
      })

      // Получаем данные пользователя
      console.debug('Fetching user data...')
      const userData = await this.getCurrentUser()
      console.debug('User data received:', userData)

      const user = userData?.user || userData
      if (!user || !user.id) {
        throw new Error('Не удалось получить данные пользователя')
      }

      return {
        user,
        tokens: {
          accessToken,
          refreshToken: null
        }
      }
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      })
      throw error
    }
  }

  /**
   * Обновление токена
   */
  async refreshAccessToken() {
    try {
      const refreshToken = tokenService.getRefreshToken()
      if (!refreshToken) {
        throw new AuthError('Отсутствует refresh token')
      }

      const { data } = await http.post('/auth/refresh', { refreshToken })
      
      if (!data.success || !data.data?.accessToken) {
        throw new Error('Не удалось обновить токен')
      }

      const { accessToken } = data.data
      tokenService.saveTokens({ 
        accessToken,
        refreshToken
      })

      return accessToken
    } catch (error) {
      tokenService.removeTokens()
      throw error
    }
  }

  /**
   * Выход пользователя
   */
  async logout() {
    try {
      await http.post('/auth/logout')
    } finally {
      tokenService.removeTokens()
    }
  }

  /**
   * Получение текущего пользователя
   */
  async getCurrentUser() {
    try {
      console.debug('Getting current user')
      
      // Проверяем наличие токена
      const token = tokenService.getAccessToken()
      console.debug('Access token for request:', {
        hasToken: !!token,
        tokenStart: token ? token.substring(0, 20) + '...' : null
      })

      const response = await apiService.get('/auth/me')
      console.debug('Current user response:', response)

      // Проверяем наличие данных пользователя
      if (!response?.data?.user) {
        throw new Error('Не удалось получить данные пользователя')
      }

      return response.data.user
    } catch (error) {
      console.error('Error getting current user:', {
        message: error.message,
        response: error.response,
        data: error.response?.data,
        stack: error.stack
      })
      throw error
    }
  }

  /**
   * Обновление профиля
   */
  async updateProfile(userData) {
    const { data } = await http.put('/auth/profile', userData)
    
    if (!data.success || !data.data?.user) {
      throw new Error('Не удалось обновить профиль')
    }
    
    return data.data.user
  }

  /**
   * Изменение пароля
   */
  async changePassword(passwords) {
    const { data } = await http.put('/auth/password', passwords)
    
    if (!data.success) {
      throw new Error(data.message || 'Не удалось изменить пароль')
    }
    
    return true
  }

  /**
   * Получение URL для авторизации через соцсеть
   */
  async getSocialAuthUrl(provider) {
    const { data } = await http.get(`/auth/${provider}/url`)
    
    if (!data.success || !data.data?.url) {
      throw new Error(data.message || 'Не удалось получить URL для авторизации')
    }
    
    return data.data
  }

  /**
   * Получение URL для авторизации через Telegram
   */
  async getTelegramAuthUrl() {
    try {
      const { data } = await http.get('/auth/telegram/url')
      
      if (!data.success || !data.data?.url) {
        throw new Error(data.message || 'Не удалось получить URL для авторизации')
      }
      
      return data.data
    } catch (error) {
      console.error('Ошибка при получении URL для Telegram авторизации:', error)
      throw error
    }
  }

  /**
   * Обработка callback от Telegram
   */
  async handleTelegramCallback(authData) {
    try {
      const { data } = await http.post('/auth/telegram/callback', authData)
      
      if (!data.success || !data.data?.user || !data.data?.accessToken) {
        throw new Error(data.message || 'Ошибка при авторизации через Telegram')
      }
      
      // Сохраняем токены
      const { accessToken, refreshToken } = data.data
      tokenService.saveTokens({ 
        accessToken,
        refreshToken
      })
      
      return {
        user: data.data.user,
        accessToken,
        refreshToken
      }
    } catch (error) {
      console.error('Ошибка при обработке Telegram callback:', error)
      tokenService.removeTokens()
      throw error
    }
  }
}

export const authService = new AuthAPI() 