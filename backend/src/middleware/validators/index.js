/**
 * Индексный файл валидаторов
 * Экспорт всех валидаторов приложения
 */

const { validate, validateRequest } = require('./base.validator')
const userValidators = require('./user.validator')

module.exports = {
  validate,
  validateRequest,
  userValidators
} 