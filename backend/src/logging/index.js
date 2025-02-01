/**
 * Конфигурация логирования
 */

const winston = require('winston')
const path = require('path')

// Форматы логов
const formats = {
  console: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `[${timestamp}] [${level}] ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
      }`
    })
  ),
  file: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
}

// Создаем логгер
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: formats.file,
  transports: [
    // Логирование в файл
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log')
    })
  ]
})

// В режиме разработки также выводим в консоль
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: formats.console
  }))
}

module.exports = {
  logger
} 