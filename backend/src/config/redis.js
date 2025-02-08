/**
 * Конфигурация Redis
 * Настройки подключения к Redis для rate limiting и кэширования
 */

const Redis = require('ioredis')
const logger = require('../logging')

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  connectTimeout: 10000,
  retryStrategy: (retries) => {
    const delay = Math.min(retries * 500, 3000)
    logger.redis.logOperation('reconnect', { 
      attempt: retries + 1, 
      delay 
    })
    return delay
  }
}

class RedisWrapper {
  constructor() {
    this.client = null
    this.isInitialized = false
    this.connectionPromise = null
  }

  async initialize() {
    if (this.isInitialized) {
      return this.client
    }

    try {
      this.client = new Redis(REDIS_CONFIG)

      // Обработка ошибок
      this.client.on('error', (err) => {
        logger.redis.logError(err)
      })

      // Обработка подключения
      this.client.on('connect', () => {
        logger.redis.logOperation('connect', {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379
        })
      })

      // Обработка переподключения
      this.client.on('reconnecting', () => {
        logger.redis.logOperation('reconnecting')
      })

      // Обработка готовности
      this.client.on('ready', () => {
        logger.redis.logOperation('client_ready')
        this.isInitialized = true
      })

      // Обработка отключения
      this.client.on('end', () => {
        logger.redis.logOperation('client_end')
        this.isInitialized = false
      })

      // Проверяем подключение
      await this.client.ping()
      
      return this.client
    } catch (error) {
      logger.redis.logError(error)
      throw error
    }
  }

  async getClient() {
    if (!this.connectionPromise) {
      this.connectionPromise = this.initialize()
    }
    
    try {
      const client = await this.connectionPromise
      if (!client || client.status !== 'ready') {
        throw new Error('Redis клиент не готов')
      }
      return client
    } catch (error) {
      logger.redis.logError(error)
      return null
    }
  }

  async isReady() {
    try {
      const client = await this.getClient()
      return client && client.status === 'ready'
    } catch (error) {
      return false
    }
  }
}

const redisWrapper = new RedisWrapper()

module.exports = redisWrapper 