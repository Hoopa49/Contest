/**
 * Базовый контроллер
 * Содержит общие методы для обработки HTTP запросов и форматирования ответов
 */

const { ValidationError, ApiError } = require('../utils/errors')
const { logger } = require('../logging')
const ApiResponse = require('../utils/api-response')

class BaseController {
  constructor(service) {
    this.service = service
    
  }

  /**
   * Отправка успешного ответа
   */
  sendSuccess(res, data = null, message = 'Операция выполнена успешно', status = 200) {
    res.status(status).json(ApiResponse.success(data, message))
  }

  /**
   * Отправка ответа с пагинацией
   */
  sendPaginated(res, data, pagination, message = 'Данные получены успешно') {
    const meta = {
      ...pagination,
      total: pagination.total || 0,
      totalPages: Math.ceil((pagination.total || 0) / pagination.perPage)
    }
    res.status(200).json(ApiResponse.paginated(data, meta, message))
  }

  /**
   * Отправка ответа с ошибкой
   */
  sendError(res, error, status = 500) {
    const errorObj = typeof error === 'string' ? { message: error } : error

    // Логируем детали ошибки
    logger.error('Ошибка обработки запроса', {
      metadata: {
        error: {
          status,
          message: errorObj?.message || 'Неизвестная ошибка',
          stack: errorObj?.stack,
          name: errorObj?.name,
          code: errorObj?.code
        },
        validation_errors: errorObj?.errors,
        timestamp: new Date().toISOString()
      }
    })

    // Определяем статус и тип ответа
    const responseStatus = errorObj?.statusCode || status

    switch (responseStatus) {
      case 401:
        return res.status(responseStatus).json(ApiResponse.authError(errorObj.message))
      case 403:
        return res.status(responseStatus).json(ApiResponse.forbidden(errorObj.message))
      case 404:
        return res.status(responseStatus).json(ApiResponse.notFound(errorObj.message))
      case 422:
        return res.status(responseStatus).json(
          ApiResponse.validationError(errorObj.errors, errorObj.message)
        )
      default:
        return res.status(responseStatus).json(
          ApiResponse.error(
            errorObj.message || 'Внутренняя ошибка сервера',
            responseStatus,
            errorObj.errors
          )
        )
    }
  }

  /**
   * Получение параметров пагинации из запроса
   */
  getPaginationParams(req) {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const perPage = Math.min(100, Math.max(1, parseInt(req.query.perPage) || 10))
    return { page, perPage }
  }

  /**
   * Получение параметров сортировки из запроса
   */
  getSortParams(req) {
    const { sortBy = 'createdAt', order = 'DESC' } = req.query
    const validOrder = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC'
    return [[sortBy, validOrder]]
  }

  /**
   * Создание обработчика с автоматической обработкой ошибок
   */
  handleAsync(handler) {
    return async (req, res, next) => {
      try {
        await handler(req, res, next)
      } catch (error) {
        let status = 500
        
        if (error instanceof ValidationError) {
          status = 422
        } else if (error instanceof ApiError && error.statusCode === 409) {
          status = 409
        }

        return this.sendError(res, error, status)
      }
    }
  }

  /**
   * Стандартный обработчик для получения списка записей
   */
  getAll = this.handleAsync(async (req, res) => {
    const { page, perPage } = this.getPaginationParams(req)
    const order = this.getSortParams(req)
    
    logger.info('Запрос списка записей', {
      metadata: {
        controller: this.constructor.name,
        method: 'getAll',
        params: {
          page,
          perPage,
          order,
          query: req.query
        }
      }
    })
    
    const result = await this.service.getAll({
      page,
      perPage,
      order,
      ...req.query
    })

    this.sendSuccess(res, result)
  })

  /**
   * Стандартный обработчик для получения записи по ID
   */
  getById = this.handleAsync(async (req, res) => {
    const { id } = req.params
    
    logger.info('Запрос записи по ID', {
      metadata: {
        controller: this.constructor.name,
        method: 'getById',
        params: { id }
      }
    })
    
    const result = await this.service.getById(id)
    this.sendSuccess(res, result)
  })

  /**
   * Стандартный обработчик для создания записи
   */
  create = this.handleAsync(async (req, res) => {
    logger.info('Создание новой записи', {
      metadata: {
        controller: this.constructor.name,
        method: 'create',
        body: req.body
      }
    })
    
    const result = await this.service.create(req.body)
    this.sendSuccess(res, result, 'Запись успешно создана', 201)
  })

  /**
   * Стандартный обработчик для обновления записи
   */
  update = this.handleAsync(async (req, res) => {
    const { id } = req.params
    
    logger.info('Обновление записи', {
      metadata: {
        controller: this.constructor.name,
        method: 'update',
        params: { id },
        body: req.body
      }
    })
    
    const result = await this.service.update(id, req.body)
    this.sendSuccess(res, result, 'Запись успешно обновлена')
  })

  /**
   * Стандартный обработчик для удаления записи
   */
  delete = this.handleAsync(async (req, res) => {
    const { id } = req.params
    
    logger.info('Удаление записи', {
      metadata: {
        controller: this.constructor.name,
        method: 'delete',
        params: { id }
      }
    })
    
    await this.service.delete(id)
    this.sendSuccess(res, null, 'Запись успешно удалена')
  })
}

module.exports = BaseController 