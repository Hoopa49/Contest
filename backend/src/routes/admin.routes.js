/**
 * Маршруты для административных функций
 */

const express = require('express')
const router = express.Router()
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware')
const AdminController = require('../controllers/admin.controller')
const analyticsController = require('../controllers/analytics.controller')
const youtubeRoutes = require('../modules/youtube/routes/youtube.routes')

const adminController = new AdminController()

// Все маршруты защищены authMiddleware и adminMiddleware
router.use(authMiddleware)
router.use(adminMiddleware)

// Подключаем маршруты YouTube
router.use('/integrations/youtube', youtubeRoutes)

// Получение статистики системы
router.get('/stats', adminController.getSystemStats.bind(adminController))

// Получение последних действий
router.get('/activity', adminController.getRecentActions.bind(adminController))

// Маршруты для аналитики
router.get('/analytics', analyticsController.getLatestAnalytics.bind(analyticsController))
router.get('/analytics/:category', analyticsController.getAnalyticsByCategory.bind(analyticsController))
router.get('/analytics/:category/metrics', analyticsController.aggregateMetrics.bind(analyticsController))

// Получение списка пользователей
router.get('/users', adminController.getUsers.bind(adminController))

// Блокировка/разблокировка пользователя
router.put('/users/:userId/toggle-status', adminController.toggleUserStatus.bind(adminController))

// Получение и обновление настроек
router.get('/settings', adminController.getSettings.bind(adminController))
router.put('/settings', adminController.updateSettings.bind(adminController))

// Получение системных логов
router.get('/logs', adminController.getLogs.bind(adminController))

module.exports = router 