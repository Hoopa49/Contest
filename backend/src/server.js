/**
 * Запуск сервера
 */

require('dotenv').config()
const app = require('./app')
const config = require('./config')
const { logger } = require('./logging')
const sequelize = require('./config/database')

const PORT = config.app.port || 3000

async function startServer() {
  try {
    // Проверяем подключение к базе данных
    await sequelize.authenticate()
    logger.info('База данных подключена успешно')

    // Запускаем сервер
    app.listen(PORT, () => {
      logger.info(`Сервер запущен на порту ${PORT}`)
      logger.info(`Документация API доступна по адресу: http://localhost:${PORT}/api-docs`)
    })
  } catch (error) {
    logger.error('Ошибка при запуске сервера:', error)
    process.exit(1)
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