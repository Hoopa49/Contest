/**
 * Индексный файл маршрутов
 * Определение всех маршрутов приложения
 */

const express = require('express')
const router = express.Router()
const authRoutes = require('./auth.routes')
const userRoutes = require('./user.routes')
const contestRoutes = require('../modules/contest/routes/contest.routes')
const logRoutes = require('./log.routes')
const adminRoutes = require('./admin.routes')
const notificationRoutes = require('./notification.routes')
const integrationRoutes = require('./integration.routes')
const systemSettingsRoutes = require('./system_settings.routes')
const analyticsRoutes = require('./analytics.routes')

// Маршруты аутентификации
router.use('/auth', authRoutes)

// Маршруты пользователей
router.use('/users', userRoutes)

// Маршруты конкурсов и связанных с ними ресурсов (комментарии, отзывы, статистика)
router.use('/contests', contestRoutes)

// Маршруты логирования
router.use('/logs', logRoutes)

// Маршруты администратора
router.use('/admin', adminRoutes)

// Маршруты уведомлений
router.use('/notifications', notificationRoutes)

// Маршруты интеграций
router.use('/admin/integrations', integrationRoutes)

// Маршруты системных настроек
router.use('/admin/system-settings', systemSettingsRoutes)

// Маршруты аналитики
router.use('/admin/analytics', analyticsRoutes)

// Обработка несуществующих маршрутов
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Маршрут ${req.originalUrl} не найден`
  })
})

module.exports = router 