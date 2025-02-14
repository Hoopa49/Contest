'use strict'

const { initializeModels } = require('../../../models')
const logger = require('../../../logging')
const { ApiError } = require('../../../utils/errors')

let models = null

const ensureModels = async () => {
  if (!models) {
    models = await initializeModels()
    if (!models) {
      throw new Error('Не удалось инициализировать модели')
    }
  }
  return models
}

/**
 * Получение статистики шеринга для конкурса
 */
const getContestShareStats = async (req, res, next) => {
  try {
    const { id } = req.params
    logger.info('Getting share stats for contest. Request details:', {
      id,
      method: req.method,
      url: req.originalUrl
    })

    const { Contest, ContestShareStats } = await ensureModels()

    // Проверяем существование конкурса
    const contest = await Contest.findByPk(id)
    if (!contest) {
      logger.error('Contest not found:', id)
      throw new ApiError(404, 'Конкурс не найден')
    }
    logger.info('Contest found:', contest.id)

    // Получаем статистику шеринга
    const shareStats = await ContestShareStats.findAll({
      where: { contest_id: id },
      attributes: ['platform', 'shares_count'],
      raw: true
    })

    logger.info('Found share stats:', JSON.stringify(shareStats))

    // Инициализируем объект с нулевыми значениями
    const statsObject = {
      'VK': 0,
      'Telegram': 0,
      'WhatsApp': 0,
      'Instagram': 0,
      'X': 0,
      'Facebook': 0
    }

    // Заполняем значения из базы данных
    if (shareStats && shareStats.length > 0) {
      shareStats.forEach(stat => {
        if (stat && stat.platform) {
          // Ищем соответствующий ключ в statsObject независимо от регистра
          const networkKey = Object.keys(statsObject).find(
            key => key.toLowerCase() === stat.platform.toLowerCase()
          )
          if (networkKey) {
            statsObject[networkKey] = parseInt(stat.shares_count) || 0
          }
        }
      })
    }

    logger.info('Sending response:', JSON.stringify(statsObject))
    return res.status(200).json(statsObject)
  } catch (error) {
    logger.error('Error in getContestShareStats:', error)
    next(error)
  }
}

/**
 * Обновление счетчика шеринга для конкурса
 */
const incrementShareCount = async (req, res, next) => {
  try {
    const { id } = req.params
    const { network } = req.body

    logger.info('Incrementing share count. Request details:', {
      contestId: id,
      network,
      method: req.method,
      url: req.originalUrl,
      body: req.body
    })

    const { Contest, ContestShareStats } = await ensureModels()

    if (!network) {
      logger.error('Network not specified in request')
      throw new ApiError(400, 'Не указана социальная сеть')
    }

    // Проверяем существование конкурса
    const contest = await Contest.findByPk(id)
    if (!contest) {
      logger.error('Contest not found:', id)
      throw new ApiError(404, 'Конкурс не найден')
    }
    logger.info('Contest found:', contest.id)

    // Преобразуем название сети в правильный формат
    const networkMap = {
      'vk': 'VK',
      'telegram': 'Telegram',
      'whatsapp': 'WhatsApp',
      'instagram': 'Instagram',
      'x': 'X',
      'facebook': 'Facebook'
    }

    const normalizedNetwork = networkMap[network.toLowerCase()]
    if (!normalizedNetwork) {
      logger.error('Invalid network specified:', network)
      throw new ApiError(400, 'Указана неподдерживаемая социальная сеть')
    }

    // Находим или создаем запись статистики
    const [shareStat, created] = await ContestShareStats.findOrCreate({
      where: { 
        contest_id: id,
        platform: normalizedNetwork
      },
      defaults: {
        shares_count: 0
      }
    })

    logger.info('Share stat record:', {
      created,
      before: shareStat.toJSON()
    })

    // Увеличиваем счетчик
    await shareStat.increment('shares_count')
    await shareStat.reload()

    logger.info('Updated share stats:', shareStat.toJSON())

    return res.status(200).json({
      platform: shareStat.platform,
      shares_count: shareStat.shares_count
    })
  } catch (error) {
    logger.error('Error in incrementShareCount:', error)
    if (error instanceof ApiError) {
      return res.status(error.status).json({ 
        error: error.message 
      })
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Некорректное название социальной сети'
      })
    }
    return res.status(500).json({ 
      error: 'Произошла ошибка при обновлении статистики' 
    })
  }
}

module.exports = {
  getContestShareStats,
  incrementShareCount
} 