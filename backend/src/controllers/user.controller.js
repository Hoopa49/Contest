/**
 * Контроллер пользователей
 * Обработка HTTP запросов для работы с пользователями
 */

const BaseController = require('./base.controller')
const { userService } = require('../services')
const { ValidationError } = require('../utils/errors')
const jwt = require('jsonwebtoken')
const config = require('../config')
const crypto = require('crypto')
const redisClient = require('../utils/redis')
const { ApiError } = require('../utils/errors')

class UserController extends BaseController {
  constructor() {
    super(userService)
    this.service = userService
  }

  /**
   * Регистрация нового пользователя
   */
  register = this.handleAsync(async (req, res) => {
    const { email, password, first_name, last_name } = req.body

    if (!email || !password) {
      throw new ValidationError('Email и пароль обязательны')
    }

    const user = await this.service.createUser({
      email,
      password,
      first_name,
      last_name
    })

    this.sendSuccess(res, user, 'Регистрация успешна', 201)
  })

  /**
   * Аутентификация пользователя
   */
  login = this.handleAsync(async (req, res) => {
    const { email, password, remember } = req.body

    if (!email || !password) {
      throw new ValidationError('Email и пароль обязательны')
    }

    const user = await this.service.authenticateUser({ email, password, remember })
    this.sendSuccess(res, user, 'Вход выполнен успешно')
  })

  /**
   * Обновление токена доступа
   */
  refreshToken = this.handleAsync(async (req, res) => {
    const { refreshToken } = req.body

    if (!refreshToken) {
      throw new ValidationError('Отсутствует refresh token')
    }

    try {
      // Проверяем refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret)
      
      // Получаем пользователя
      const user = await this.service.getById(decoded.userId)
      if (!user) {
        throw new ValidationError('Пользователь не найден')
      }

      if (!user.is_active) {
        throw new ValidationError('Аккаунт деактивирован')
      }

      // Генерируем новый access token
      const accessToken = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          role: user.role
        },
        config.jwt.accessSecret,
        { expiresIn: config.jwt.accessExpiresIn }
      )

      this.sendSuccess(res, { accessToken }, 'Токен успешно обновлен')
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new ValidationError('Refresh token истек')
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ValidationError('Невалидный refresh token')
      }
      throw error
    }
  })

  /**
   * Получение профиля текущего пользователя
   */
  getProfile = this.handleAsync(async (req, res) => {
    const user = await this.service.getById(req.user.userId)
    this.sendSuccess(res, user)
  })

  /**
   * Обновление профиля пользователя
   */
  updateProfile = this.handleAsync(async (req, res) => {
    const { password, ...updateData } = req.body
    const user = await this.service.updateUser(req.user.userId, updateData)
    this.sendSuccess(res, user, 'Профиль успешно обновлен')
  })

  /**
   * Изменение пароля пользователя
   */
  changePassword = this.handleAsync(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
      throw new ValidationError('Старый и новый пароли обязательны')
    }

    const user = await this.service.changePassword(
      req.user.userId,
      oldPassword,
      newPassword
    )

    this.sendSuccess(res, user, 'Пароль успешно изменен')
  })

  /**
   * Получение списка пользователей (только для админов)
   */
  getAllUsers = this.handleAsync(async (req, res) => {
    if (req.user.role !== 'admin') {
      throw new ValidationError('Недостаточно прав')
    }

    const { page, limit } = this.getPaginationParams(req)
    const order = this.getSortParams(req)

    const result = await this.service.getAll({
      page,
      limit,
      order,
      ...req.query
    })

    this.sendSuccess(res, result)
  })

  /**
   * Получение статистики пользователя
   */
  getUserStats = this.handleAsync(async (req, res) => {
    const stats = await this.service.getUserStats(req.user.userId)
    this.sendSuccess(res, stats)
  })

  /**
   * Получение активности пользователя
   */
  getUserActivity = this.handleAsync(async (req, res) => {
    const activity = await this.service.getUserActivity(req.user.userId)
    this.sendSuccess(res, activity)
  })

  /**
   * Получение URL для авторизации через Telegram
   */
  getTelegramAuthUrl = this.handleAsync(async (req, res) => {
    const botUsername = process.env.TELEGRAM_BOT_USERNAME
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    
    if (!botUsername || !botToken) {
      throw new ApiError(500, 'Telegram bot credentials not configured')
    }

    // Генерируем случайную строку для проверки
    const authCheckString = crypto.randomBytes(20).toString('hex')
    
    // Сохраняем строку в Redis для последующей проверки
    await redisClient.set(`telegram_auth:${authCheckString}`, 'pending', 'EX', 300) // Истекает через 5 минут

    // Формируем URL для авторизации
    const authUrl = `https://t.me/${botUsername}?start=${authCheckString}`
    
    res.json({ url: authUrl })
  })

  /**
   * Обработка callback от Telegram
   */
  handleTelegramCallback = this.handleAsync(async (req, res) => {
    const { auth_string, user_data } = req.body
    
    // Проверяем строку авторизации
    const authStatus = await redisClient.get(`telegram_auth:${auth_string}`)
    if (!authStatus) {
      throw new ApiError(400, 'Invalid or expired authorization attempt')
    }
    
    // Удаляем использованную строку
    await redisClient.del(`telegram_auth:${auth_string}`)
    
    // Проверяем и обрабатываем данные пользователя
    if (!user_data || !user_data.id) {
      throw new ApiError(400, 'Invalid user data received')
    }
    
    // Ищем пользователя по Telegram ID или создаем нового
    let user = await User.findOne({ where: { telegram_id: user_data.id } })
    
    if (!user) {
      // Создаем нового пользователя
      user = await User.create({
        telegram_id: user_data.id,
        username: user_data.username,
        first_name: user_data.first_name,
        last_name: user_data.last_name,
        auth_provider: 'telegram'
      })
    }
    
    // Генерируем токены
    const { accessToken, refreshToken } = generateTokens(user)
    
    // Сохраняем refresh token
    await saveRefreshToken(user.id, refreshToken)
    
    res.json({
      user: user.toJSON(),
      tokens: {
        accessToken,
        refreshToken
      }
    })
  })

  /**
   * Выход пользователя из системы
   */
  logout = this.handleAsync(async (req, res) => {
    // Удаляем refresh token из базы данных
    await this.service.removeRefreshToken(req.user.id)
    
    // Очищаем куки
    res.clearCookie('refreshToken')
    
    this.sendSuccess(res, null, 'Выход выполнен успешно')
  })
}

module.exports = UserController 