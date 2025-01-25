/**
 * Конфигурация Redis
 * Настройки подключения к Redis для rate limiting и кэширования
 */

const { createClient } = require('redis')
const { logger } = require('../logging')

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD,
  retry_strategy: function(options) {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      logger.error('Redis отказал в подключении', {
        metadata: {
          error: options.error
        }
      })
      return new Error('The server refused the connection')
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      logger.error('Время повторных попыток Redis истекло', {
        metadata: {
          total_retry_time: options.total_retry_time
        }
      })
      return new Error('Retry time exhausted')
    }
    if (options.attempt > 10) {
      logger.error('Достигнуто максимальное количество попыток подключения к Redis', {
        metadata: {
          attempts: options.attempt
        }
      })
      return undefined
    }
    return Math.min(options.attempt * 100, 3000)
  }
})

redisClient.on('error', (err) => {
  logger.error('Ошибка клиента Redis', {
    metadata: {
      error: {
        message: err.message,
        stack: err.stack
      }
    }
  })
})

redisClient.on('connect', () => {
  logger.info('Клиент Redis подключен', {
    metadata: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    }
  })
})

// Подключаемся к Redis
redisClient.connect().catch(err => {
  logger.error('Ошибка подключения к Redis', {
    metadata: {
      error: {
        message: err.message,
        stack: err.stack
      }
    }
  })
})

module.exports = redisClient 