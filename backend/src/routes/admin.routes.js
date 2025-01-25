/**
 * Маршруты для административных функций
 */

const express = require('express')
const router = express.Router()
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware')
const AdminController = require('../controllers/admin.controller')

const adminController = new AdminController()

// Все маршруты защищены authMiddleware и adminMiddleware
router.use(authMiddleware)
router.use(adminMiddleware)

// Получение статистики системы
router.get('/stats', adminController.getSystemStats.bind(adminController))

// Получение последних действий
router.get('/activity', adminController.getRecentActions.bind(adminController))

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