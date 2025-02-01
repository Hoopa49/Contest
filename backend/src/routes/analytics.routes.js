/**
 * Маршруты для работы с аналитическими данными
 */

const express = require('express')
const router = express.Router()
const analyticsController = require('../controllers/analytics.controller')
const { authMiddleware: isAuthenticated, adminMiddleware: isAdmin } = require('../middleware/auth.middleware')

// Сохранить аналитические данные (только для админов)
router.post('/', isAuthenticated, isAdmin, analyticsController.saveAnalytics)

// Получить аналитику по категории за период
router.get('/:category', isAuthenticated, analyticsController.getAnalyticsByCategory)

// Получить последние аналитические данные
router.get('/:category/latest', isAuthenticated, analyticsController.getLatestAnalytics)

// Получить агрегированные метрики
router.get('/:category/aggregate', isAuthenticated, analyticsController.aggregateMetrics)

module.exports = router 