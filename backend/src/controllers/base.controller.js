/**
 * Базовый контроллер
 * Содержит общие методы для обработки HTTP запросов и форматирования ответов
 */

const { ApiError, ErrorTypes, ValidationError } = require('../utils/errors')
const logger = require('../logging')
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
  sendError(res, error) {
    let errorObj;
    
    if (typeof error === 'string') {
      errorObj = new ApiError(error, 500);
    } else if (error instanceof Error) {
      if (error instanceof ApiError || error instanceof ValidationError) {
        errorObj = error;
      } else {
        errorObj = new ApiError(
          error.message || 'Внутренняя ошибка сервера',
          500,
          'INTERNAL_ERROR',
          {
            name: error.name,
            stack: error.stack,
            details: error.details || error.errors || null
          }
        );
      }
    } else {
      errorObj = new ApiError('Неизвестная ошибка', 500);
    }

    // Логируем детали ошибки
    logger.error('Ошибка обработки запроса', {
      metadata: {
        error: {
          status: errorObj.status || 500,
          message: errorObj.message,
          code: errorObj.code || 'INTERNAL_ERROR',
          name: errorObj.name,
          details: errorObj.details || null,
          stack: process.env.NODE_ENV !== 'production' ? errorObj.stack : undefined
        },
        request: {
          path: res.req?.path,
          method: res.req?.method,
          query: res.req?.query,
          params: res.req?.params,
          user: res.req?.user ? { id: res.req.user.id, email: res.req.user.email } : null
        }
      }
    });

    // Формируем ответ клиенту
    const errorResponse = {
      success: false,
      error: {
        message: errorObj.message,
        code: errorObj.code || 'INTERNAL_ERROR',
        status: errorObj.status || 500
      }
    };

    // Добавляем дополнительные детали только для не продакшн окружения
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.error.details = errorObj.details || null;
      errorResponse.error.stack = errorObj.stack;
    }

    res.status(errorObj.status || 500).json(errorResponse);
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
        await handler(req, res, next);
      } catch (error) {
        let errorObj;

        // Определяем тип ошибки и создаем соответствующий объект
        if (error instanceof ApiError) {
          errorObj = error;
        } else if (error.name === 'SequelizeValidationError') {
          errorObj = ErrorTypes.VALIDATION(
            'Ошибка валидации данных',
            error.errors.map(e => ({ field: e.path, message: e.message }))
          );
        } else if (error.name === 'SequelizeDatabaseError') {
          errorObj = ErrorTypes.DATABASE(
            'Ошибка базы данных',
            process.env.NODE_ENV === 'development' ? error.message : undefined
          );
        } else {
          errorObj = new ApiError(
            error.message || 'Внутренняя ошибка сервера',
            500,
            'INTERNAL_ERROR',
            process.env.NODE_ENV === 'development' ? error.stack : undefined
          );
        }

        // Логируем ошибку
        logger.error('Ошибка в контроллере:', {
          error: {
            message: errorObj.message,
            code: errorObj.code,
            status: errorObj.status,
            details: errorObj.details,
            stack: error.stack
          },
          request: {
            method: req.method,
            url: req.url,
            params: req.params,
            query: req.query,
            body: req.body,
            user: req.user?.id
          }
        });

        // Отправляем ответ с ошибкой
        this.sendError(res, errorObj);
      }
    };
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