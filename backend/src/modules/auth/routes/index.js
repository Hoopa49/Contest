/**
 * Auth Routes
 * Маршруты для модуля авторизации
 */

const express = require('express')
const router = express.Router()
const { refreshToken } = require('../controllers/auth.controller')

/**
 * Маршруты аутентификации
 * Определение всех маршрутов для аутентификации
 */

// Маршрут для обновления токена
router.post('/refresh', refreshToken)

// TODO: Добавить остальные маршруты аутентификации
// router.post('/register', register)
// router.post('/login', login)
// router.post('/logout', logout)

module.exports = router 