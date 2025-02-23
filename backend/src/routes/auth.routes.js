/**
 * Маршруты аутентификации
 */

const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const googleAuthController = require('../controllers/google.auth.controller')
const { authMiddleware } = require('../middleware/auth.middleware')
const { userValidators } = require('../middleware/validators')

// Публичные маршруты
router.post('/register', userValidators.validateRegister, authController.register)
router.post('/login', userValidators.validateLogin, authController.login)
router.post('/refresh-token', authController.refreshToken)

// Google авторизация
router.get('/google/url', googleAuthController.getAuthUrl)
router.post('/google/callback', googleAuthController.handleCallback)

// Telegram авторизация (публичные маршруты)
router.get('/telegram/url', (req, res, next) => {
  console.log('Получен запрос на URL для Telegram авторизации')
  authController.getTelegramAuthUrl(req, res, next)
})
router.post('/telegram/callback', authController.handleTelegramCallback)

// Защищенные маршруты
router.use(authMiddleware)
router.post('/logout', authController.logout)
router.get('/me', authController.getCurrentUser)
router.put('/profile', userValidators.validateUpdateProfile, authController.updateProfile)
router.put('/change-password', userValidators.validateChangePassword, authController.changePassword)

module.exports = router 