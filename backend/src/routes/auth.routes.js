/**
 * Маршруты аутентификации
 */

const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const { authMiddleware } = require('../middleware/auth.middleware')
const { userValidators } = require('../middleware/validators')

// Публичные маршруты
router.post('/register', userValidators.validateRegister, authController.register)
router.post('/login', userValidators.validateLogin, authController.login)
router.post('/refresh-token', authController.refreshToken)

// Защищенные маршруты
router.use(authMiddleware)
router.post('/logout', authController.logout)
router.get('/me', authController.getCurrentUser)
router.put('/profile', userValidators.validateUpdateProfile, authController.updateProfile)
router.put('/change-password', userValidators.validateChangePassword, authController.changePassword)

// Telegram авторизация
router.get('/telegram/auth-url', authController.getTelegramAuthUrl)
router.get('/telegram/callback', authController.handleTelegramCallback)

module.exports = router 