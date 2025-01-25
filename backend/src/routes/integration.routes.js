const express = require('express')
const router = express.Router()
const integrationController = require('../controllers/integration.controller')
const youtubeRoutes = require('../modules/youtube/routes/youtube.routes')
const { authMiddleware, adminMiddleware } = require('../middleware/auth.middleware')

// Применяем middleware аутентификации и проверки прав админа ко всем маршрутам
router.use(authMiddleware)
router.use(adminMiddleware)

// Подключаем маршруты YouTube
router.use('/youtube', youtubeRoutes)

// Получение статистики
router.get('/stats', integrationController.getStats)

// Получение событий и активности
router.get('/events', integrationController.getEvents)
router.get('/activity', integrationController.getActivity)

// Управление интеграциями
router.post('/:platform/toggle', integrationController.toggleIntegration)
router.post('/:platform/search', integrationController.runSearch)

module.exports = router 