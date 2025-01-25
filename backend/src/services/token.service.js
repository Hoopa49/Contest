const jwt = require('jsonwebtoken')
const { accessSecret, refreshSecret, accessExpiresIn, refreshExpiresIn } = require('../config/jwt')
const { logger } = require('../logging')

class TokenService {
  constructor() {
    this.tokens = new Map() // Хранилище refresh токенов
  }

  // Генерация access токена
  generateAccessToken(userId) {
    return jwt.sign({ userId }, accessSecret, { expiresIn: accessExpiresIn })
  }

  // Генерация refresh токена
  generateRefreshToken(userId) {
    const token = jwt.sign({ userId }, refreshSecret, { expiresIn: refreshExpiresIn })
    this.tokens.set(userId, token)
    return token
  }

  // Валидация refresh токена
  async validateRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, refreshSecret)
      const storedToken = this.tokens.get(decoded.userId)
      
      // Проверяем, что токен существует и совпадает с сохраненным
      return storedToken === token
    } catch (error) {
      logger.error('Refresh token validation error:', error)
      return false
    }
  }

  // Удаление refresh токена
  removeRefreshToken(userId) {
    this.tokens.delete(userId)
  }

  // Получение информации из токена
  decodeToken(token) {
    try {
      return jwt.verify(token, accessSecret)
    } catch (error) {
      logger.error('Token decode error:', error)
      return null
    }
  }
}

module.exports = new TokenService()