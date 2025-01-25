const { logger } = require('../logging')
const integrationService = require('../services/integration.service')

class IntegrationController {
  constructor() {
    // Привязываем методы к контексту
    this.getStats = this.getStats.bind(this)
    this.getEvents = this.getEvents.bind(this)
    this.getActivity = this.getActivity.bind(this)
    this.toggleIntegration = this.toggleIntegration.bind(this)
    this.runSearch = this.runSearch.bind(this)
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
      const { timeRange } = req.query
      const activity = await integrationService.getActivity(timeRange)
      res.json({
        success: true,
        data: activity
      })
    } catch (error) {
      logger.error('Error getting integration activity:', error)
      res.status(500).json({
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

module.exports = new IntegrationController() 