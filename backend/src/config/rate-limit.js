/**
 * Конфигурация Rate Limiting
 * Настройки ограничения количества запросов к API
 */

const rateLimit = require('express-rate-limit')
const { RedisStore } = require('rate-limit-redis')
const redisClient = require('./redis')
const { logger } = require('../logging')

// Функция создания уникального Redis store для каждого лимитера
const createRedisStore = (prefix) => {
  return new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: `rl:${prefix}:`, // уникальный префикс для каждого лимитера
    resetExpiryOnChange: true
  })
}

// Базовые настройки для всех лимитеров (без store)
const baseOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Превышен лимит запросов', {
      metadata: {
        ip: req.ip,
        method: req.method,
        url: req.originalUrl,
        user: req.user?.id || 'anonymous',
        headers: {
          'user-agent': req.get('user-agent'),
          'x-forwarded-for': req.get('x-forwarded-for')
        }
      }
    })
    
    res.status(429).json({
      success: false,
      message: 'Слишком много запросов. Пожалуйста, попробуйте позже.',
      retryAfter: res.getHeader('Retry-After')
    })
  }
}

// Базовый лимитер для всех запросов
const basicLimiter = rateLimit({
  ...baseOptions,
  store: createRedisStore('basic'),
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    status: 429,
    message: 'Слишком много запросов. Пожалуйста, подождите 15 минут.'
  }
})

// Строгий лимитер для аутентификации
const authLimiter = rateLimit({
  ...baseOptions,
  store: createRedisStore('auth'),
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message: 'Слишком много попыток входа. Пожалуйста, подождите 1 час.'
  },
  skipSuccessfulRequests: true
})

// Лимитер для API endpoints
const apiLimiter = rateLimit({
  ...baseOptions,
  store: createRedisStore('api'),
  windowMs: 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message: 'Превышен лимит запросов к API. Пожалуйста, подождите 1 минуту.'
  }
})

// Строгий лимитер для критических операций
const criticalLimiter = rateLimit({
  ...baseOptions,
  store: createRedisStore('critical'),
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: {
    status: 429,
    message: 'Превышен лимит для критических операций. Пожалуйста, подождите 1 час.'
  }
})

module.exports = {
  basicLimiter,
  authLimiter,
  apiLimiter,
  criticalLimiter
} 