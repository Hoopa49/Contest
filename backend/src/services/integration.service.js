const { Op } = require('sequelize')
const logger = require('../logging')
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
    try {
      // Определяем временной диапазон
      const now = new Date()
      let startDate = new Date()
      
      switch (timeRange) {
        case 'day':
          startDate.setDate(startDate.getDate() - 1)
          break
        case 'week':
          startDate.setDate(startDate.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1)
          break
        default:
          startDate.setDate(startDate.getDate() - 7) // По умолчанию неделя
      }

      // Получаем активность за период
      const activities = await this.serviceModels.activities.findAll({
        where: {
          created_at: {
            [Op.between]: [startDate, now]
          }
        },
        include: [{
          model: this.serviceModels.users,
          as: 'user',
          attributes: ['id', 'username', 'email']
        }],
        order: [['created_at', 'DESC']]
      })

      // Группируем активность по платформам
      const platformActivity = {}
      const userActions = new Set()

      for (const activity of activities) {
        try {
          // Проверяем наличие даты
          if (!activity.created_at) {
            logger.warn('Отсутствует дата в активности:', {
              platform: activity.platform,
              action_type: activity.action_type,
              id: activity.id
            })
            continue
          }

          // Преобразуем строку в объект Date, если это строка
          let activityDate = activity.created_at
          if (typeof activityDate === 'string') {
            try {
              activityDate = new Date(activityDate)
            } catch (error) {
              logger.warn('Ошибка преобразования даты:', {
                platform: activity.platform,
                action_type: activity.action_type,
                created_at: activity.created_at,
                error: error.message
              })
              continue
            }
          }

          // Проверяем валидность даты
          if (!(activityDate instanceof Date) || isNaN(activityDate.getTime())) {
            logger.warn('Неверный формат даты в активности:', {
              platform: activity.platform,
              action_type: activity.action_type,
              created_at: activity.created_at,
              id: activity.id
            })
            continue
          }

          // Проверяем, что дата не в будущем
          const currentDate = new Date()
          if (activityDate > currentDate) {
            logger.warn('Дата активности в будущем:', {
              platform: activity.platform,
              action_type: activity.action_type,
              created_at: activityDate.toISOString(),
              current_date: currentDate.toISOString(),
              id: activity.id
            })
            
            // Исправляем дату, если она в будущем
            activityDate = currentDate
            await activity.update({ created_at: currentDate })
          }

          const platform = activity.platform || 'unknown'
          if (!platformActivity[platform]) {
            platformActivity[platform] = {
              total: 0,
              actions: {},
              lastActivity: null
            }
          }

          // Увеличиваем счетчики
          platformActivity[platform].total++
          
          const actionType = activity.action_type || 'unknown'
          platformActivity[platform].actions[actionType] = (platformActivity[platform].actions[actionType] || 0) + 1

          // Обновляем время последней активности
          if (!platformActivity[platform].lastActivity || 
              activityDate > platformActivity[platform].lastActivity) {
            platformActivity[platform].lastActivity = activityDate
          }

          // Добавляем действие пользователя
          if (activity.user_id) {
            userActions.add(activity.user_id)
          }
        } catch (activityError) {
          logger.error('Ошибка обработки активности:', {
            error: activityError.message,
            activity: {
              id: activity.id,
              platform: activity.platform,
              action_type: activity.action_type
            }
          })
          continue
        }
      }

      const result = {
        byPlatform: Object.entries(platformActivity).map(([platform, data]) => ({
          platform,
          total: data.total,
          actions: data.actions,
          lastActivity: data.lastActivity ? data.lastActivity.toISOString() : null
        })),
        userCount: userActions.size,
        timeRange,
        period: {
          start: startDate.toISOString(),
          end: now.toISOString()
        }
      }

      logger.info('Данные активности сформированы:', {
        platforms: result.byPlatform.length,
        userCount: result.userCount
      })

      return result
    } catch (error) {
      logger.error('Ошибка при получении активности:', {
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