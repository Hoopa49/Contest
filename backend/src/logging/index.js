/**
 * Основной модуль логирования
 */

const BaseLogger = require('./base-logger');
const { LOG_TYPES } = require('./config');

class MainLogger extends BaseLogger {
  constructor() {
    super(LOG_TYPES.SYSTEM, { level: 'info' });
    this.createTypeLoggers();
  }

  createTypeLoggers() {
    // HTTP логгер
    const httpLogger = new BaseLogger(LOG_TYPES.HTTP, { level: 'http' });
    this.http = httpLogger.http.bind(httpLogger);
    this.logRequest = (req, correlationId) => {
      try {
        const { method, url, headers, query, body, ip } = req;
        const sanitizedHeaders = { ...headers };
        if (sanitizedHeaders.authorization) {
          sanitizedHeaders.authorization = '[REDACTED]';
        }
        httpLogger.http('Incoming HTTP request', {
          correlationId,
          request: {
            method,
            url,
            headers: sanitizedHeaders,
            query,
            body,
            ip
          },
          component: 'http',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Ошибка при логировании HTTP request:', error);
      }
    };

    this.logResponse = (req, res, responseTime, correlationId) => {
      try {
        const { method, url } = req;
        const { statusCode, statusMessage } = res;
        httpLogger.http('Outgoing HTTP response', {
          correlationId,
          request: {
            method,
            url
          },
          response: {
            statusCode,
            statusMessage,
            contentType: res.getHeader('content-type'),
            contentLength: res.getHeader('content-length')
          },
          responseTime,
          component: 'http',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Ошибка при логировании HTTP response:', error);
      }
    };

    // Database логгер
    const databaseLogger = new BaseLogger(LOG_TYPES.DATABASE, { level: 'info' });
    this.database = {
      logQuery: (query, params = [], duration, metadata = {}) => {
        try {
          databaseLogger.info('Database query', {
            query,
            params,
            duration,
            ...metadata,
            component: 'database',
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Ошибка при логировании Database query:', error);
        }
      },
      logError: (error, query = null, params = [], metadata = {}) => {
        try {
          databaseLogger.error('Database error', {
            error: {
              message: error.message,
              stack: error.stack,
              code: error.code
            },
            query,
            params,
            ...metadata,
            component: 'database',
            timestamp: new Date().toISOString()
          });
        } catch (err) {
          console.error('Ошибка при логировании Database error:', err);
        }
      }
    };
    
    // Redis логгер
    const redisLogger = new BaseLogger(LOG_TYPES.REDIS, { level: 'info' });
    this.redis = {
      logOperation: (operation, metadata = {}) => {
        try {
          redisLogger.info('Redis operation', {
            operation,
            ...metadata,
            component: 'redis',
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Ошибка при логировании Redis operation:', error);
        }
      },
      logError: (error, metadata = {}) => {
        try {
          redisLogger.error('Redis error', {
            error: {
              message: error.message,
              stack: error.stack
            },
            ...metadata,
            component: 'redis',
            timestamp: new Date().toISOString()
          });
        } catch (err) {
          console.error('Ошибка при логировании Redis error:', err);
        }
      }
    };

    // Бизнес-логгер
    const businessLogger = new BaseLogger(LOG_TYPES.BUSINESS, { level: 'info' });
    this.business = {
      logBusinessEvent: (event, metadata = {}) => {
        try {
          businessLogger.info(`Business event: ${event}`, {
            ...metadata,
            component: 'business',
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Ошибка при логировании бизнес-события:', error);
        }
      },
      logBusinessError: (error, metadata = {}) => {
        try {
          businessLogger.error('Business error', {
            error: {
              message: error.message,
              stack: error.stack,
              code: error.code
            },
            ...metadata,
            component: 'business',
            timestamp: new Date().toISOString()
          });
        } catch (err) {
          console.error('Ошибка при логировании бизнес-ошибки:', err);
        }
      }
    };

    // Логгер безопасности
    const securityLogger = new BaseLogger(LOG_TYPES.SECURITY, { level: 'info' });
    this.security = {
      logAuthAttempt: (user, success, metadata = {}) => {
        try {
          securityLogger.info(`Authentication attempt ${success ? 'successful' : 'failed'}`, {
            user,
            success,
            ...metadata,
            component: 'security',
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Ошибка при логировании попытки аутентификации:', error);
        }
      },
      logSecurityViolation: (violation, metadata = {}) => {
        try {
          securityLogger.error('Security violation', {
            violation,
            ...metadata,
            component: 'security',
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Ошибка при логировании нарушения безопасности:', error);
        }
      }
    };

    // Логгер производительности
    const performanceLogger = new BaseLogger(LOG_TYPES.PERFORMANCE, { level: 'info' });
    this.performance = {
      logOperationTime: (operation, duration, metadata = {}) => {
        try {
          performanceLogger.info('Operation timing', {
            operation,
            duration,
            ...metadata,
            component: 'performance',
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Ошибка при логировании времени операции:', error);
        }
      },
      logMemoryUsage: (metadata = {}) => {
        try {
          const memoryUsage = process.memoryUsage();
          performanceLogger.info('Memory usage', {
            memory: {
              heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
              heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
              rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
              external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB'
            },
            ...metadata,
            component: 'performance',
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Ошибка при логировании использования памяти:', error);
        }
      }
    };

    // Логгер ошибок
    const errorLogger = new BaseLogger(LOG_TYPES.ERROR, { level: 'error' });
    this.error = errorLogger.error.bind(errorLogger);
  }

  // Переопределяем базовые методы для системных логов
  info(message, metadata = {}) {
    super.info(message, { ...metadata, type: LOG_TYPES.SYSTEM });
  }

  warn(message, metadata = {}) {
    super.warn(message, { ...metadata, type: LOG_TYPES.SYSTEM });
  }

  debug(message, metadata = {}) {
    super.debug(message, { ...metadata, type: LOG_TYPES.SYSTEM });
  }
}

// Создаем единственный экземпляр
const logger = new MainLogger();

module.exports = logger; 