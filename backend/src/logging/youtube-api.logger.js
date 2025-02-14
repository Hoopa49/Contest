const winston = require('winston');
const path = require('path');
const { format } = winston;

// Создаем форматтер для логов
const logFormat = format.combine(
  format.timestamp(),
  format.json(),
  format.printf(info => {
    const { timestamp, level, message, operation, ...meta } = info;
    
    // Добавляем описание операции
    const operationDescription = {
      'INITIALIZE': '=== Инициализация YouTube API ===',
      'CHECK_QUOTA': '=== Проверка доступной квоты ===',
      'SEARCH': '=== Поиск видео ===',
      'VIDEO_DETAILS': '=== Получение деталей видео ===',
      'CHANNEL_DETAILS': '=== Получение информации о канале ===',
      'QUOTA_UPDATE': '=== Обновление использованной квоты ===',
      'API_ERROR': '=== Ошибка YouTube API ==='
    }[operation] || '=== YouTube API операция ===';

    return `${operationDescription}\n${JSON.stringify({
      timestamp,
      level,
      message,
      operation,
      ...meta
    }, null, 2)}`;
  })
);

// Создаем логгер для API запросов
const apiLogger = winston.createLogger({
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'backend', 'youtube-api', 'api.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

// Создаем логгер для ошибок API
const apiErrorLogger = winston.createLogger({
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'backend', 'youtube-api', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

// Добавляем логирование в консоль для разработки
if (process.env.NODE_ENV !== 'production') {
  apiLogger.add(new winston.transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
  
  apiErrorLogger.add(new winston.transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

module.exports = {
  apiLogger,
  apiErrorLogger,
  
  // Хелпер для логирования API запросов
  logApiRequest: (operation, params = {}) => {
    apiLogger.info('YouTube API Request', {
      operation,
      request_id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      params,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      api_version: 'v3',
      request_details: {
        method: params.method || 'GET',
        endpoint: `youtube/${operation.toLowerCase()}`,
        query_params: params.searchParams || {},
        headers: params.headers || {}
      }
    });
  },
  
  // Хелпер для логирования API ответов
  logApiResponse: (operation, response, quotaInfo = {}) => {
    apiLogger.info('YouTube API Response', {
      operation,
      response_id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      quota_info: {
        ...quotaInfo,
        daily_limit: process.env.YOUTUBE_QUOTA_LIMIT || 10000,
        reset_time: new Date().setHours(24, 0, 0, 0)
      },
      response_details: response ? {
        status: response.status,
        status_text: response.statusText,
        headers: response.headers,
        data_preview: response.data ? JSON.stringify(response.data).slice(0, 200) + '...' : null
      } : null,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      execution_time: quotaInfo.executionTime || null
    });
  },
  
  // Хелпер для логирования ошибок API
  logApiError: (operation, error, context = {}) => {
    apiErrorLogger.error('YouTube API Error', {
      operation,
      error_id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      error_details: {
        message: error.message,
        code: error.code,
        status: error.status,
        name: error.name,
        stack: error.stack
      },
      context: {
        ...context,
        environment: process.env.NODE_ENV || 'development',
        api_version: 'v3'
      },
      timestamp: new Date().toISOString(),
      quota_info: context.quotaInfo || null,
      request_details: context.requestDetails || null
    });
  }
}; 