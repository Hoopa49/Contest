/**
 * Contest Processor Controller
 * Контроллер для обработки черновиков конкурсов
 */

const contestProcessor = require('../services/contest-processor.service')
const { ApiError } = require('../../../utils/errors')
const { logger } = require('../../../logging')

/**
 * Запуск обработки черновиков
 */
const processDrafts = async (req, res, next) => {
  try {
    await contestProcessor.processDrafts()
    res.json({ message: 'Обработка черновиков запущена успешно' })
  } catch (error) {
    logger.error('Ошибка при запуске обработки черновиков:', error)
    next(error)
  }
}

module.exports = {
  processDrafts
} 