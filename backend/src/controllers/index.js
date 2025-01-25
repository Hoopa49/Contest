/**
 * Индексный файл контроллеров
 * Экспорт всех контроллеров приложения
 */

const BaseController = require('./base.controller')
const UserController = require('./user.controller')
const AuthController = require('./auth.controller')
const AdminController = require('./admin.controller')
const ContestController = require('./contest.controller')
const NotificationController = require('./notification.controller')
const IntegrationController = require('./integration.controller')

module.exports = {
  BaseController,
  UserController,
  AuthController,
  AdminController,
  ContestController,
  NotificationController,
  IntegrationController
} 