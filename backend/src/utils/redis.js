/**
 * Redis Client
 * Клиент для работы с Redis
 */

class RedisClient {
  constructor() {
    this.connected = false
  }

  async connect() {
    this.connected = true
  }

  async get(key) {
    return null
  }

  async set(key, value, ttl) {
    return true
  }

  async del(key) {
    return true
  }

  async quit() {
    this.connected = false
  }
}

module.exports = {
  RedisClient
} 