const { Op } = require('sequelize')
const { logger } = require('../logging')
const BaseService = require('./base.service')

class IntegrationService extends BaseService {
  constructor() {
    super('IntegrationActivity')
    this.platforms = ['youtube', 'instagram', 'vk', 'telegram']
    this.initialized = false
  }

  init(models) {
    try {
      // Проверяем наличие всех необходимых моделей
      const requiredModels = {
        stats: 'IntegrationStats',
        events: 'IntegrationEvent',
        activities: 'IntegrationActivity',
        users: 'User'
      }

      this.serviceModels = {}
      
      for (const [key, modelName] of Object.entries(requiredModels)) {
        if (!models[modelName]) {
          logger.error('Модель не найдена:', { modelName })
          throw new Error(`Модель ${modelName} не найдена`)
        }
        this.serviceModels[key] = models[modelName]
      }

      super.init(models)
      logger.info('Сервис интеграций инициализирован:', {
        platforms: this.platforms,
        models: Object.keys(models)
      })

      this.initialized = true
      this.initializeStats()
    } catch (error) {
      logger.error('Ошибка инициализации сервиса:', {
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  }

  async initializeStats() {
    if (!this.initialized) {
      logger.warn('Попытка инициализации статистики без инициализации сервиса')
      return
    }

    try {
      const results = []
      
      for (const platform of this.platforms) {
        const [stats, created] = await this.serviceModels.stats.findOrCreate({
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
      const stats = await this.serviceModels.stats.findAll()
      
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
      if (!this.serviceModels.events) {
        throw new Error('Модель IntegrationEvent не инициализирована')
      }

      const events = await this.serviceModels.events.findAll({
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
      // Проверяем инициализацию моделей
      if (!this.serviceModels) {
        logger.error('Модели не инициализированы')
        return {
          byPlatform: {},
          userActions: {}
        }
      }

      // Проверяем наличие конкретных моделей
      const IntegrationActivity = this.serviceModels.activities
      const User = this.serviceModels.users

      if (!IntegrationActivity || !User) {
        logger.error('Модели не найдены:', {
          hasActivity: !!IntegrationActivity,
          hasUser: !!User,
          availableModels: Object.keys(this.serviceModels)
        })
        return {
          byPlatform: {},
          userActions: {}
        }
      }

      // Определяем временной диапазон
      const ranges = {
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000
      }

      const startDate = new Date(Date.now() - (ranges[timeRange] || ranges.week))

      // Получаем активность
      const activities = await IntegrationActivity.findAll({
        where: {
          created_at: {
            [Op.gte]: startDate
          }
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }],
        order: [['created_at', 'DESC']]
      })

      logger.info('Получены записи активности:', { count: activities.length })

      if (!activities || activities.length === 0) {
        logger.info('Активность не найдена')
        return {
          byPlatform: {},
          userActions: {}
        }
      }

      // Группируем по платформам
      const byPlatform = {}
      const userActions = {}

      // Обрабатываем каждую активность
      activities.forEach(activity => {
        const { platform, action_type, created_at, user } = activity.get({ plain: true })
        const timestamp = new Date(created_at).toISOString()

        // Группируем по платформам
        if (!byPlatform[platform]) {
          byPlatform[platform] = {
            actions: []
          }
        }

        // Находим или создаем запись для текущей даты
        const existingAction = byPlatform[platform].actions.find(
          a => new Date(a.timestamp).toDateString() === new Date(timestamp).toDateString()
        )

        if (existingAction) {
          existingAction.count++
        } else {
          byPlatform[platform].actions.push({
            timestamp,
            count: 1
          })
        }

        // Группируем действия пользователей
        if (user) {
          const userId = user.id
          if (!userActions[userId]) {
            userActions[userId] = {
              user: {
                id: user.id,
                username: user.username,
                email: user.email
              },
              actions: []
            }
          }

          userActions[userId].actions.push({
            platform,
            action_type,
            timestamp
          })
        }
      })

      // Сортируем действия по времени для каждой платформы
      Object.values(byPlatform).forEach(platform => {
        platform.actions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      })

      logger.info('Данные активности сформированы:', { 
        platforms: Object.keys(byPlatform),
        userCount: Object.keys(userActions).length
      })

      return {
        byPlatform,
        userActions
      }
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
      const integration = await this.serviceModels.stats.findOne({
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
      const integration = await this.serviceModels.stats.findOne({
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