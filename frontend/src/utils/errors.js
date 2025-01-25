/**
 * Классы ошибок приложения
 * Определяют различные типы ошибок для правильной обработки и отображения
 */

// Базовый класс ошибки приложения
export class AppError extends Error {
  constructor(message, details = null) {
    super(message)
    this.name = 'AppError'
    this.type = 'error'
    this.details = details
    this.timestamp = new Date().toISOString()
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      details: this.details,
      timestamp: this.timestamp
    }
  }

  toString() {
    return `[${this.name}] ${this.message}`
  }
}

// Ошибка валидации
export class ValidationError extends AppError {
  constructor(message, errors = {}) {
    super(message)
    this.name = 'ValidationError'
    this.type = 'validation'
    this.errors = errors
  }

  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors
    }
  }

  toString() {
    const fields = Object.keys(this.errors).join(', ')
    return `[${this.name}] ${this.message} (поля: ${fields})`
  }
}

// Ошибка аутентификации
export class AuthError extends AppError {
  constructor(message, code = 'AUTH_ERROR') {
    super(message)
    this.name = 'AuthError'
    this.type = 'auth'
    this.code = code
  }

  toJSON() {
    return {
      ...super.toJSON(),
      code: this.code
    }
  }
}

// Ошибка сети
export class NetworkError extends AppError {
  constructor(message = 'Ошибка сети. Проверьте подключение к интернету') {
    super(message)
    this.name = 'NetworkError'
    this.type = 'network'
  }
}

// Ошибка "не найдено"
export class NotFoundError extends AppError {
  constructor(message = 'Ресурс не найден', resource = null) {
    super(message)
    this.name = 'NotFoundError'
    this.type = 'not_found'
    this.resource = resource
  }

  toJSON() {
    return {
      ...super.toJSON(),
      resource: this.resource
    }
  }
}

// Ошибка сервера
export class ServerError extends AppError {
  constructor(message = 'Внутренняя ошибка сервера', code = null) {
    super(message)
    this.name = 'ServerError'
    this.type = 'server'
    this.code = code
  }

  toJSON() {
    return {
      ...super.toJSON(),
      code: this.code
    }
  }
}

// Ошибка превышения лимита запросов
export class RateLimitError extends AppError {
  constructor(message = 'Превышен лимит запросов. Пожалуйста, подождите', retryAfter = null) {
    super(message)
    this.name = 'RateLimitError'
    this.type = 'rate_limit'
    this.retryAfter = retryAfter
  }

  toJSON() {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter
    }
  }
}

// Ошибка конфликта данных
export class ConflictError extends AppError {
  constructor(message = 'Конфликт данных', conflictingFields = []) {
    super(message)
    this.name = 'ConflictError'
    this.type = 'conflict'
    this.conflictingFields = conflictingFields
  }

  toJSON() {
    return {
      ...super.toJSON(),
      conflictingFields: this.conflictingFields
    }
  }
}

// Ошибка устаревшей версии
export class VersionError extends AppError {
  constructor(message = 'Версия приложения устарела', currentVersion = null, requiredVersion = null) {
    super(message)
    this.name = 'VersionError'
    this.type = 'version'
    this.currentVersion = currentVersion
    this.requiredVersion = requiredVersion
  }

  toJSON() {
    return {
      ...super.toJSON(),
      currentVersion: this.currentVersion,
      requiredVersion: this.requiredVersion
    }
  }
}

/**
 * Парсинг ошибки API
 * @param {Error} error - Исходная ошибка
 * @returns {AppError} - Типизированная ошибка приложения
 */
export function parseApiError(error) {
  // Если это уже наша ошибка, возвращаем как есть
  if (error instanceof AppError) {
    return error
  }

  // Если нет ответа от сервера или нет соединения
  if (!error.response) {
    if (error.message === 'Network Error') {
      return new NetworkError()
    }
    return new AppError(error.message || 'Неизвестная ошибка')
  }

  const { status, data } = error.response

  // Получаем сообщение об ошибке
  const message = data?.message || getDefaultMessage(status)
  const errors = data?.errors
  const details = data?.details || null
  const code = data?.code || null

  // Обработка по статусу
  switch (status) {
    case 400:
      return new ValidationError(message, errors)
    
    case 401:
      return new AuthError(message, code)
    
    case 403:
      return new AuthError(message || 'Доступ запрещен', 'FORBIDDEN')
    
    case 404:
      return new NotFoundError(message, data?.resource)
    
    case 409:
      return new ConflictError(message, data?.conflictingFields)
    
    case 422:
      return new ValidationError(message, errors)
    
    case 429:
      return new RateLimitError(message, data?.retryAfter)
    
    case 500:
      return new ServerError(message, code)
    
    default:
      return new AppError(message, details)
  }
}

/**
 * Получение стандартного сообщения по статусу
 * @param {number} status - HTTP статус
 * @returns {string} - Сообщение об ошибке
 */
function getDefaultMessage(status) {
  const messages = {
    400: 'Некорректный запрос',
    401: 'Необходима авторизация',
    403: 'Доступ запрещен',
    404: 'Ресурс не найден',
    409: 'Конфликт данных',
    422: 'Ошибка валидации',
    429: 'Превышен лимит запросов',
    500: 'Внутренняя ошибка сервера',
    502: 'Сервер временно недоступен',
    503: 'Сервис временно недоступен',
    504: 'Превышено время ожидания'
  }
  return messages[status] || 'Что-то пошло не так'
} 