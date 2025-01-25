/**
 * Конфигурация системы логирования
 */

const path = require('path');

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  HTTP: 'http',
  DEBUG: 'debug',
  TRACE: 'trace',
  SECURITY: 'security',
  BUSINESS: 'business',
  PERFORMANCE: 'performance'
};

const LOG_TYPES = {
  SYSTEM: 'system',
  SECURITY: 'security',
  BUSINESS: 'business',
  HTTP: 'http',
  PERFORMANCE: 'performance'
};

const getLogPath = (fileName) => {
  return path.join(process.cwd(), 'logs', '%DATE%', fileName).replace(/\\/g, '/');
};

const config = {
  // Уровни логирования
  levels: {
    [LOG_LEVELS.ERROR]: 0,
    [LOG_LEVELS.WARN]: 1,
    [LOG_LEVELS.INFO]: 2,
    [LOG_LEVELS.HTTP]: 3,
    [LOG_LEVELS.DEBUG]: 4,
    [LOG_LEVELS.TRACE]: 5,
    [LOG_LEVELS.SECURITY]: 6,
    [LOG_LEVELS.BUSINESS]: 7,
    [LOG_LEVELS.PERFORMANCE]: 8
  },

  // Цвета для консольного вывода
  colors: {
    [LOG_LEVELS.ERROR]: 'red',
    [LOG_LEVELS.WARN]: 'yellow',
    [LOG_LEVELS.INFO]: 'green',
    [LOG_LEVELS.HTTP]: 'magenta',
    [LOG_LEVELS.DEBUG]: 'white',
    [LOG_LEVELS.TRACE]: 'gray',
    [LOG_LEVELS.SECURITY]: 'cyan',
    [LOG_LEVELS.BUSINESS]: 'blue',
    [LOG_LEVELS.PERFORMANCE]: 'gray'
  },

  // Настройки файлов логов по типам
  files: {
    error: {
      filename: getLogPath('error.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: LOG_LEVELS.ERROR,
      auditFile: path.join(process.cwd(), 'logs', 'audit-error.json').replace(/\\/g, '/')
    },
    security: {
      filename: getLogPath('security.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: LOG_LEVELS.SECURITY,
      auditFile: path.join(process.cwd(), 'logs', 'audit-security.json').replace(/\\/g, '/')
    },
    business: {
      filename: getLogPath('business.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: LOG_LEVELS.BUSINESS,
      auditFile: path.join(process.cwd(), 'logs', 'audit-business.json').replace(/\\/g, '/')
    },
    http: {
      filename: getLogPath('http.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: LOG_LEVELS.HTTP,
      auditFile: path.join(process.cwd(), 'logs', 'audit-http.json').replace(/\\/g, '/')
    },
    performance: {
      filename: getLogPath('performance.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: LOG_LEVELS.PERFORMANCE,
      auditFile: path.join(process.cwd(), 'logs', 'audit-performance.json').replace(/\\/g, '/')
    },
    combined: {
      filename: getLogPath('combined.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      auditFile: path.join(process.cwd(), 'logs', 'audit-combined.json').replace(/\\/g, '/')
    }
  },

  // Форматы логов
  formats: {
    timestamp: 'YYYY-MM-DD HH:mm:ss.SSS',
    template: {
      console: {
        basic: '[{timestamp}] [{level}] [{type}] [{correlationId}] [{userId}/{role}]: {message}',
        http: '[{timestamp}] [{level}] [{method}] [{path}] [{statusCode}] [{responseTime}ms] [{userId}/{role}] [{ip}]: {message}',
        withMetadata: '[{timestamp}] [{level}] [{type}] [{correlationId}] [{userId}/{role}]: {message}\nМетаданные: {metadata}'
      },
      file: {
        basic: '[{timestamp}] [{level}] [{type}] [{correlationId}] [{file}:{line}] [{userId}/{role}] [{ip}]: {message}',
        http: '[{timestamp}] [{level}] [{method}] [{path}] [{statusCode}] [{responseTime}ms] [{userId}/{role}] [{ip}]: {message}',
        withMetadata: '[{timestamp}] [{level}] [{type}] [{correlationId}] [{file}:{line}] [{userId}/{role}] [{ip}]: {message}\nМетаданные: {metadata}'
      }
    }
  },

  // Настройки для разных окружений
  environments: {
    development: {
      console: {
        level: LOG_LEVELS.DEBUG,
        handleExceptions: true,
        json: false,
        colorize: true,
        showStack: true
      }
    },
    production: {
      console: {
        level: LOG_LEVELS.INFO,
        handleExceptions: true,
        json: false,
        colorize: false,
        showStack: false
      }
    },
    test: {
      console: {
        level: LOG_LEVELS.WARN,
        handleExceptions: true,
        json: false,
        colorize: false,
        showStack: false
      }
    }
  }
};

module.exports = {
  config,
  LOG_LEVELS,
  LOG_TYPES
}; 