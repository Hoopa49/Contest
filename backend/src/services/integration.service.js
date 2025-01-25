const { Op } = require('sequelize')
const { logger } = require('../logging')
const models = require('../models')

class IntegrationService {
  constructor() {
    this.platforms = ['youtube', 'instagram', 'vk', 'telegram']
    
    // Проверяем наличие всех необходимых моделей
    const requiredModels = {
      stats: 'integration_stats',
      events: 'integration_events',
      activities: 'integration_activities',
      users: 'User'
    }

    this.models = {}
    
    for (const [key, modelName] of Object.entries(requiredModels)) {
      if (!models[modelName]) {
        logger.error('Модель не найдена:', { modelName })
        throw new Error(`Модель ${modelName} не найдена`)
      }
      this.models[key] = models[modelName]
    }

    logger.info('Сервис интеграций инициализирован:', {
      platforms: this.platforms,
      models: Object.keys(this.models)
    })

    this.initializeStats()
  }

  async initializeStats() {
    try {
      const results = []
      
      for (const platform of this.platforms) {
        const [stats, created] = await this.models.stats.findOrCreate({
          where: { platform },
          defaults: {
            enabled: false,
            last_sync: null,
            contests_found: 0,
            error_count: 0,
            requests_count: 0,
            successful_requests: 0,
            failed_requests: 0
          }
        })
        results.push({ platform, created })
      }

      logger.info('Статистика интеграций инициализирована:', {
        total: results.length,
        created: results.filter(r => r.created).length,
        platforms: results.map(r => r.platform)
      })
    } catch (error) {
      logger.error('Ошибка инициализации статистики:', { 
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  }

  async getStats(days = 7) {
    logger.info('Начало получения статистики интеграций:', { days })

    try {
      // Получаем статистику по всем платформам
      const stats = await this.models.stats.findAll()
      
      // Собираем статистику
      const result = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        platforms: {}
      }

      // Обрабатываем статистику по каждой платформе
      for (const stat of stats) {
        result.platforms[stat.platform] = {
          enabled: stat.enabled,
          lastSync: stat.last_sync,
          contestsFound: stat.contests_found,
          errorCount: stat.error_count,
          requests: stat.requests_count || 0,
          successfulRequests: stat.successful_requests || 0,
          failedRequests: stat.failed_requests || 0
        }

        // Обновляем общую статистику
        result.totalRequests += stat.requests_count || 0
        result.successfulRequests += stat.successful_requests || 0
        result.failedRequests += stat.failed_requests || 0
      }

      logger.info('Статистика интеграций получена:', {
        days,
        platforms: Object.keys(result.platforms).length,
        totalRequests: result.totalRequests,
        successfulRequests: result.successfulRequests,
        failedRequests: result.failedRequests
      })

      return result
    } catch (error) {
      logger.error('Ошибка получения статистики:', { 
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  }

  async getContestStats(userId, platform, days) {
    try {
      const contests = await this.contestService.getContestStats(userId, platform, days)
      return contests || []
    } catch (error) {
      return []
    }
  }

  async getErrorStats(userId, platform, days) {
    try {
      const errors = await this.errorService.getErrorStats(userId, platform, days)
      return errors || []
    } catch (error) {
      return []
    }
  }

  async getEvents() {
    logger.info('Начало получения событий интеграций')

    try {
      if (!this.models.events) {
        throw new Error('Модель IntegrationEvent не инициализирована')
      }

      const events = await this.models.events.findAll({
        where: {
          created_at: {
            [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        order: [['created_at', 'DESC']]
      })

      const groupedByPlatform = {}
      const groupedByType = {}

      for (const event of events) {
        // Группируем по платформам
        if (!groupedByPlatform[event.platform]) {
          groupedByPlatform[event.platform] = 0
        }
        groupedByPlatform[event.platform]++

        // Группируем по типам
        if (!groupedByType[event.type]) {
          groupedByType[event.type] = 0
        }
        groupedByType[event.type]++
      }

      logger.info('События интеграций получены:', {
        total: events.length,
        byPlatform: groupedByPlatform,
        byType: groupedByType,
        period: '7 дней'
      })

      return events
    } catch (error) {
      logger.error('Ошибка получения событий:', { 
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  }

  async getActivity(timeRange = 'week') {
    logger.info('Начало получения активности интеграций:', { timeRange })

    try {
      if (!this.models.activities) {
        throw new Error('Модель IntegrationActivity не инициализирована')
      }

      // Определяем временной диапазон
      const ranges = {
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000
      }

      const startDate = new Date(Date.now() - (ranges[timeRange] || ranges.week))

      // Получаем активность
      const activities = await this.models.activities.findAll({
        where: {
          created_at: {
            [Op.gte]: startDate
          }
        },
        include: [{
          model: this.models.users,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }],
        order: [['created_at', 'DESC']]
      })

      // Группируем по платформам
      const byPlatform = {}
      const userActions = {}

      for (const activity of activities) {
        // Считаем действия по платформам
        if (!byPlatform[activity.platform]) {
          byPlatform[activity.platform] = 0
        }
        byPlatform[activity.platform]++

        // Считаем действия пользователей
        if (!userActions[activity.user_id]) {
          userActions[activity.user_id] = {
            userId: activity.user_id,
            username: activity.user?.username,
            actions: 0
          }
        }
        userActions[activity.user_id].actions++
      }

      // Формируем топ пользователей
      const topUsers = Object.values(userActions)
        .sort((a, b) => b.actions - a.actions)
        .slice(0, 5)

      const result = {
        timeRange,
        totalActions: activities.length,
        byPlatform,
        topUsers
      }

      logger.info('Активность интеграций получена:', {
        timeRange,
        totalActions: activities.length,
        platforms: Object.keys(byPlatform).length,
        topUsersCount: topUsers.length
      })

      return result
    } catch (error) {
      logger.error('Ошибка получения активности:', { 
        error: error.message,
        stack: error.stack,
        timeRange
      })
      throw error
    }
  }

  async toggleIntegration(platform) {
    try {
      const integration = await this.models.stats.findOne({
        where: { platform }
      })

      if (!integration) {
        logger.warn('Интеграция не найдена:', { platform })
        throw new Error('Интеграция не найдена')
      }

      const oldStatus = integration.enabled
      integration.enabled = !integration.enabled
      await integration.save()

      logger.info('Статус интеграции изменен:', {
        platform,
        oldStatus,
        newStatus: integration.enabled
      })

      return {
        success: true,
        data: integration
      }
    } catch (error) {
      logger.error('Ошибка изменения статуса интеграции:', {
        platform,
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  }

  async runSearch(platform) {
    try {
      const integration = await this.models.stats.findOne({
        where: { platform }
      })

      if (!integration) {
        throw new Error('Integration not found')
      }

      // Здесь будет логика поиска
      integration.last_sync = new Date()
      await integration.save()

      return {
        success: true,
        data: {
          message: 'Поиск запущен'
        }
      }
    } catch (error) {
      logger.error('Error running search:', error)
      throw error
    }
  }
}

module.exports = new IntegrationService() 