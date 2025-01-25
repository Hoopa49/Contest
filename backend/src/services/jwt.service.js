/**
 * Сервис для работы с JWT токенами
 * Генерация, верификация и управление токенами
 */

const jwt = require('jsonwebtoken')
const jwtConfig = require('../config/jwt')
const { logger } = require('../logging')

class JWTService {
  /**
   * Генерация access token
   * @param {Object} user - Пользователь
   * @returns {string} Access token
   */
  generateAccessToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    }

    try {
      const token = jwt.sign(payload, jwtConfig.accessSecret, {
        expiresIn: jwtConfig.accessExpiresIn
      })

      logger.info('Сгенерирован токен доступа:', { userId: user.id })
      return token
    } catch (error) {
      logger.error('Ошибка генерации токена:', {
        userId: user.id,
        error: error.message
      })
      throw error
    }
  }

  /**
   * Генерация refresh token
   * @param {Object} user - Пользователь
   * @returns {string} Refresh token
   */
  generateRefreshToken(user) {
    
    const payload = { userId: user.id }
    logger.debug('Token payload:', payload)
    
    return jwt.sign(
      payload,
      jwtConfig.refreshSecret,
      { expiresIn: jwtConfig.refreshExpiresIn }
    )
  }

  /**
   * Верификация access token
   * @param {string} token - Access token для проверки
   * @returns {Object} Декодированные данные токена
   */
  verifyAccessToken(token) {
    return jwt.verify(token, jwtConfig.accessSecret)
  }

  /**
   * Верификация refresh token
   * @param {string} token - Refresh token для проверки
   * @returns {Object} Декодированные данные токена
   */
  verifyRefreshToken(token) {
    return jwt.verify(token, jwtConfig.refreshSecret)
  }

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, jwtConfig.accessSecret)
      return decoded
    } catch (error) {
      logger.warn('Ошибка проверки токена:', { error: error.message })
      throw error
    }
  }
}

module.exports = new JWTService() 