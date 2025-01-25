/**
 * Маршруты для работы с уведомлениями
 */

const express = require('express')
const router = express.Router()
const notificationController = require('../controllers/notification.controller')
const { authMiddleware } = require('../middleware/auth.middleware')

// Все маршруты защищены middleware аутентификации
router.use(authMiddleware)

// Получение уведомлений
router.get('/', notificationController.getAll)
router.get('/unread', notificationController.getUnread)

// Управление уведомлениями
router.put('/:id/read', notificationController.markAsRead)
router.put('/read-all', notificationController.markAllAsRead)
router.delete('/:id', notificationController.delete)

// Настройки уведомлений
router.get('/settings', notificationController.getSettings)
router.put('/settings', notificationController.updateSettings)

module.exports = router 