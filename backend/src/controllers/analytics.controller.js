/**
 * Контроллер для работы с аналитическими данными
 */

const analyticsService = require('../services/analytics.service')
const { ValidationError } = require('../utils/errors')
const logger = require('../logging')

class AnalyticsController {
  /**
   * Сохранить аналитические данные
   */
  async saveAnalytics(req, res, next) {
    try {
      const { date, category, metrics, dimensions, metadata } = req.body
      const userId = req.user.id

      if (!date || !category || !metrics || !dimensions) {
        throw new ValidationError('Required fields are missing')
      }

      const result = await analyticsService.saveAnalytics({
        date,
        category,
        metrics,
        dimensions,
        metadata,
        updated_by: userId
      })
      
      res.json({ success: true, data: result })
    } catch (error) {
      logger.error('Error saving analytics:', error)
      next(error)
    }
  }

  /**
   * Получить аналитику по категории за период
   */
  async getAnalyticsByCategory(req, res, next) {
    try {
      const { category } = req.params
      const { startDate, endDate } = req.query
      
      if (!category) {
        throw new ValidationError('Category is required')
      }

      const analytics = await analyticsService.getAnalyticsByCategory(
        category,
        startDate,
        endDate
      )
      
      res.json({ success: true, data: analytics })
    } catch (error) {
      logger.error('Error getting analytics by category:', error)
      next(error)
    }
  }

  /**
   * Получить последние аналитические данные
   */
  async getLatestAnalytics(req, res, next) {
    try {
      const { category } = req.params
      const { limit } = req.query
      
      if (!category) {
        throw new ValidationError('Category is required')
      }

      const analytics = await analyticsService.getLatestAnalytics(
        category,
        parseInt(limit) || 10
      )
      
      res.json({ success: true, data: analytics })
    } catch (error) {
      logger.error('Error getting latest analytics:', error)
      next(error)
    }
  }

  /**
   * Получить агрегированные метрики
   */
  async aggregateMetrics(req, res, next) {
    try {
      const { category } = req.params
      const { startDate, endDate, metrics } = req.query
      
      if (!category) {
        throw new ValidationError('Category is required')
      }

      const result = await analyticsService.aggregateMetrics(
        category,
        startDate,
        endDate,
        metrics
      )
      
      res.json({ success: true, data: result })
    } catch (error) {
      logger.error('Error aggregating metrics:', error)
      next(error)
    }
  }
}

module.exports = new AnalyticsController() 