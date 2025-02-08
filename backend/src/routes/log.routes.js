/**
 * Маршруты для логирования
 * Обработка запросов связанных с логированием ошибок
 */

const express = require('express')
const router = express.Router()
const logger = require('../logging')

// Логирование ошибок с фронтенда
router.post('/error', async (req, res) => {
  try {
    const errorData = req.body || {}
    
    // Форматируем данные для логирования
    const logData = {
      type: 'system',
      message: errorData.message || 'Frontend error',
      metadata: {
        ...errorData,
        stack: Array.isArray(errorData.stack) ? errorData.stack : [],
        component: errorData.component || 'unknown',
        props: errorData.props || {},
        state: errorData.state || {},
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      }
    }

    // Логируем ошибку
    logger.error(logData.message, logData.metadata)

    res.status(200).json({ 
      success: true, 
      message: 'Error logged successfully' 
    })
  } catch (error) {
    console.error('Error logging frontend error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to log error' 
    })
  }
})

module.exports = router 