/**
 * Сервис для работы с аналитическими данными
 */

const BaseService = require('./base.service')
const logger = require('../logging')
const { ValidationError } = require('../utils/errors')
const { Op, Sequelize } = require('sequelize')
const { AnalyticsData } = require('../models')

class AnalyticsService extends BaseService {
  constructor() {
    super('AnalyticsData')
  }

  async init(models) {
    await super.init(models)
    this.User = this.models.User
    this.Contest = this.models.Contest
    this.IntegrationActivities = this.models.IntegrationActivities
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
}

module.exports = new AnalyticsService() 