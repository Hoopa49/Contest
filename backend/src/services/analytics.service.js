/**
 * Сервис для работы с аналитическими данными
 */

const BaseService = require('./base.service')
const { logger } = require('../logging')
const { ValidationError } = require('../utils/errors')
const { Op, Sequelize } = require('sequelize')

class AnalyticsService extends BaseService {
  constructor() {
    super('AnalyticsData')
  }

  async init(models) {
    await super.init(models)
    this.User = this.models.User
    logger.info('AnalyticsService initialized')
  }

  /**
   * Сохранить аналитические данные
   */
  async saveAnalytics(data, userId) {
    this.checkModel()

    if (!data) {
      throw new ValidationError('Data is required')
    }

    const analytics = await this.model.create({
      data,
      updated_by: userId
    })

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
          data: {
            total: parseInt(stat.get('total')),
            active: parseInt(stat.get('active')),
            date: stat.get('date')
          },
          created_at: stat.get('date')
        }))
      } catch (error) {
        logger.error('Error getting user analytics:', error)
        throw error
      }
    }

    // Стандартная обработка для других категорий
    const where = { category }

    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [
          new Date(startDate),
          new Date(endDate)
        ]
      }
    }

    return this.model.findAll({
      where,
      order: [['created_at', 'DESC']]
    })
  }

  /**
   * Получить последние аналитические данные
   */
  async getLatestAnalytics(category, limit = 10) {
    this.checkModel()

    return this.model.findAll({
      where: { category },
      order: [['created_at', 'DESC']],
      limit
    })
  }

  /**
   * Получить агрегированные метрики
   */
  async aggregateMetrics(category, startDate, endDate, metrics) {
    this.checkModel()

    const where = { category }

    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [
          new Date(startDate),
          new Date(endDate)
        ]
      }
    }

    const data = await this.model.findAll({
      where,
      order: [['created_at', 'ASC']]
    })

    // Если указаны конкретные метрики, фильтруем только их
    if (metrics) {
      const metricNames = metrics.split(',').map(m => m.trim())
      return data.map(item => {
        const filteredData = {}
        metricNames.forEach(metric => {
          if (item.data[metric] !== undefined) {
            filteredData[metric] = item.data[metric]
          }
        })
        return {
          ...item.toJSON(),
          data: filteredData
        }
      })
    }

    return data
  }
}

module.exports = new AnalyticsService() 