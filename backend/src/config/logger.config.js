/**
 * Конфигурация логгера
 */

const path = require('path');

module.exports = {
  // Уровни логирования
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },

  // Цвета для разных уровней
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
  },

  // Настройки файлов логов
  files: {
    error: {
      filename: path.join(__dirname, '../../logs/error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: {
        type: 'file',
        prettyPrint: true,
        colorize: false,
        timestamp: true,
        align: false,
        showMetadata: true
      }
    },
    combined: {
      filename: path.join(__dirname, '../../logs/combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: {
        type: 'file',
        prettyPrint: true,
        colorize: false,
        timestamp: true,
        align: false,
        showMetadata: true
      }
    },
  },

  // Форматы логов
  formats: {
    timestamp: 'YYYY-MM-DD HH:mm:ss.SSS',
    file: {
      template: `[{timestamp}] [{level}] [{file}:{line}] [{userId}] [{ip}] [{role}]: {message}{metadata}`
    },
    metadata: {
      template: `\nМетаданные:\n{value}`,
      format: (value) => {
        if (typeof value === 'object') {
          return JSON.stringify(value, null, 2)
        }
        return value
      }
    }
  },

  // Настройки для разных окружений
  environments: {
    development: {
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
      showStack: true
    },
    production: {
      level: 'info',
      handleExceptions: true,
      json: false,
      colorize: false,
      showStack: false
    },
    test: {
      level: 'warn',
      handleExceptions: true,
      json: false,
      colorize: false,
      showStack: false
    },
  },
}; 