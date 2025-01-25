/**
 * Базовый валидатор
 * Общие функции для валидации запросов
 */

const { validationResult } = require('express-validator')
const { ValidationError } = require('../../utils/errors')

/**
 * Проверка результатов валидации
 */
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new ValidationError('Ошибка валидации')
    error.errors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }))
    throw error
  }
  next()
}

/**
 * Обработчик валидации с автоматической проверкой результатов
 */
const validateRequest = (validations) => {
  return async (req, res, next) => {
    try {
      // Выполняем все валидации
      for (let validation of validations) {
        await validation.run(req)
      }
      // Проверяем результаты
      validate(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = {
  validate,
  validateRequest
} 