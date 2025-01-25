/**
 * Middleware для HTTP логирования
 */

const logger = require('./logger');
const crypto = require('crypto');
const { getCurrentContext } = require('./auth-context');

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
    return req.ip || 
           req.connection?.remoteAddress || 
           req.headers?.['x-forwarded-for']?.split(',')[0] || 
           'unknown';
  } catch (error) {
    return 'unknown';
  }
};

// Middleware для добавления correlationId
const correlationMiddleware = (req, res, next) => {
  try {
    // Генерируем или получаем correlationId
    req.correlationId = (req.headers && req.headers['x-correlation-id']) || 
                       crypto.randomBytes(4).toString('hex');
    
    // Добавляем correlationId в заголовки ответа
    res.setHeader('x-correlation-id', req.correlationId);
  } catch (error) {
    console.error('Ошибка в correlationMiddleware:', error);
    req.correlationId = crypto.randomBytes(4).toString('hex');
  }
  
  next();
};

// Middleware для логирования HTTP запросов
const requestLoggerMiddleware = (req, res, next) => {
  try {
    // Генерируем уникальный correlationId для запроса
    req.correlationId = 'req_' + crypto.randomBytes(4).toString('hex');
    
    // Засекаем время начала запроса
    const startTime = process.hrtime();
    
    // Логируем входящий запрос
    logger.http('Входящий HTTP запрос', {
      correlationId: req.correlationId,
      req: {
        method: req.method || 'UNKNOWN',
        url: req.originalUrl || req.url || 'unknown',
        query: req.query || {},
        headers: getSafeHeaders(req.headers)
      },
      ip: getSafeIP(req)
    });

    // Сохраняем оригинальный метод end
    const originalEnd = res.end;
    
    // Перехватываем завершение ответа
    res.end = function (chunk, encoding) {
      try {
        // Вычисляем время выполнения
        const diff = process.hrtime(startTime);
        const responseTime = Math.round((diff[0] * 1e3 + diff[1] * 1e-6) * 100) / 100;
        
        // Восстанавливаем оригинальный метод end
        res.end = originalEnd;
        
        // Вызываем оригинальный метод
        res.end(chunk, encoding);
        
        // Получаем размер ответа
        let contentLength;
        try {
          contentLength = res.getHeader('content-length');
        } catch (error) {
          contentLength = 0;
        }
        
        // Логируем исходящий ответ
        logger.http('Исходящий HTTP ответ', {
          correlationId: req.correlationId,
          req: {
            method: req.method || 'UNKNOWN',
            url: req.originalUrl || req.url || 'unknown'
          },
          res: {
            statusCode: res.statusCode || 500,
            statusMessage: res.statusMessage || 'Unknown Status',
            contentType: res.getHeader('content-type') || 'unknown',
            contentLength: contentLength || 0
          },
          responseTime,
          ip: getSafeIP(req)
        });
      } catch (error) {
        console.error('Ошибка при логировании ответа:', error);
        res.end(chunk, encoding);
      }
    };
  } catch (error) {
    console.error('Ошибка в requestLoggerMiddleware:', error);
  }
  
  next();
};

// Middleware для обработки ошибок
const errorLoggerMiddleware = (err, req, res, next) => {
  try {
    const context = getCurrentContext();
    
    logger.error('Ошибка обработки запроса', {
      error: {
        message: err.message || 'Unknown error',
        stack: err.stack || '',
        name: err.name || 'Error',
        code: err.code || 'UNKNOWN_ERROR'
      },
      req: {
        method: req.method || 'UNKNOWN',
        url: req.originalUrl || req.url || 'unknown',
        headers: getSafeHeaders(req.headers),
        query: req.query || {},
        body: req.body || {}
      },
      correlationId: req.correlationId,
      user: context?.user || { id: 'anonymous', role: 'guest' },
      ip: getSafeIP(req)
    });
  } catch (error) {
    console.error('Ошибка в errorLoggerMiddleware:', error);
  }
  
  next(err);
};

module.exports = {
  correlationMiddleware,
  requestLoggerMiddleware,
  errorLoggerMiddleware
}; 