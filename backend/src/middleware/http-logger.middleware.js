const { logger } = require('../logging');
const { v4: uuidv4 } = require('uuid');

// Middleware для добавления correlation ID
const correlationMiddleware = (req, res, next) => {
  req.correlationId = `req_${uuidv4().split('-')[0]}`;
  res.setHeader('x-correlation-id', req.correlationId);
  next();
};

// Middleware для логирования HTTP запросов/ответов
const httpLoggerMiddleware = (req, res, next) => {
  // Пропускаем запросы к healthcheck и метрикам
  if (req.path.includes('/health') || req.path.includes('/metrics')) {
    return next();
  }

  const startTime = Date.now();

  // Логируем входящий запрос
  logger.http('Incoming HTTP request', {
    correlationId: req.correlationId,
    request: {
      method: req.method,
      url: req.url,
      headers: sanitizeHeaders(req.headers),
      query: req.query,
      body: req.body,
      ip: req.ip
    },
    component: 'http',
    timestamp: new Date().toISOString()
  });

  // Перехватываем методы res.end и res.write для логирования ответа
  const originalEnd = res.end;
  const chunks = [];

  res.end = function (chunk) {
    if (chunk) {
      chunks.push(Buffer.from(chunk));
    }
    
    const responseTime = Date.now() - startTime;
    
    // Логируем исходящий ответ
    logger.http('Outgoing HTTP response', {
      correlationId: req.correlationId,
      request: {
        method: req.method,
        url: req.url
      },
      response: {
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        contentType: res.getHeader('content-type'),
        contentLength: res.getHeader('content-length')
      },
      responseTime,
      component: 'http',
      timestamp: new Date().toISOString()
    });
    
    originalEnd.apply(res, arguments);
  };

  next();
};

// Middleware для логирования ошибок
const errorLoggerMiddleware = (err, req, res, next) => {
  logger.error('HTTP Error', {
    error: {
      message: err.message,
      stack: err.stack,
      code: err.code
    },
    request: {
      method: req.method,
      url: req.url,
      correlationId: req.correlationId
    }
  });
  next(err);
};

// Вспомогательная функция для очистки заголовков от чувствительных данных
function sanitizeHeaders(headers) {
  const sanitized = { ...headers };
  if (sanitized.authorization) {
    sanitized.authorization = '[REDACTED]';
  }
  return sanitized;
}

module.exports = {
  correlationMiddleware,
  httpLoggerMiddleware,
  errorLoggerMiddleware
}; 