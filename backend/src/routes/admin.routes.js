/**
 * Маршруты для административных функций
 */

const express = require('express')
const router = express.Router()
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware')
const AdminController = require('../controllers/admin.controller')
const analyticsController = require('../controllers/analytics.controller')
const youtubeRoutes = require('../modules/youtube/routes/youtube.routes')
const systemSettingsRoutes = require('./system_settings.routes')

const adminController = new AdminController()

// Все маршруты защищены authMiddleware и adminMiddleware
router.use(authMiddleware)
router.use(adminMiddleware)

// Подключаем маршруты YouTube
router.use('/integrations/youtube', youtubeRoutes)

// Подключаем маршруты системных настроек
router.use('/system-settings', systemSettingsRoutes)

// Получение статистики системы
router.get('/stats', adminController.getSystemStats.bind(adminController))

// Получение последних действий
router.get('/recent-actions', adminController.getRecentActions.bind(adminController))

// Получение активности интеграций
router.get('/activity', adminController.getIntegrationActivity.bind(adminController))

// Маршруты для аналитики
router.get('/analytics/dashboard', analyticsController.getDashboardAnalytics.bind(analyticsController))
router.get('/analytics/:category/metrics', analyticsController.aggregateMetrics.bind(analyticsController))
router.get('/analytics/forecasts', analyticsController.getForecasts.bind(analyticsController))
router.get('/analytics/recommendations', analyticsController.getRecommendations.bind(analyticsController))

// Получение списка пользователей
router.get('/users', adminController.getUsers.bind(adminController))

// Блокировка/разблокировка пользователя
router.put('/users/:userId/toggle-status', adminController.toggleUserStatus.bind(adminController))

// Получение и обновление настроек
router.get('/settings', adminController.getSettings.bind(adminController))
router.put('/settings', adminController.updateSettings.bind(adminController))

// Получение системных логов
router.get('/logs', adminController.getLogs.bind(adminController))

// Маршруты для работы с пользователями
router.put('/users/:userId', adminController.updateUser.bind(adminController))
router.delete('/users/:userId', adminController.deleteUser.bind(adminController))

module.exports = router 