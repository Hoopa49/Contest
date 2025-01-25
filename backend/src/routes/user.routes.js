/**
 * Маршруты для работы с пользователями
 * Определение эндпоинтов API для пользователей
 */

const { Router } = require('express')
const UserController = require('../controllers/user.controller')
const { authMiddleware } = require('../middleware/auth.middleware')

const router = Router()
const userController = new UserController()

// Публичные маршруты
router.post('/register', userController.register)
router.post('/login', userController.login)

// Защищенные маршруты (требуют аутентификации)
router.use(authMiddleware)

// Профиль пользователя
router.get('/me', userController.getProfile)
router.put('/profile', userController.updateProfile)
router.put('/password', userController.changePassword)

// Статистика и активность
router.get('/stats', userController.getUserStats)
router.get('/activity', userController.getUserActivity)

// Административные маршруты
router.get('/', userController.getAllUsers)

module.exports = router 