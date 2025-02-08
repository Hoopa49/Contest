const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');
const { 
  LOG_LEVELS, 
  ENVIRONMENTS, 
  FILE_CONFIG,
  LOG_CONFIG 
} = require('./config');

// Увеличиваем лимит слушателей для process
process.setMaxListeners(20);

class BaseLogger {
  constructor(type, options = {}) {
    this.type = type;
    this.options = options;
    
    // Проверяем тип логгера
    if (!LOG_CONFIG[this.type]) {
      throw new Error(`Неизвестный тип логгера: ${this.type}`);
    }
    
    this.logger = this.initializeWinston();
  }

  initializeWinston() {
    const env = process.env.NODE_ENV || 'development';
    const logDir = LOG_CONFIG[this.type].dir;
    const prefix = LOG_CONFIG[this.type].prefix;

    // Создаем директорию для логов, если её нет
    try {
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    } catch (error) {
      throw error;
    }

    // Добавляем цвета
    winston.addColors(LOG_LEVELS.colors);

    // Создаем пользовательский формат для красивого вывода JSON
    const prettyJson = winston.format.printf(({ level, message, timestamp, ...meta }) => {
      // Форматируем дополнительные метаданные
      const metaStr = Object.keys(meta).length ? 
        '\n' + JSON.stringify(meta, null, 2) : '';

      // Возвращаем отформатированное сообщение
      return `${timestamp} [${level.toUpperCase()}] ${message}${metaStr}`;
    });

    const customFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      prettyJson
    );

    // Создаем транспорт для файлов
    const fileTransport = new DailyRotateFile({
      dirname: logDir,
      filename: `${prefix}-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: LOG_CONFIG[this.type].maxFiles || '14d',
      format: customFormat,
      level: this.options.level || 'info',
      handleExceptions: true,
      handleRejections: true,
      zippedArchive: false,
      createSymlink: true,
      symlinkName: `${prefix}-current.log`
    });

    // Добавляем обработчики событий для транспорта файлов
    fileTransport.on('error', (error) => {
      console.error(`Ошибка транспорта файлов для ${this.type}:`, error);
    });

    // Создаем транспорт для консоли с цветным форматированием
    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        const metaStr = Object.keys(meta).length ? 
          '\n' + JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level}] ${message}${metaStr}`;
      })
    );

    const consoleTransport = new winston.transports.Console({
      level: ENVIRONMENTS[env].console.level,
      handleExceptions: true,
      format: consoleFormat
    });

    // Создаем и возвращаем логгер
    const logger = winston.createLogger({
      levels: LOG_LEVELS.levels,
      level: this.options.level || 'info',
      defaultMeta: { type: this.type },
      format: customFormat,
      transports: [
        fileTransport,
        consoleTransport
      ],
      exitOnError: false,
      handleExceptions: true,
      handleRejections: true
    });

    // Увеличиваем лимит слушателей для логгера
    logger.setMaxListeners(20);

    // Добавляем обработчик ошибок
    logger.on('error', (error) => {
      console.error(`Ошибка логгера ${this.type}:`, error);
    });

    return logger;
  }

  // Методы логирования
  error(message, meta = {}) {
    try {
      this.logger.error(message, { ...meta, logType: this.type });
    } catch (error) {
      console.error(`Ошибка при логировании error для ${this.type}:`, error);
    }
  }

  warn(message, meta = {}) {
    try {
      this.logger.warn(message, { ...meta, logType: this.type });
    } catch (error) {
      console.error(`Ошибка при логировании warn для ${this.type}:`, error);
    }
  }

  info(message, meta = {}) {
    try {
      this.logger.info(message, { ...meta, logType: this.type });
    } catch (error) {
      console.error(`Ошибка при логировании info для ${this.type}:`, error);
    }
  }

  debug(message, meta = {}) {
    try {
      this.logger.debug(message, { ...meta, logType: this.type });
    } catch (error) {
      console.error(`Ошибка при логировании debug для ${this.type}:`, error);
    }
  }

  http(message, meta = {}) {
    try {
      this.logger.http(message, { ...meta, logType: this.type });
    } catch (error) {
      console.error(`Ошибка при логировании http для ${this.type}:`, error);
    }
  }
}

module.exports = BaseLogger; 