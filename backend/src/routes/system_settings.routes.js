/**
 * Маршруты для работы с системными настройками
 */

const express = require('express')
const router = express.Router()
const systemSettingsController = require('../controllers/system_settings.controller')
const { authMiddleware: isAuthenticated, adminMiddleware: isAdmin } = require('../middleware/auth.middleware')

// Получить все активные настройки
router.get('/', isAuthenticated, systemSettingsController.getAllActive)

// Получить историю изменений (только для админов)
router.get('/history', isAuthenticated, isAdmin, systemSettingsController.getHistory)

// Получить настройки по категории
router.get('/:category', isAuthenticated, systemSettingsController.getByCategory)

// Создать или обновить настройки (только для админов)
router.put('/:category', isAuthenticated, isAdmin, systemSettingsController.upsertSettings)

// Деактивировать настройки (только для админов)
router.delete('/:category', isAuthenticated, isAdmin, systemSettingsController.deactivate)

// Откатить к предыдущей версии (только для админов)
router.post('/rollback/:historyId', isAuthenticated, isAdmin, systemSettingsController.rollback)

module.exports = router 