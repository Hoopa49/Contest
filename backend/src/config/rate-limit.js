/**
 * Конфигурация Rate Limiting
 * Настройки ограничения количества запросов к API
 */

const RedisStore = require('rate-limit-redis')
const redisWrapper = require('./redis')
const logger = require('../logging/logger')

const baseOptions = {
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // Лимит запросов
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method
    })
    res.status(429).json({
      error: 'Too many requests, please try again later.'
    })
  },
  skip: (req) => {
    // Пропускаем health check запросы
    return req.path === '/health'
  }
}

const createRateLimiter = async () => {
  try {
    const client = await redisWrapper.getClient()
    
    if (!client) {
      throw new Error('Redis client not available')
    }

    return {
      store: new RedisStore({
        sendCommand: (...args) => client.call(...args),
        prefix: 'rl:' // Префикс для ключей rate limit
      }),
      ...baseOptions
    }
  } catch (error) {
    logger.error('Failed to create rate limiter', { error })
    // Возвращаем конфигурацию без Redis store в случае ошибки
    return baseOptions
  }
}

module.exports = { createRateLimiter } 