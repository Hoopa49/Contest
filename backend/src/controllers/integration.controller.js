const logger = require('../logging')
const integrationService = require('../services/integration.service')
const { initializeModels } = require('../models')

class IntegrationController {
  constructor() {
    // Привязываем методы к контексту
    this.getStats = this.getStats.bind(this)
    this.getEvents = this.getEvents.bind(this)
    this.getActivity = this.getActivity.bind(this)
    this.toggleIntegration = this.toggleIntegration.bind(this)
    this.runSearch = this.runSearch.bind(this)
    this.initialized = false
  }

  async init() {
    try {
      // Инициализируем модели
      const models = await initializeModels()
      
      // Инициализируем сервис с моделями
      integrationService.init(models)
      this.initialized = true
    } catch (error) {
      logger.error('Ошибка инициализации контроллера:', {
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  }

  async getStats(req, res) {
    try {
      const stats = await integrationService.getStats()
      res.json(stats)
    } catch (error) {
      logger.error('Error getting integration stats:', error)
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении статистики интеграций'
      })
    }
  }

  async getEvents(req, res) {
    try {
      const events = await integrationService.getEvents()
      res.json({
        success: true,
        data: events
      })
    } catch (error) {
      logger.error('Error getting integration events:', error)
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении событий интеграций'
      })
    }
  }

  async getActivity(req, res) {
    try {
      if (!this.initialized) {
        logger.error('Контроллер не инициализирован')
        return res.status(500).json({
          success: false,
          message: 'Сервис не инициализирован'
        })
      }

      const { timeRange } = req.query
      
      if (!timeRange) {
        logger.warn('Не указан временной диапазон')
        return res.status(400).json({
          success: false,
          message: 'Не указан временной диапазон'
        })
      }

      const activity = await integrationService.getActivity(timeRange)
      
      if (!activity) {
        logger.warn('Активность не найдена')
        return res.json({
          success: true,
          data: {
            byPlatform: [],
            userCount: 0,
            timeRange,
            period: {
              start: new Date().toISOString(),
              end: new Date().toISOString()
            }
          }
        })
      }
      
      logger.info('Получены данные активности:', {
        timeRange,
        platforms: activity.byPlatform?.length || 0,
        userCount: activity.userCount || 0,
        period: activity.period
      })

      return res.json({
        success: true,
        data: activity
      })

    } catch (error) {
      logger.error('Error getting integration activity:', error)
      return res.status(500).json({
        success: false,
        message: 'Ошибка при получении активности интеграций'
      })
    }
  }

  async toggleIntegration(req, res) {
    try {
      const { platform } = req.params
      const result = await integrationService.toggleIntegration(platform)
      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      logger.error('Error toggling integration:', error)
      res.status(500).json({
        success: false,
        message: 'Ошибка при переключении интеграции'
      })
    }
  }

  async runSearch(req, res) {
    try {
      const { platform } = req.params
      const result = await integrationService.runSearch(platform)
      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      logger.error('Error running integration search:', error)
      res.status(500).json({
        success: false,
        message: 'Ошибка при запуске поиска'
      })
    }
  }
}

const controller = new IntegrationController()
controller.init().catch(error => {
  logger.error('Failed to initialize integration controller:', error)
  process.exit(1)
})

module.exports = controller 