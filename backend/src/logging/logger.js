/**
 * Основной файл логгера
 */

const winston = require('winston');
require('winston-daily-rotate-file');
const { config, LOG_LEVELS, LOG_TYPES } = require('./config');
const { consoleFormat, fileFormat } = require('./formatters');
const fs = require('fs');
const path = require('path');

// Увеличиваем лимит слушателей для предотвращения утечек памяти
require('events').EventEmitter.defaultMaxListeners = 20;

class Logger {
  constructor() {
    this.ensureLogDirectoryExists();
    this.createdLogFiles = new Set(); // Добавляем Set для отслеживания созданных файлов
    this.winston = this.createLogger();
    this.setupErrorHandling();
  }

  ensureLogDirectoryExists() {
    try {
      const baseLogDir = path.join(process.cwd(), 'logs');
      const today = new Date().toISOString().split('T')[0];
      const todayLogDir = path.join(baseLogDir, today);
      
      // Создаем базовую директорию для логов
      if (!fs.existsSync(baseLogDir)) {
        fs.mkdirSync(baseLogDir, { recursive: true });
      }
      
      // Создаем директорию для текущего дня
      if (!fs.existsSync(todayLogDir)) {
        fs.mkdirSync(todayLogDir, { recursive: true });
      }

      // Проверяем права доступа
      fs.accessSync(todayLogDir, fs.constants.W_OK);
    } catch (error) {
      console.error('Ошибка при создании директории логов:', error);
      process.exit(1);
    }
  }

  setupErrorHandling() {
    // Обработка ошибок транспортов
    this.winston.on('error', (error) => {
      console.error('Ошибка в winston logger:', error);
      this.ensureLogDirectoryExists(); // Пробуем пересоздать директории
    });

    // Очистка старых логов
    setInterval(() => {
      this.cleanOldLogs();
    }, 24 * 60 * 60 * 1000); // Раз в сутки
  }

