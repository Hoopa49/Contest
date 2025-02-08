/**
 * Конфигурация системы логирования
 */

const path = require('path');

// Типы логов
const LOG_TYPES = {
  HTTP: 'http',
  SYSTEM: 'system',
  ERROR: 'error',
  SECURITY: 'security',
  BUSINESS: 'business',
  DEBUG: 'debug',
  PERFORMANCE: 'performance',
  REDIS: 'redis',
  DATABASE: 'database'
};

// Уровни логирования для Winston
const LOG_LEVELS = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'cyan',
    debug: 'white'
  }
};

// Настройки для разных окружений
const ENVIRONMENTS = {
  development: {
    console: {
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true
    }
  },
  production: {
    console: {
      level: 'info',
      handleExceptions: true,
      json: false,
      colorize: false
    }
  },
  test: {
    console: {
      level: 'warn',
      handleExceptions: true,
      json: false,
      colorize: false
    }
  }
};

// Базовые настройки для файлов логов
const FILE_CONFIG = {
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true,
  createSymlink: true,
  symlinkName: 'current.log'
};

// Базовая директория для логов
const LOG_DIR = path.join(process.cwd(), 'logs', 'backend');

// Конфигурация для каждого типа логов
const LOG_CONFIG = {
  [LOG_TYPES.HTTP]: {
    dir: path.join(LOG_DIR, 'http'),
    prefix: 'http',
    maxFiles: '14d'
  },
  [LOG_TYPES.SYSTEM]: {
    dir: path.join(LOG_DIR, 'system'),
    prefix: 'system',
    maxFiles: '30d'
  },
  [LOG_TYPES.ERROR]: {
    dir: path.join(LOG_DIR, 'error'),
    prefix: 'error',
    maxFiles: '30d'
  },
  [LOG_TYPES.SECURITY]: {
    dir: path.join(LOG_DIR, 'security'),
    prefix: 'security',
    maxFiles: '30d'
  },
  [LOG_TYPES.BUSINESS]: {
    dir: path.join(LOG_DIR, 'business'),
    prefix: 'business',
    maxFiles: '30d'
  },
  [LOG_TYPES.DEBUG]: {
    dir: path.join(LOG_DIR, 'debug'),
    prefix: 'debug',
    maxFiles: '7d'
  },
  [LOG_TYPES.PERFORMANCE]: {
    dir: path.join(LOG_DIR, 'performance'),
    prefix: 'performance',
    maxFiles: '14d'
  },
  [LOG_TYPES.REDIS]: {
    dir: path.join(LOG_DIR, 'redis'),
    prefix: 'redis',
    maxFiles: '14d'
  },
  [LOG_TYPES.DATABASE]: {
    dir: path.join(LOG_DIR, 'database'),
    prefix: 'database',
    maxFiles: '14d'
  }
};

module.exports = {
  LOG_TYPES,
  LOG_LEVELS,
  ENVIRONMENTS,
  FILE_CONFIG,
  LOG_CONFIG
}; 