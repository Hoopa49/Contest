/**
 * Сервис для работы с аналитическими данными
 */

const { Op, Sequelize } = require('sequelize')
const logger = require('../logging')
const BaseService = require('./base.service')
const { ValidationError } = require('../utils/errors')
const { AnalyticsData } = require('../models')

class AnalyticsService extends BaseService {
  constructor() {
    super('AnalyticsData')
  }

  async init(models) {
    try {
      logger.info('Начало инициализации AnalyticsService')
      
      await super.init(models)
      
      // Проверяем наличие необходимых моделей
      const requiredModels = ['User', 'Contest', 'IntegrationActivity']
      const missingModels = requiredModels.filter(model => !models[model])
      
      if (missingModels.length > 0) {
        logger.error('Отсутствуют необходимые модели:', { missingModels })
        throw new Error(`Отсутствуют модели: ${missingModels.join(', ')}`)
      }

      this.User = this.models.User
      this.Contest = this.models.Contest
      this.IntegrationActivities = this.models.IntegrationActivity

      logger.info('AnalyticsService успешно инициализирован', {
        models: {
          User: !!this.User,
          Contest: !!this.Contest,
          IntegrationActivities: !!this.IntegrationActivities
        }
      })
    } catch (error) {
      logger.error('Ошибка при инициализации AnalyticsService:', {
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  }

  /**
   * Сохранить аналитические данные
   */
  async saveAnalytics(data) {
    this.checkModel()

    if (!data) {
      throw new ValidationError('Data is required')
    }

    const analytics = await this.model.create(data)
    return analytics
  }

  /**
   * Получить аналитику по категории за период
   */
  async getAnalyticsByCategory(category, startDate, endDate) {
    this.checkModel()

    // Специальная обработка для категории users
    if (category === 'users') {
      try {
        const userStats = await this.User.findAll({
          attributes: [
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
            [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN is_active = true THEN 1 ELSE 0 END")), 'active'],
            [Sequelize.fn('date_trunc', 'day', Sequelize.col('created_at')), 'date']
          ],
          where: startDate && endDate ? {
            created_at: {
              [Op.between]: [new Date(startDate), new Date(endDate)]
            }
          } : {},
          group: [Sequelize.fn('date_trunc', 'day', Sequelize.col('created_at'))],
          order: [[Sequelize.fn('date_trunc', 'day', Sequelize.col('created_at')), 'DESC']]
        })

        return userStats.map(stat => ({
          category: 'users',
          date: stat.get('date'),
          metrics: {
            total: parseInt(stat.get('total')),
            active: parseInt(stat.get('active'))
          },
          dimensions: {},
          metadata: {
            source: 'users_table'
          }
        }))
      } catch (error) {
        logger.error('Error getting user analytics:', error)
        throw error
      }
    }

    // Специальная обработка для категории contests
    if (category === 'contests') {
      try {
        const contestStats = await this.Contest.findAll({
          attributes: [
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
            [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN contest_status = 'active' THEN 1 ELSE 0 END")), 'active'],
            [Sequelize.fn('date_trunc', 'day', Sequelize.col('created_at')), 'date']
          ],
          where: startDate && endDate ? {
            created_at: {
              [Op.between]: [new Date(startDate), new Date(endDate)]
            }
          } : {},
          group: [Sequelize.fn('date_trunc', 'day', Sequelize.col('created_at'))],
          order: [[Sequelize.fn('date_trunc', 'day', Sequelize.col('created_at')), 'DESC']]
        })

        return contestStats.map(stat => ({
          category: 'contests',
          date: stat.get('date'),
          metrics: {
            total: parseInt(stat.get('total')),
            active: parseInt(stat.get('active'))
          },
          dimensions: {},
          metadata: {
            source: 'contests_table'
          }
        }))
      } catch (error) {
        logger.error('Error getting contest analytics:', error)
        throw error
      }
    }

    // Специальная обработка для категории conversion
    if (category === 'conversion') {
      try {
        // Получаем статистику по пользователям
        const userStats = await this.User.findAll({
          attributes: [
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'total_users'],
            [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN is_active = true THEN 1 ELSE 0 END")), 'active_users'],
            [Sequelize.fn('date_trunc', 'day', Sequelize.col('created_at')), 'date']
          ],
          where: startDate && endDate ? {
            created_at: {
              [Op.between]: [new Date(startDate), new Date(endDate)]
            }
          } : {},
          group: [Sequelize.fn('date_trunc', 'day', Sequelize.col('created_at'))],
          order: [[Sequelize.fn('date_trunc', 'day', Sequelize.col('created_at')), 'DESC']]
        })

        // Получаем статистику по конкурсам
        const contestStats = await this.Contest.findAll({
          attributes: [
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'total_contests'],
            [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN contest_status = 'active' THEN 1 ELSE 0 END")), 'active_contests'],
            [Sequelize.fn('date_trunc', 'day', Sequelize.col('created_at')), 'date']
          ],
          where: startDate && endDate ? {
            created_at: {
              [Op.between]: [new Date(startDate), new Date(endDate)]
            }
          } : {},
          group: [Sequelize.fn('date_trunc', 'day', Sequelize.col('created_at'))],
          order: [[Sequelize.fn('date_trunc', 'day', Sequelize.col('created_at')), 'DESC']]
        })

        // Объединяем статистику и вычисляем конверсию
        const dates = new Set([
          ...userStats.map(stat => stat.get('date').toISOString()),
          ...contestStats.map(stat => stat.get('date').toISOString())
        ])

        return Array.from(dates).map(date => {
          const userStat = userStats.find(stat => stat.get('date').toISOString() === date) || { get: () => 0 }
          const contestStat = contestStats.find(stat => stat.get('date').toISOString() === date) || { get: () => 0 }

          const totalUsers = parseInt(userStat.get('total_users'))
          const activeUsers = parseInt(userStat.get('active_users'))
          const totalContests = parseInt(contestStat.get('total_contests'))
          const activeContests = parseInt(contestStat.get('active_contests'))

          // Вычисляем различные показатели конверсии
          const userConversion = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
          const contestConversion = totalContests > 0 ? (activeContests / totalContests) * 100 : 0
          const participationRate = totalUsers > 0 && totalContests > 0 ? 
            (activeUsers / totalUsers) * (activeContests / totalContests) * 100 : 0

          return {
            category: 'conversion',
            date: new Date(date),
            metrics: {
              user_conversion: Math.round(userConversion * 100) / 100,
              contest_conversion: Math.round(contestConversion * 100) / 100,
              participation_rate: Math.round(participationRate * 100) / 100,
              total_users: totalUsers,
              active_users: activeUsers,
              total_contests: totalContests,
              active_contests: activeContests
            },
            dimensions: {},
            metadata: {
              source: 'combined_stats'
            }
          }
        }).sort((a, b) => b.date - a.date)
      } catch (error) {
        logger.error('Error getting conversion analytics:', error)
        throw error
      }
    }

    // Специальная обработка для категории activity
    if (category === 'activity') {
      try {
        // Получаем статистику активности из таблицы analytics_data
        const where = {
          category: 'activity'
        }

        if (startDate && endDate) {
          where.date = {
            [Op.between]: [
              new Date(startDate),
              new Date(endDate)
            ]
          }
        }

        const activityStats = await this.model.findAll({
          where,
          order: [['date', 'DESC']]
        })

        // Если данных нет, возвращаем пустой массив с одной записью
        if (!activityStats.length) {
          return [{
            category: 'activity',
            date: new Date(),
            metrics: {
              total: 0,
              views: 0,
              likes: 0,
              comments: 0,
              shares: 0
            },
            dimensions: {},
            metadata: {
              source: 'analytics_data_table'
            }
          }]
        }

        return activityStats.map(stat => ({
          category: 'activity',
          date: stat.date,
          metrics: {
            total: parseInt(stat.metrics.total || 0),
            views: parseInt(stat.metrics.views || 0),
            likes: parseInt(stat.metrics.likes || 0),
            comments: parseInt(stat.metrics.comments || 0),
            shares: parseInt(stat.metrics.shares || 0)
          },
          dimensions: stat.dimensions || {},
          metadata: {
            source: 'analytics_data_table'
          }
        }))
      } catch (error) {
        logger.error('Error getting activity analytics:', error)
        throw error
      }
    }

    // Стандартная обработка для других категорий
    const where = { category }

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [
          new Date(startDate),
          new Date(endDate)
        ]
      }
    }

    return this.model.findAll({
      where,
      order: [['date', 'DESC']]
    })
  }

  /**
   * Получить последние аналитические данные
   */
  async getLatestAnalytics(category, limit = 10) {
    this.checkModel()

    return this.model.findAll({
      where: { category },
      order: [['date', 'DESC']],
      limit
    })
  }

  /**
   * Получить агрегированные метрики
   */
  async aggregateMetrics(category, startDate, endDate, metricNames) {
    this.checkModel()

    const where = { category }

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [
          new Date(startDate),
          new Date(endDate)
        ]
      }
    }

    const data = await this.model.findAll({
      where,
      order: [['date', 'ASC']]
    })

    // Если указаны конкретные метрики, фильтруем только их
    if (metricNames) {
      const metrics = metricNames.split(',').map(m => m.trim())
      return data.map(item => {
        const filteredMetrics = {}
        metrics.forEach(metric => {
          if (item.metrics[metric] !== undefined) {
            filteredMetrics[metric] = item.metrics[metric]
          }
        })
        return {
          ...item.toJSON(),
          metrics: filteredMetrics
        }
      })
    }

    return data
  }

  async getAnalytics(category, startDate, endDate) {
    try {
      const where = {
        category,
        date: {
          [Op.between]: [startDate, endDate]
        }
      }

      const data = await AnalyticsData.findAll({
        where,
        order: [['date', 'ASC']],
        raw: true
      })

      if (!data || data.length === 0) {
        return {
          data: [{
            date: startDate,
            metrics: {
              total: 0,
              active: 0,
              new: 0
            }
          }]
        }
      }

      return {
        data: data.map(item => ({
          date: item.date,
          metrics: item.metrics,
          dimensions: item.dimensions
        }))
      }

    } catch (error) {
      logger.error('Error in getAnalytics:', error)
      throw error
    }
  }

  /**
   * Получить данные активности пользователей для графика
   */
  async getUserActivity(period, chartType) {
    this.checkModel()

    const now = new Date()
    let startDate = new Date()
    
    // Определяем период
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default:
        startDate.setMonth(startDate.getMonth() - 1) // По умолчанию месяц
    }

    // Маппинг типов графиков на единицы измерения PostgreSQL
    const chartTypeMap = {
      daily: 'day',
      weekly: 'week',
      monthly: 'month'
    }

    const dbChartType = chartTypeMap[chartType] || 'day'

    // Получаем данные из разных источников
    const [userStats, activityStats] = await Promise.all([
      this.User.findAll({
        attributes: [
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'total_users'],
          [Sequelize.fn('SUM', Sequelize.literal("CASE WHEN is_active = true THEN 1 ELSE 0 END")), 'active_users'],
          [Sequelize.fn('date_trunc', dbChartType, Sequelize.col('created_at')), 'date']
        ],
        where: {
          created_at: {
            [Op.between]: [startDate, now]
          }
        },
        group: [Sequelize.fn('date_trunc', dbChartType, Sequelize.col('created_at'))],
        order: [[Sequelize.fn('date_trunc', dbChartType, Sequelize.col('created_at')), 'ASC']]
      }),
      this.model.findAll({
        where: {
          category: 'activity',
          date: {
            [Op.between]: [startDate, now]
          }
        },
        order: [['date', 'ASC']]
      })
    ])

