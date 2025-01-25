/**
 * Модуль аутентификации
 * Экспорт всех компонентов аутентификации
 */

const authRoutes = require('./routes/auth.routes')
const authService = require('./services/auth.service')
const authController = require('./controllers/auth.controller')

module.exports = {
  routes: authRoutes,
  service: authService,
  controller: authController
} 