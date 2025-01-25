/**
 * Auth Routes
 * Маршруты для аутентификации
 */

const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const { authMiddleware } = require('../../../middleware/auth.middleware')

// Регистрация нового пользователя
router.post('/register', authController.register.bind(authController))

// Авторизация пользователя
router.post('/login', authController.login.bind(authController))

// Выход пользователя
router.post('/logout', authController.logout.bind(authController))

// Получение текущего пользователя
router.get('/me', authMiddleware, authController.getCurrentUser.bind(authController))

// Обновление профиля
router.put('/profile', authMiddleware, authController.updateProfile.bind(authController))

// Изменение пароля
router.put('/password', authMiddleware, authController.changePassword.bind(authController))

module.exports = router 