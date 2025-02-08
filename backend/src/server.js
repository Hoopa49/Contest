/**
 * Запуск сервера
 */

require('dotenv').config()
const express = require('express')
const rateLimit = require('express-rate-limit')
const { createRateLimiter } = require('./config/rate-limit')
const initApp = require('./app')
const config = require('./config')
const logger = require('./logging/logger')
const sequelize = require('./config/database')

const PORT = config.port || 3000

const app = express()

// Настройка rate limiting
const setupRateLimiting = async () => {
  try {
    const limiterConfig = await createRateLimiter()
    app.use(rateLimit(limiterConfig))
    logger.info('Rate limiting configured successfully')
  } catch (error) {
    logger.error('Failed to setup rate limiting', { error })
  }
}

async function startServer() {
  try {
    // Настраиваем rate limiting
    await setupRateLimiting()
    
    // Проверяем подключение к базе данных
    await sequelize.authenticate()
    logger.info('База данных подключена успешно')

    // Инициализируем приложение
    const app = await initApp()

    // Запускаем сервер
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`)
      logger.info(`Документация API доступна по адресу: http://localhost:${PORT}/api-docs`)
    })
  } catch (error) {
    logger.error('Failed to start server', { error })
    logger.error('Ошибка при запуске сервера:', {
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name
      },
      type: 'error'
    });
    process.exit(1);
  }
}

// Обработка необработанных исключений
process.on('uncaughtException', (error) => {
  logger.error('Необработанное исключение:', error)
  process.exit(1)
})

// Обработка необработанных отклонений промисов
process.on('unhandledRejection', (error) => {
  logger.error('Необработанное отклонение промиса:', error)
  process.exit(1)
})

startServer() 