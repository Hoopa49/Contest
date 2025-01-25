/**
 * Утилиты для обработки ошибок
 */

const { logger } = require('../logging');

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.status = 401;
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
    this.status = 403;
  }
}

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.status = 409;
  }
}

/**
 * Обертка для асинхронных обработчиков
 * @param {Function} fn Асинхронная функция для обработки
 * @returns {Function} Обработчик с перехватом ошибок
 */
const catchAsync = fn => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      // Логируем ошибку с контекстом запроса
      logger.error('Необработанная ошибка', {
        metadata: {
          error: {
            type: error.name,
            message: error.message,
            stack: error.stack
          },
          request: {
            path: req.path,
            method: req.method,
            query: req.query,
            params: req.params,
            userId: req.user?.id
          }
        }
      });
      next(error);
    }
  };
};

const errorHandler = (err, req, res, next) => {
  // Форматируем контекст ошибки для логирования
  logger.error('Ошибка обработки запроса', {
    metadata: {
      error: {
        type: err.name,
        message: err.message,
        stack: err.name !== 'ValidationError' && 
               err.name !== 'UnauthorizedError' && 
               err.name !== 'ForbiddenError' ? err.stack : undefined
      },
      request: {
        path: req.path,
        method: req.method,
        query: req.query,
        params: req.params,
        userId: req.user?.id
      }
    }
  });

  // Обрабатываем различные типы ошибок
  switch (err.name) {
    case 'ValidationError':
      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации',
        errors: err.errors
      });

    case 'UnauthorizedError':
      return res.status(401).json({
        success: false,
        message: 'Необходима авторизация'
      });

    case 'ForbiddenError':
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещен'
      });

    case 'NotFoundError':
      return res.status(404).json({
        success: false,
        message: err.message || 'Ресурс не найден'
      });

    case 'ConflictError':
      return res.status(409).json({
        success: false,
        message: err.message
      });

    default:
      return res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
      });
  }
};

module.exports = {
  ApiError,
  NotFoundError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  ConflictError,
  catchAsync,
  errorHandler
}; 