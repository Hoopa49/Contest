/**
 * Базовый класс для форматирования API ответов
 * Обеспечивает единый формат ответов для всех эндпоинтов
 */
class ApiResponse {
  /**
   * Создает успешный ответ
   * @param {any} data - Данные для отправки
   * @param {string} message - Сообщение об успехе
   * @param {Object} meta - Метаданные (опционально)
   */
  static success(data = null, message = 'Success', meta = null) {
    const response = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    }
    if (meta) {
      response.meta = meta
    }
    return response
  }

  /**
   * Создает ответ с ошибкой
   * @param {string} message - Сообщение об ошибке
   * @param {number} status - HTTP статус
   * @param {Object} errors - Детали ошибок
   */
  static error(message = 'Error occurred', status = 500, errors = null) {
    const response = {
      success: false,
      message,
      status,
      timestamp: new Date().toISOString()
    }
    if (errors) {
      response.errors = errors
    }
    return response
  }

  /**
   * Создает ответ с пагинацией
   */
  static paginated(data, pagination, message = 'Success') {
    return {
      success: true,
      message,
      data,
      meta: {
        pagination: {
          page: pagination.page,
          perPage: pagination.perPage,
          total: pagination.total,
          totalPages: Math.ceil(pagination.total / pagination.perPage)
        }
      },
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Создает ответ с ошибкой валидации
   */
  static validationError(errors, message = 'Validation failed') {
    return this.error(message, 422, errors)
  }

  /**
   * Создает ответ с ошибкой аутентификации
   */
  static authError(message = 'Authentication failed') {
    return this.error(message, 401)
  }

  /**
   * Создает ответ с ошибкой доступа
   */
  static forbidden(message = 'Access denied') {
    return this.error(message, 403)
  }

  /**
   * Создает ответ с ошибкой отсутствия ресурса
   */
  static notFound(message = 'Resource not found') {
    return this.error(message, 404)
  }
}

module.exports = ApiResponse; 