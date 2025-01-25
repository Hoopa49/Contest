/**
 * Rate Limiter
 * Утилита для контроля лимитов API запросов
 */

const Redis = require('ioredis')
const config = require('../config')

class RateLimiter {
  constructor(key, options) {
    this.redis = new Redis({
      host: config.redis.host,
      port: config.redis.port
    })
    this.key = `rate_limit:${key}`
    this.points = options.points
    this.duration = options.duration
  }

  /**
   * Проверка лимита запросов
   */
  async checkLimit() {
    const current = await this.redis.get(this.key)
    
    if (!current) {
      await this.redis.setex(this.key, this.duration, 1)
      return true
    }

    if (parseInt(current) >= this.points) {
      throw new Error('Превышен лимит запросов')
    }

    await this.redis.incr(this.key)
    return true
  }

  /**
   * Получение текущего состояния лимита
   */
  async getStatus() {
    const current = await this.redis.get(this.key)
    const ttl = await this.redis.ttl(this.key)

    return {
      remaining: this.points - (current ? parseInt(current) : 0),
      total: this.points,
      resetIn: ttl
    }
  }

  /**
   * Сброс лимита
   */
  async reset() {
    await this.redis.del(this.key)
  }
}

module.exports = {
  RateLimiter
} 