/**
 * Middleware обработки ошибок
 * Централизованная обработка всех ошибок приложения
 */

const { 
  ValidationError, 
  AuthenticationError, 
  NotFoundError 
} = require('../utils/errors')
const logger = require('../logging')

// Обработка ошибок валидации Sequelize
const handleSequelizeValidationError = (err) => {
  const errors = Object.values(err.errors).map((item) => item.message)
  return new AppError(`Ошибка валидации: ${errors.join(', ')}`, 400)
}

// Обработка дубликатов в Sequelize
const handleSequelizeUniqueConstraintError = (err) => {
  const field = err.errors[0]?.path || 'поле'
  return new AppError(`${field} уже существует`, 409)
}

// Обработка ошибок JWT
const handleJWTError = () => 
  new AuthenticationError('Неверный токен. Пожалуйста, войдите снова')

const handleJWTExpiredError = () => 
  new AuthenticationError('Срок действия токена истек. Пожалуйста, войдите снова')

// Форматирование ошибок для разработки
const sendErrorDev = (err, res) => {
  logger.error('Ошибка разработки:', {
    metadata: {
      error: err
    }
  })

  // Для ошибок аутентификации возвращаем 401 статус
  if (err instanceof AuthenticationError) {
    return res.status(401).json({
      success: false,
      error: {
        statusCode: 401,
        status: 'error'
      },
      message: err.message
    })
  }

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  })
}

// Форматирование ошибок для продакшена
const sendErrorProd = (err, res) => {
  // Для ошибок аутентификации возвращаем 401 статус
  if (err instanceof AuthenticationError) {
    return res.status(401).json({
      success: false,
      message: err.message
    })
  }

  // Операционные, доверенные ошибки: отправляем сообщение клиенту
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  } 
  // Программные или неизвестные ошибки: не отправляем детали клиенту
  else {
    logger.error('Критическая ошибка:', {
      metadata: {
        error: err
      }
    })
    
    res.status(500).json({
      status: 'error',
      message: 'Что-то пошло не так!'
    })
  }
}

// Главный обработчик ошибок
const errorHandler = (err, req, res, next) => {
  // Получаем статус ошибки
  const status = err.status || 500;
  const message = err.message || 'Внутренняя ошибка сервера';

  // Логируем ошибку с разным уровнем в зависимости от статуса
  if (status >= 500) {
    logger.error('Критическая ошибка сервера', {
      metadata: {
        error: {
          message: err.message,
          name: err.name,
          stack: err.stack,
          status: status,
          code: err.code
        },
        request: {
          method: req.method,
          url: req.originalUrl,
          query: req.query,
          body: req.body,
          user: req.user?.id || 'anonymous'
        }
      }
    });
  } else if (status >= 400) {
    logger.warn('Ошибка клиентского запроса', {
      metadata: {
        error: {
          message: err.message,
          name: err.name,
          status: status,
          code: err.code
        },
        request: {
          method: req.method,
          url: req.originalUrl,
          query: req.query,
          user: req.user?.id || 'anonymous'
        }
      }
    });
  }

  // Формируем ответ
  const response = {
    success: false,
    error: {
      message: message,
      status: status
    }
  };

  // Добавляем дополнительные поля только в development
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
    response.error.code = err.code;
  }

  res.status(status).json(response);
}

class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  ApiError,
  errorHandler
}; 