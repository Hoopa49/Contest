/**
 * Контроллер аутентификации
 * Обработка запросов аутентификации и авторизации
 */

const authService = require('../services/auth.service')
const { AuthenticationError, ApiError } = require('../../../utils/errors')
const { logger } = require('../../../logging')

class AuthController {
  /**
   * Регистрация нового пользователя
   */
  async register(req, res, next) {
    try {
      const { first_name, last_name, email, password } = req.body
      
      if (!email || !password) {
        throw new AuthenticationError('Email и пароль обязательны')
      }
      
      const result = await authService.createUser({ first_name, last_name, email, password })

      res.status(201).json({
        success: true,
        message: 'Регистрация успешно завершена',
        data: {
          user: result.user,
          token: result.accessToken,
          refreshToken: result.refreshToken
        }
      })
    } catch (error) {
      log.error('Ошибка при регистрации:', error)
      next(error)
    }
  }

  /**
   * Вход пользователя
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body
      
      if (!email || !password) {
        throw new AuthenticationError('Email и пароль обязательны')
      }
      
      const result = await authService.authenticateUser({ email, password })
      
      // Возвращаем токены в ответе
      const response = {
        success: true,
        message: 'Вход выполнен успешно',
        data: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        }
      }
      
      res.json(response)
    } catch (error) {
      if (error.message === 'Неверный email или пароль') {
        next(new AuthenticationError('Неверный email или пароль'))
        return
      }
      log.error('Ошибка при входе:', error)
      next(error)
    }
  }

  /**
   * Выход пользователя
   */
  async logout(req, res, next) {
    try {
      res.json({
        success: true,
        message: 'Успешный выход'
      })
    } catch (error) {
      log.error('Ошибка при выходе:', error)
      next(error)
    }
  }

  /**
   * Получение текущего пользователя
   */
  async getCurrentUser(req, res, next) {
    try {
      const user = req.user
      
      if (!user) {
        throw new AuthenticationError('Пользователь не найден')
      }

      res.json({
        success: true,
        data: {
          user
        }
      })
    } catch (error) {
      log.error('Ошибка при получении пользователя:', error)
      next(error)
    }
  }

  /**
   * Обновление профиля пользователя
   */
  async updateProfile(req, res, next) {
    try {
      const { name, email } = req.body
      const userId = req.user.id

      const updatedUser = await authService.updateProfile(userId, { name, email })

      res.json({
        success: true,
        data: {
          user: updatedUser
        }
      })
    } catch (error) {
      log.error('Ошибка при обновлении профиля:', error)
      next(error)
    }
  }

  /**
   * Изменение пароля пользователя
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body
      const userId = req.user.id

      if (!currentPassword || !newPassword) {
        throw new AuthenticationError('Текущий и новый пароль обязательны')
      }

      await authService.changePassword(userId, currentPassword, newPassword)

      res.json({
        success: true,
        message: 'Пароль успешно изменен'
      })
    } catch (error) {
      log.error('Ошибка при изменении пароля:', error)
      next(error)
    }
  }
}

module.exports = new AuthController() 