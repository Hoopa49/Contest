/**
 * Утилиты для обработки ошибок
 */

const logger = require('../logging');

class ApiError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
      status: this.status,
      details: process.env.NODE_ENV !== 'production' ? this.details : undefined
    };
  }
}

// Предопределенные типы ошибок
const ErrorTypes = {
  NOT_FOUND: (message = 'Ресурс не найден', details = null) => 
    new ApiError(message, 404, 'NOT_FOUND', details),
    
  VALIDATION: (message = 'Ошибка валидации', details = null) => 
    new ApiError(message, 400, 'VALIDATION_ERROR', details),
    
  AUTH: (message = 'Ошибка аутентификации', details = null) => 
    new ApiError(message, 401, 'AUTHENTICATION_ERROR', details),
    
  FORBIDDEN: (message = 'Доступ запрещен', details = null) => 
    new ApiError(message, 403, 'FORBIDDEN', details),
    
  CONFLICT: (message = 'Конфликт данных', details = null) => 
    new ApiError(message, 409, 'CONFLICT', details),
    
  DATABASE: (message = 'Ошибка базы данных', details = null) => 
    new ApiError(message, 500, 'DATABASE_ERROR', details)
};

/**
 * Обертка для асинхронных обработчиков
 */
const catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Единый обработчик ошибок для всего приложения
 */
const errorHandler = (err, req, res, next) => {
  // Логируем ошибку
  logger.error('Ошибка обработки запроса:', {
    metadata: {
      request: {
        method: req?.method,
        url: req?.url,
        query: req?.query,
        params: req?.params,
        body: process.env.NODE_ENV !== 'production' ? req?.body : undefined,
        userId: req?.user?.id
      },
      error: {
        name: err?.name,
        message: err?.message,
        code: err?.code,
        status: err?.status,
        stack: process.env.NODE_ENV !== 'production' ? err?.stack : undefined
      }
    }
  });

  // Если заголовки уже отправлены
  if (res.headersSent) {
    return next(err);
  }

  // Формируем ответ об ошибке
  const error = err instanceof ApiError ? err : new ApiError(
    err?.message || 'Внутренняя ошибка сервера',
    err?.status || 500,
    err?.code || 'INTERNAL_ERROR'
  );

  // Отправляем ответ
  res.status(error.status).json({
    success: false,
    error: error.toJSON()
  });
};

module.exports = {
  ApiError,
  ErrorTypes,
  catchAsync,
  errorHandler
}; 