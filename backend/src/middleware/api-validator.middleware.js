const { logger } = require('../logging');
const { ValidationError } = require('../utils/errors');
const Joi = require('joi');

/**
 * Middleware для валидации API запросов и ответов
 */
class ApiValidator {
  /**
   * Создает middleware для валидации запроса и ответа
   * @param {Object} schema Схема валидации
   * @param {Object} schema.request Схема для валидации запроса
   * @param {Object} schema.response Схема для валидации ответа
   */
  static validate(schema) {
    return async (req, res, next) => {
      const logContext = {
        method: req.method,
        path: req.path,
        endpoint: `${req.method} ${req.path}`,
        requestId: req.id // Предполагается, что у нас есть middleware, который добавляет req.id
      };

      // Логируем входящий запрос
      logger.debug('API Request:', {
        ...logContext,
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers
      });

      try {
        // Валидация запроса
        if (schema.request) {
          const { error, value } = schema.request.validate({
            body: req.body,
            query: req.query,
            params: req.params
          }, { abortEarly: false });

          if (error) {
            logger.warn('API Request validation failed:', {
              ...logContext,
              errors: error.details.map(err => ({
                path: err.path,
                message: err.message
              }))
            });

            throw new ValidationError('Ошибка валидации запроса', {
              details: error.details
            });
          }

          // Заменяем данные запроса на валидированные
          req.body = value.body;
          req.query = value.query;
          req.params = value.params;
        }

        // Перехватываем оригинальный res.json для валидации ответа
        const originalJson = res.json;
        res.json = function(data) {
          try {
            // Валидация ответа
            if (schema.response) {
              const { error, value } = schema.response.validate(data, { 
                abortEarly: false,
                stripUnknown: false // Не удаляем неизвестные поля
              });

              if (error) {
                logger.error('API Response validation failed:', {
                  ...logContext,
                  response: data,
                  errors: error.details.map(err => ({
                    path: err.path,
                    message: err.message
                  }))
                });

                throw new ValidationError('Ошибка валидации ответа', {
                  details: error.details
                });
              }

              // Используем валидированные данные
              data = value;
            }

            // Логируем успешный ответ
            logger.debug('API Response:', {
              ...logContext,
              response: data
            });

            // Отправляем ответ
            return originalJson.call(this, data);
          } catch (error) {
            logger.error('Error in response processing:', {
              ...logContext,
              error: error.message,
              stack: error.stack
            });

            // В случае ошибки валидации отправляем 500
            return originalJson.call(this, {
              success: false,
              error: {
                message: 'Внутренняя ошибка сервера при обработке ответа',
                details: error.details || error.message
              }
            });
          }
        };

        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

module.exports = ApiValidator; 