  cleanOldLogs() {
    try {
      const baseLogDir = path.join(process.cwd(), 'logs');
      const maxAge = 14 * 24 * 60 * 60 * 1000; // 14 дней в миллисекундах
      
      if (fs.existsSync(baseLogDir)) {
        const items = fs.readdirSync(baseLogDir);
        const now = Date.now();
        
        items.forEach(item => {
          const itemPath = path.join(baseLogDir, item);
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory() && now - stat.mtime.getTime() > maxAge) {
            fs.rmSync(itemPath, { recursive: true, force: true });
          }
        });
      }
    } catch (error) {
      console.error('Ошибка при очистке старых логов:', error);
    }
  }

  createLogger() {
    winston.addColors(config.colors);
    const transports = [];
    const env = process.env.NODE_ENV || 'development';
    const consoleConfig = config.environments[env].console;

    transports.push(
      new winston.transports.Console({
        level: consoleConfig.level,
        handleExceptions: consoleConfig.handleExceptions,
        format: consoleFormat
      })
    );

    Object.entries(config.files).forEach(([type, options]) => {
      const transport = new winston.transports.DailyRotateFile({
        ...options,
        format: fileFormat,
        handleExceptions: true,
        createSymlink: true,
        symlinkName: `${type}.log`,
        zippedArchive: true,
        maxFiles: '14d'
      });

      transport.on('error', (error) => {
        this.winston.error(`Ошибка в транспорте ${type}`, {
          error: {
            message: error.message,
            code: error.code
          }
        });
      });

      transports.push(transport);
    });

    return winston.createLogger({
      levels: config.levels,
      transports,
      exitOnError: false
    });
  }

  // Создаем файл лога если его нет
  ensureLogFileExists(level) {
    const filePath = path.join(process.cwd(), 'logs', level.toLowerCase(), `${level.toLowerCase()}_${new Date().toISOString().replace(/[-:]/g, '').replace('T', '_').replace('Z', '')}.log`);
    
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, '');
    }
    
    return filePath;
  }

  // Основные методы логирования
  error(message, metadata = {}) {
    this.log(LOG_LEVELS.ERROR, message, { ...metadata, type: LOG_TYPES.SYSTEM });
  }

  warn(message, metadata = {}) {
    this.log(LOG_LEVELS.WARN, message, { ...metadata, type: LOG_TYPES.SYSTEM });
  }

  info(message, metadata = {}) {
    this.log(LOG_LEVELS.INFO, message, { ...metadata, type: LOG_TYPES.SYSTEM });
  }

  debug(message, metadata = {}) {
    this.log(LOG_LEVELS.DEBUG, message, { ...metadata, type: LOG_TYPES.SYSTEM });
  }

  trace(message, metadata = {}) {
    this.log(LOG_LEVELS.TRACE, message, { ...metadata, type: LOG_TYPES.SYSTEM });
  }

  // Специализированные методы логирования
  security(message, metadata = {}) {
    this.log(LOG_LEVELS.SECURITY, message, { ...metadata, type: LOG_TYPES.SECURITY });
  }

  business(message, metadata = {}) {
    this.log(LOG_LEVELS.DEBUG, message, { ...metadata, type: LOG_TYPES.BUSINESS });
  }

  http(message, metadata = {}) {
    this.log(LOG_LEVELS.HTTP, message, { ...metadata, type: LOG_TYPES.HTTP });
  }

  performance(message, metadata = {}) {
    this.log(LOG_LEVELS.DEBUG, message, { ...metadata, type: LOG_TYPES.PERFORMANCE });
  }

  // Базовый метод логирования
  log(level, message, metadata = {}) {
    try {
      // Сохраняем оригинальный стек вызовов
      const originalStack = new Error().stack
        .split('\n')
        .slice(2)
        .map(line => line.trim());

      let skipIndex = 0;
      while (skipIndex < originalStack.length && 
        (originalStack[skipIndex].includes('/logging/logger.js') || 
         originalStack[skipIndex].includes('at Logger.'))) {
        skipIndex++;
      }

      const originalCaller = originalStack[skipIndex];

      if (originalCaller && !originalCaller.includes('node_modules') && 
          !originalCaller.includes('node:internal/') && 
          !originalCaller.includes('node:events')) {
        metadata.originalCaller = originalCaller;
      }

      // Обработка correlationId
      if (!metadata.correlationId && metadata.req) {
        metadata.correlationId = metadata.req.correlationId;
      }

      // Обработка информации о пользователе
      let user = null;
      let role = 'guest';
      
      if (metadata.user) {
        user = metadata.user;
      } else if (metadata.req?.user) {
        user = metadata.req.user;
      } else if (metadata.req?.session?.user) {
        user = metadata.req.session.user;
      }

      if (user) {
        metadata.userId = user.id || 'anonymous';
        metadata.role = user.role || role;
        metadata.username = user.username || user.first_name || null;
      } else {
        const authHeader = metadata.req?.headers?.authorization;
        if (authHeader) {
          metadata.userId = 'authenticated';
          metadata.role = 'user';
        } else {
          metadata.userId = 'anonymous';
          metadata.role = role;
        }
      }

      // Безопасное получение заголовков
      const getSafeHeaders = (headers = {}) => {
        return {
          'user-agent': headers['user-agent'] || headers['User-Agent'] || 'unknown',
          'accept': headers['accept'] || headers['Accept'] || '*/*',
          'content-type': headers['content-type'] || headers['Content-Type'] || 'unknown',
          'referer': headers['referer'] || headers['Referrer'] || 'unknown'
        };
      };

      // Безопасное получение IP
      const getSafeIP = (req) => {
        try {
          return req?.ip || 
                 req?.connection?.remoteAddress || 
                 req?.headers?.['x-forwarded-for']?.split(',')[0] || 
                 'unknown';
        } catch (error) {
          return 'unknown';
        }
      };

      // Добавляем IP адрес и информацию о запросе
      if (metadata.req) {
        metadata.ip = getSafeIP(metadata.req);

        // Добавляем информацию о HTTP запросе
        if (metadata.req.method) {
          metadata.method = metadata.req.method;
          metadata.path = metadata.req.originalUrl || metadata.req.url;
          
          // Безопасно получаем заголовки
          const safeHeaders = getSafeHeaders(metadata.req.headers);
          metadata.userAgent = safeHeaders['user-agent'];
          metadata.referer = safeHeaders['referer'];
          metadata.contentType = safeHeaders['content-type'];
        }

        // Добавляем информацию о HTTP ответе
        if (metadata.res) {
          try {
            metadata.statusCode = metadata.res.statusCode || 500;
            metadata.statusMessage = metadata.res.statusMessage || 'Unknown Status';
            metadata.contentLength = metadata.res.getHeader?.('content-length') || 0;
          } catch (error) {
            metadata.statusCode = 500;
            metadata.statusMessage = 'Error getting response info';
            metadata.contentLength = 0;
          }
        }

        // Очищаем конфиденциальные данные
        const sanitizedReq = {
          method: metadata.req.method || 'UNKNOWN',
          url: metadata.req.originalUrl || metadata.req.url || 'unknown',
          query: metadata.req.query || {},
          headers: getSafeHeaders(metadata.req.headers)
        };

        // Добавляем тело запроса только если это не GET запрос
        if (metadata.req.method !== 'GET') {
          sanitizedReq.body = this.sanitizeBody(metadata.req.body || {});
        }

        metadata.req = sanitizedReq;
      }

      // Фильтруем ошибки JWT
      if (metadata.error && metadata.error.name === 'JsonWebTokenError') {
        if (level === 'error') {
          level = 'debug';
        }
        metadata = {
          error: {
            message: 'Invalid JWT token',
            type: metadata.error.name
          }
        };
      }

      // Создаем файл лога если его нет
      this.ensureLogFileExists(level);

      // Убираем двоеточие в конце сообщения
      if (message.endsWith(':')) {
        message = message.slice(0, -1);
      }

      // Проверяем наличие метаданных
      const hasMetadata = metadata && Object.keys(metadata).length > 0;

      this.winston.log({
        level,
        message: message + (hasMetadata ? '' : '.'),
        ...metadata
      });
    } catch (error) {
      console.error('Ошибка при логировании:', error);
      this.winston.error('Ошибка логирования', {
        originalMessage: message,
        error: {
          message: error.message,
          stack: error.stack
        }
      });
    }
  }

  // Вспомогательный метод для очистки тела запроса
  sanitizeBody(body) {
    if (!body) return {};
    
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'api_key', 'key'];
    const sanitized = { ...body };

    const sanitizeObject = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          obj[key] = sanitizeObject({ ...obj[key] });
        } else if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          obj[key] = '[HIDDEN]';
        }
      }
      return obj;
    };

    return sanitizeObject(sanitized);
  }
}

// Создаем единственный экземпляр логгера
const logger = new Logger();

// Перехватываем необработанные исключения
process.on('uncaughtException', (error) => {
  logger.error('Необработанное исключение', { 
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    }
  });
  process.exit(1);
});

// Перехватываем необработанные промисы
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Необработанное отклонение промиса', {
    error: {
      message: reason?.message || 'Unknown error',
      stack: reason?.stack,
      name: reason?.name
    },
    promise: promise
  });
});

module.exports = logger; 