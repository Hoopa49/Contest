/**
 * Основной файл логгера
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const { LOG_LEVELS, ENVIRONMENTS, FILE_CONFIG, LOG_CONFIG, LOG_TYPES } = require('./config');

class Logger {
  constructor() {
    this.logger = this.createLogger();
  }

  createLogger() {
    const env = process.env.NODE_ENV || 'development';
    const logDir = LOG_CONFIG[LOG_TYPES.SYSTEM].dir;

    // Создаем директорию для логов, если её нет
    const fs = require('fs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Добавляем цвета
    winston.addColors(LOG_LEVELS.colors);

    // Создаем транспорт для файлов
    const fileTransport = new DailyRotateFile({
      ...FILE_CONFIG,
      dirname: logDir,
      filename: 'system-%DATE%.log',
      level: 'info'
    });

    // Создаем транспорт для консоли
    const consoleTransport = new winston.transports.Console({
      ...ENVIRONMENTS[env].console,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    });

    // Создаем и возвращаем логгер
    return winston.createLogger({
      levels: LOG_LEVELS.levels,
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        fileTransport,
        consoleTransport
      ]
    });
  }

  // Методы логирования
  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  http(message, meta = {}) {
    this.logger.http(message, meta);
  }
}

// Создаем единственный экземпляр логгера
const logger = new Logger();

module.exports = logger; 