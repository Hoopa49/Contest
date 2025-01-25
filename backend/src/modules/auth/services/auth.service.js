/**
 * Auth Service
 * Сервис для работы с аутентификацией и авторизацией
 */

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User, UserToken, UserProfile } = require('../../../models')
const config = require('../../../config')
const { logger } = require('../../../logging')
const { AuthenticationError, ApiError } = require('../../../utils/errors')
const crypto = require('crypto')
const redisClient = require('../../../utils/redis')

class AuthService {
  /**
   * Регистрация нового пользователя
   */
  async createUser({ first_name, last_name, email, password }) {
    try {
      // Проверяем обязательные поля
      if (!email || !password) {
        throw new AuthenticationError('Email и пароль обязательны')
      }

      // Проверяем, существует ли пользователь
      const existingUser = await User.findOne({ where: { email } })
      if (existingUser) {
        throw new AuthenticationError('Пользователь с таким email уже существует')
      }

      // Создаем пользователя (пароль будет захеширован автоматически через хук)
      const user = await User.create({
        first_name,
        last_name,
        email,
        password_hash: password, // хук beforeSave захеширует пароль
        role: 'user',
        is_active: true
      })

      // Генерируем токены
      const accessToken = this._generateToken(user)
      const refreshToken = this._generateRefreshToken(user)

      return {
        user: {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    } catch (error) {
      log.error('Ошибка при создании пользователя:', error)
      throw error
    }
  }

  /**
   * Аутентификация пользователя
   */
  async authenticateUser({ email, password }) {
    try {
      // Проверяем обязательные поля
      if (!email || !password) {
        throw new AuthenticationError('Email и пароль обязательны')
      }

      // Валидация формата email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new AuthenticationError('Неверный формат email')
      }

      // Ищем пользователя
      const user = await User.findOne({ where: { email } })
      if (!user) {
        log.debug('Пользователь не найден:', email)
        throw new AuthenticationError('Неверный email или пароль')
      }

      // Проверяем активен ли пользователь
      if (!user.is_active) {
        throw new AuthenticationError('Аккаунт деактивирован')
      }

      // Проверяем не заблокирован ли пользователь
      if (user.is_blocked) {
        throw new AuthenticationError('Аккаунт заблокирован')
      }

      // Проверяем пароль используя метод модели
      const isValidPassword = await user.validatePassword(password)
      if (!isValidPassword) {
        throw new AuthenticationError('Неверный email или пароль')
      }

      // Обновляем дату последнего входа
      await user.update({ last_login: new Date() })

      // Генерируем токены
      const accessToken = this._generateToken(user)
      const refreshToken = this._generateRefreshToken(user)

      const userData = {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role
      }

      return {
        user: userData,
        accessToken,
        refreshToken
      }
    } catch (error) {
      log.error('Ошибка при аутентификации:', error)
      throw error
    }
  }

  /**
   * Обновление профиля пользователя
   */
  async updateProfile(userId, { name, email }) {
    try {
      // Ищем пользователя
      const user = await User.findByPk(userId)
      if (!user) {
        throw new AuthenticationError('Пользователь не найден')
      }

      // Проверяем, не занят ли email другим пользователем
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } })
        if (existingUser) {
          throw new AuthenticationError('Пользователь с таким email уже существует')
        }
      }

      // Разделяем имя на first_name и last_name, если оно предоставлено
      let updateData = {}
      
      if (name) {
        const nameParts = name.trim().split(/\s+/)
        updateData.first_name = nameParts[0]
        updateData.last_name = nameParts.slice(1).join(' ') || null
      }
      
      if (email) {
        updateData.email = email
      }

      // Обновляем пользователя
      await user.update(updateData)

      return {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role
      }
    } catch (error) {
      log.error('Ошибка при обновлении профиля:', error)
      throw error
    }
  }

  /**
   * Изменение пароля пользователя
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Ищем пользователя
      const user = await User.findByPk(userId)
      if (!user) {
        throw new AuthenticationError('Пользователь не найден')
      }

      // Проверяем текущий пароль
      const isValidPassword = await user.validatePassword(currentPassword)
      if (!isValidPassword) {
        throw new AuthenticationError('Неверный текущий пароль')
      }

      // Обновляем пароль (хук beforeSave захеширует пароль)
      await user.update({ password_hash: newPassword })

      return true
    } catch (error) {
      log.error('Ошибка при изменении пароля:', error)
      throw error
    }
  }

  /**
   * Генерация JWT токена
   */
  _generateToken(user) {
    if (!config.jwt.accessSecret) {
      log.error('JWT_ACCESS_SECRET не установлен в конфигурации')
      throw new Error('Ошибка конфигурации JWT')
    }

    return jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiresIn }
    )
  }

  /**
   * Генерация Refresh токена
   */
  _generateRefreshToken(user) {
    if (!config.jwt.refreshSecret) {
      log.error('JWT_REFRESH_SECRET не установлен в конфигурации')
      throw new Error('Ошибка конфигурации JWT')
    }

    return jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        type: 'refresh'
      },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    )
  }

  /**
   * Получение URL для авторизации через Telegram
   */
  async getTelegramAuthUrl() {
    try {
      const botUsername = process.env.TELEGRAM_BOT_USERNAME
      const botToken = process.env.TELEGRAM_BOT_TOKEN
      
      if (!botUsername || !botToken) {
        log.error('Telegram bot credentials not configured')
        throw new AuthenticationError('Telegram bot credentials not configured')
      }

      // Генерируем случайную строку для проверки
      const authCheckString = crypto.randomBytes(20).toString('hex')
      
      // Сохраняем строку в Redis для последующей проверки
      await redisClient.set(`telegram_auth:${authCheckString}`, 'pending', 'EX', 300) // Истекает через 5 минут

      // Формируем URL для авторизации
      const authUrl = `https://t.me/${botUsername}?start=${authCheckString}`
      
      return { url: authUrl, checkString: authCheckString }
    } catch (error) {
      log.error('Error generating Telegram auth URL:', error)
      throw error
    }
  }

  /**
   * Обработка callback от Telegram
   */
  async handleTelegramCallback({ auth_string, user_data }) {
    try {
      // Проверяем строку авторизации
      const authStatus = await redisClient.get(`telegram_auth:${auth_string}`)
      if (!authStatus) {
        log.warn('Invalid or expired Telegram auth attempt')
        throw new AuthenticationError('Invalid or expired authorization attempt')
      }
      
      // Удаляем использованную строку
      await redisClient.del(`telegram_auth:${auth_string}`)
      
      // Проверяем данные пользователя
      if (!user_data || !user_data.id) {
        log.error('Invalid Telegram user data received:', user_data)
        throw new AuthenticationError('Invalid user data received')
      }
      
      // Ищем пользователя по Telegram ID
      let user = await User.findOne({ where: { telegram_id: user_data.id } })
      
      if (!user) {
        // Создаем нового пользователя
        user = await User.create({
          telegram_id: user_data.id,
          username: user_data.username,
          first_name: user_data.first_name,
          last_name: user_data.last_name,
          auth_provider: 'telegram',
          is_active: true
        })
        log.info('Created new user via Telegram:', user.id)
      }
      
      // Генерируем токены
      const accessToken = this._generateToken(user)
      const refreshToken = this._generateRefreshToken(user)
      
      return {
        user: {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          telegram_id: user.telegram_id,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    } catch (error) {
      log.error('Error handling Telegram callback:', error)
      throw error
    }
  }
}

// Создаем и экспортируем экземпляр сервиса
module.exports = new AuthService() 