/**
 * Сервис для работы с JWT токенами
 * Управляет хранением и валидацией токенов
 */

import { jwtDecode } from 'jwt-decode'
import axios from 'axios'

// Ключи для хранения токенов
const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

// Создаем отдельный инстанс для обновления токена
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

class TokenService {
  /**
   * Сохранение токенов
   */
  saveTokens({ accessToken, refreshToken }) {
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    }
    
    console.log('Токены сохранены:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenExp: this.getTokenExpiration(accessToken)
    })
  }

  /**
   * Получение access token
   */
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  }

  /**
   * Получение refresh token
   */
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  /**
   * Удаление токенов
   */
  removeTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    console.log('Токены удалены')
  }

  /**
   * Обновление токена
   */
  async refreshToken() {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token')
    }

    try {
      const { data } = await refreshClient.post('/auth/refresh', { refreshToken })
      
      if (!data?.data?.accessToken) {
        throw new Error('Failed to refresh token')
      }

      const { accessToken, refreshToken: newRefreshToken } = data.data
      this.saveTokens({ 
        accessToken,
        refreshToken: newRefreshToken || refreshToken
      })

      return accessToken
    } catch (error) {
      this.removeTokens()
      throw error
    }
  }

  /**
   * Получение времени истечения токена
   */
  getTokenExpiration(token) {
    if (!token) return null
    try {
      const decoded = jwtDecode(token)
      return decoded.exp ? new Date(decoded.exp * 1000) : null
    } catch (e) {
      console.error('Error decoding token:', e)
      return null
    }
  }

  /**
   * Проверка истечения срока токена
   */
  isTokenExpired(token) {
    const expiration = this.getTokenExpiration(token)
    if (!expiration) return true
    
    // Добавляем 5 секунд буфера
    const now = new Date()
    now.setSeconds(now.getSeconds() + 5)
    return expiration <= now
  }
}

export const tokenService = new TokenService() 