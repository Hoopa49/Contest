const userService = require('../services/user.service')
const jwtService = require('../services/jwt.service')
const logger = require('../logging')
const BaseController = require('./base.controller')
const { ValidationError } = require('../utils/errors')
const config = require('../config')

class AuthController extends BaseController {
  constructor() {
    super(userService)
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
    const { email, password, remember } = req.body
    
    const result = await userService.authenticateUser({ email, password, remember })
    
    // Устанавливаем refresh token в куки
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 дней или 24 часа
    })
    
    res.json({
      success: true,
      message: 'Вход выполнен успешно',
      data: {
        user: result.user,
        accessToken: result.token
      }
    })
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
    res.json({
      success: true,
      data: {
        url: 'https://telegram.org/auth'
      }
    })
  })

  handleTelegramCallback = this.handleAsync(async (req, res) => {
    res.json({
      success: true,
      message: 'Telegram авторизация успешна'
    })
  })
}

module.exports = new AuthController() 