/**
 * Индексный файл сервисов
 * Экспорт всех сервисов приложения
 */

const BaseService = require('./base.service')
const userService = require('./user.service')

module.exports = {
  BaseService,
  userService
} 