    // Форматируем данные для графика
    const dates = userStats.map(stat => stat.get('date').toISOString().split('T')[0])
    const activeUsers = userStats.map(stat => parseInt(stat.get('active_users')))
    const newRegistrations = userStats.map(stat => parseInt(stat.get('total_users')))
    const conversion = userStats.map((stat, index) => {
      const total = parseInt(stat.get('total_users'))
      const active = parseInt(stat.get('active_users'))
      return total > 0 ? Math.round((active / total) * 100) : 0
    })

    return {
      dates,
      activeUsers,
      newRegistrations,
      conversion
    }
  }

  /**
   * Получить распределение по платформам
   */
  async getPlatformDistribution() {
    this.checkModel()

    try {
      logger.info('Начало получения распределения платформ')
      
      // Проверяем инициализацию модели
      if (!this.IntegrationActivities) {
        logger.error('Модель IntegrationActivities не инициализирована')
        return []
      }

      // Получаем статистику по интеграциям
      const stats = await this.IntegrationActivities.findAll({
        attributes: [
          'platform',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        where: {
          created_at: {
            [Sequelize.Op.gte]: Sequelize.literal('NOW() - INTERVAL \'30 days\'')
          },
          status: 'success' // Учитываем только успешные действия
        },
        group: ['platform'],
        order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']]
      })

      logger.info('Получены данные распределения платформ:', {
        count: stats.length,
        platforms: stats.map(s => s.get('platform'))
      })

      // Форматируем данные для графика
      const result = stats.map(stat => ({
        name: stat.get('platform'),
        value: parseInt(stat.get('count'))
      }))

      logger.info('Форматированные данные:', { result })

      return result
    } catch (error) {
      logger.error('Ошибка при получении распределения платформ:', {
        error: error.message,
        stack: error.stack
      })
      return [] // Возвращаем пустой массив в случае ошибки
    }
  }

  /**
   * Получить прогнозы роста
   */
  async getForecasts(period) {
    this.checkModel()

    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3)
        break
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      default:
        startDate.setMonth(startDate.getMonth() - 1)
    }

    // Получаем статистику роста
    const [userGrowth, contestGrowth, conversionChange, activityGrowth] = await Promise.all([
      this.calculateGrowth('users', startDate, now),
      this.calculateGrowth('contests', startDate, now),
      this.calculateGrowth('conversion', startDate, now),
      this.calculateGrowth('activity', startDate, now)
    ])

    return [
      { title: 'Рост пользователей (30 дней)', trend: userGrowth },
      { title: 'Рост конкурсов (30 дней)', trend: contestGrowth },
      { title: 'Изменение конверсии', trend: conversionChange },
      { title: 'Рост активности', trend: activityGrowth }
    ]
  }

  /**
   * Получить рекомендации
   */
  async getRecommendations() {
    this.checkModel()

    // Получаем последние метрики
    const [userStats, conversionStats, activityStats] = await Promise.all([
      this.getAnalyticsByCategory('users', null, null),
      this.getAnalyticsByCategory('conversion', null, null),
      this.getAnalyticsByCategory('activity', null, null)
    ])

    const recommendations = []

    // Анализируем конверсию
    if (conversionStats.length > 0) {
      const latestConversion = conversionStats[0].metrics.user_conversion
      if (latestConversion < 50) {
        recommendations.push({
          title: 'Оптимизация конверсии',
          description: `Наблюдается низкая конверсия (${latestConversion}%). Рекомендуется проанализировать воронку участия.`,
          priority: 'error'
        })
      }
    }

    // Анализируем рост пользователей
    if (userStats.length > 1) {
      const growth = ((userStats[0].metrics.total - userStats[1].metrics.total) / userStats[1].metrics.total) * 100
      if (growth > 10) {
        recommendations.push({
          title: 'Потенциал роста',
          description: `Высокий рост пользователей (+${Math.round(growth)}%) указывает на возможность масштабирования.`,
          priority: 'success'
        })
      }
    }

    // Анализируем активность
    if (activityStats.length > 0) {
      const latestActivity = activityStats[0].metrics.total
      if (latestActivity > 1000) {
        recommendations.push({
          title: 'Активность пользователей',
          description: 'Высокий уровень активности - хороший показатель вовлеченности.',
          priority: 'info'
        })
      }
    }

    return recommendations
  }

  /**
   * Вспомогательный метод для расчета роста
   */
  async calculateGrowth(category, startDate, endDate) {
    const stats = await this.getAnalyticsByCategory(category, startDate, endDate)
    
    if (stats.length < 2) {
      return 0
    }

    const latest = stats[0].metrics.total || 0
    const previous = stats[stats.length - 1].metrics.total || 1 // Избегаем деления на 0

    return Math.round(((latest - previous) / previous) * 100)
  }
}

module.exports = new AnalyticsService() 