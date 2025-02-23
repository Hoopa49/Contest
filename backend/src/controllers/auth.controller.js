const userService = require('../services/user.service')
const jwtService = require('../services/jwt.service')
const logger = require('../logging')
const BaseController = require('./base.controller')
const { ValidationError } = require('../utils/errors')
const config = require('../config')
const UserModel = require('../models/user.model')
const crypto = require('crypto')
const telegramBot = require('../bot/telegram.bot')

class AuthController extends BaseController {
  constructor() {
    super(userService)
    this.userService = userService
  }

  register = this.handleAsync(async (req, res) => {
    const user = await userService.createUser(req.body)
    const accessToken = jwtService.generateAccessToken(user)
    const refreshToken = jwtService.generateRefreshToken(user)
    
    // Устанавливаем refresh token в куки
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 дней
    })
    
    res.status(201).json({
      success: true,
      message: 'Регистрация успешна',
      data: {
        user,
        accessToken
      }
    })
  })

  login = this.handleAsync(async (req, res) => {
    try {
      const { email, password, remember } = req.body

      if (!email || !password) {
        throw new ValidationError('Email и пароль обязательны')
      }

      // Аутентифицируем пользователя
      const authenticatedUser = await this.userService.authenticateUser({ email, password, remember })
      
      // Обновляем дату последнего входа
      await UserModel.update(
        { last_login: new Date() },
        { where: { id: authenticatedUser.id } }
      )

      // Генерируем токены
      const accessToken = jwtService.generateAccessToken(authenticatedUser)
      const refreshToken = jwtService.generateRefreshToken(authenticatedUser)
      
      // Устанавливаем refresh token в куки
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 дней или 24 часа
      })
      
      res.json({
        success: true,
        message: 'Вход выполнен успешно',
        data: {
          user: authenticatedUser,
          accessToken
        }
      })
    } catch (error) {
      logger.error('Ошибка при входе:', error)
      throw error
    }
  })

  refreshToken = this.handleAsync(async (req, res) => {
    // Получаем refresh token из куки
    const token = req.cookies.refreshToken
    
    if (!token) {
      throw new ValidationError('Refresh token не предоставлен')
    }

    const decoded = jwtService.verifyRefreshToken(token)
    const user = await userService.getById(decoded.userId)
    
    if (!user) {
      throw new ValidationError('Пользователь не найден')
    }
    
    const accessToken = jwtService.generateAccessToken(user)
    const refreshToken = jwtService.generateRefreshToken(user)
    
    // Обновляем refresh token в куки
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 дней
    })
    
    res.json({
      success: true,
      message: 'Токены успешно обновлены',
      data: {
        accessToken
      }
    })
  })

  logout = this.handleAsync(async (req, res) => {
    // Удаляем refresh token из куки
    res.clearCookie('refreshToken')
    
    res.json({
      success: true,
      message: 'Выход выполнен успешно'
    })
  })

  getCurrentUser = this.handleAsync(async (req, res) => {
    
    const user = await userService.getById(req.user.id)
    if (!user) {
      throw new ValidationError('Пользователь не найден')
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON ? user.toJSON() : user
      }
    })
  })

  updateProfile = this.handleAsync(async (req, res) => {
    const user = await userService.updateUser(req.user.userId, req.body)
    
    res.json({
      success: true,
      message: 'Профиль обновлен',
      data: {
        user: user.toJSON ? user.toJSON() : user
      }
    })
  })

  changePassword = this.handleAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body
    
    await userService.changePassword(req.user.userId, currentPassword, newPassword)
    
    res.json({
      success: true,
      message: 'Пароль успешно изменен'
    })
  })

  getTelegramAuthUrl = this.handleAsync(async (req, res) => {
    try {
      const botUsername = process.env.TELEGRAM_BOT_USERNAME
      if (!botUsername) {
        throw new ValidationError('TELEGRAM_BOT_USERNAME не настроен')
      }

      // Генерируем уникальный код авторизации
      const authCode = crypto.randomBytes(32).toString('hex')
      
      // Формируем URL для открытия чата с ботом
      const telegramUrl = `https://t.me/${botUsername}?start=${authCode}`
      
      res.json({
        success: true,
        data: {
          url: telegramUrl,
          authCode
        }
      })
    } catch (error) {
      logger.error('Ошибка при получении URL для Telegram авторизации:', error)
      res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Внутренняя ошибка сервера'
      })
    }
  })

  handleTelegramCallback = this.handleAsync(async (req, res) => {
    try {
      const { id, first_name, last_name, username, photo_url, auth_date, hash } = req.body
      
      logger.info('Получены данные от Telegram:', {
        id,
        username,
        first_name,
        last_name,
        auth_date,
        hash
      })

      // Проверяем данные от Telegram
      const botToken = process.env.TELEGRAM_BOT_TOKEN
      if (!botToken) {
        logger.error('TELEGRAM_BOT_TOKEN не настроен')
        throw new ValidationError('Ошибка конфигурации Telegram')
      }

      const checkString = Object.keys(req.body)
        .filter(key => key !== 'hash')
        .sort()
        .map(key => `${key}=${req.body[key]}`)
        .join('\n')

      logger.debug('Строка для проверки:', checkString)

      const secretKey = crypto.createHash('sha256')
        .update(botToken)
        .digest()

      const hmac = crypto.createHmac('sha256', secretKey)
        .update(checkString)
        .digest('hex')

      logger.debug('Сравнение хешей:', { 
        received: hash,
        calculated: hmac
      })

      if (hmac !== hash) {
        logger.error('Неверный хеш данных от Telegram')
        throw new ValidationError('Недействительные данные авторизации')
      }

      // Проверяем время авторизации (не более 1 дня)
      const authTime = new Date(auth_date * 1000)
      if (Date.now() - authTime.getTime() > 86400000) {
        logger.error('Истекло время авторизации:', {
          authTime,
          currentTime: new Date(),
          difference: Date.now() - authTime.getTime()
        })
        throw new ValidationError('Время авторизации истекло')
      }

      // Ищем или создаем пользователя
      let user = await UserModel.findOne({ where: { telegram_id: id } })
      
      if (!user) {
        logger.info('Создание нового пользователя Telegram:', {
          telegram_id: id,
          username,
          first_name,
          last_name
        })

        user = await UserModel.create({
          telegram_id: id,
          username,
          first_name,
          last_name,
          avatar: photo_url,
          auth_provider: 'telegram',
          is_active: true
        })
      }

      // Генерируем токены
      const accessToken = jwtService.generateAccessToken(user)
      const refreshToken = jwtService.generateRefreshToken(user)

      logger.info('Успешная авторизация через Telegram:', { userId: user.id })

      res.json({
        success: true,
        data: {
          user,
          accessToken,
          refreshToken
        }
      })
    } catch (error) {
      logger.error('Ошибка при обработке Telegram callback:', error)
      res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Внутренняя ошибка сервера'
      })
    }
  })
}

module.exports = new AuthController() 