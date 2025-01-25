/**
 * Jest Setup
 * Настройка окружения для тестов
 */

// Мокаем логгер
jest.mock('./src/utils/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}))

// Мокаем Redis
jest.mock('./src/utils/redis', () => ({
  RedisClient: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    quit: jest.fn()
  }))
}))

// Мокаем модели
jest.mock('./src/models', () => ({
  DraftContest: {
    create: jest.fn()
  },
  Contest: {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}))

// Устанавливаем переменные окружения для тестов
process.env.NODE_ENV = 'test'
process.env.DB_NAME = 'test_db'
process.env.DB_USER = 'test_user'
process.env.DB_PASSWORD = 'test_password'
process.env.DB_HOST = 'localhost'
process.env.DB_PORT = '5432'
process.env.REDIS_HOST = 'localhost'
process.env.REDIS_PORT = '6379'
process.env.JWT_ACCESS_SECRET = 'test_access_secret'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret'
process.env.YOUTUBE_API_KEY = 'test_youtube_api_key'
process.env.YOUTUBE_QUOTA_LIMIT = '10000' 