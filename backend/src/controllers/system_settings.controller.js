/**
 * Контроллер для работы с системными настройками
 */

const systemSettingsService = require('../services/system_settings.service')
const { ValidationError } = require('../utils/errors')
const { logger } = require('../logging')

class SystemSettingsController {
  /**
   * Получить все активные настройки
   */
  async getAllActive(req, res, next) {
    try {
      const settings = await systemSettingsService.getAllActive()
      res.json({ success: true, data: settings })
    } catch (error) {
      logger.error('Error getting active settings:', error)
      next(error)
    }
  }

  /**
   * Получить настройки по категории
   */
  async getByCategory(req, res, next) {
    try {
      const { category } = req.params
      
      if (!category) {
        throw new ValidationError('Category is required')
      }

      const settings = await systemSettingsService.getByCategory(category)
      
      if (!settings) {
        return res.status(404).json({
          success: false,
          error: `Settings for category ${category} not found`
        })
      }

      res.json({ success: true, data: settings })
    } catch (error) {
      logger.error('Error getting settings by category:', error)
      next(error)
    }
  }

  /**
   * Создать или обновить настройки
   */
  async upsertSettings(req, res, next) {
    try {
      const { category } = req.params
      const { settings, description } = req.body
      const userId = req.user.id

      if (!category || !settings) {
        throw new ValidationError('Category and settings are required')
      }

      const result = await systemSettingsService.upsertSettings(
        category,
        settings,
        description,
        userId
      )

      res.json({ success: true, data: result })
    } catch (error) {
      logger.error('Error upserting settings:', error)
      next(error)
    }
  }

  /**
   * Деактивировать настройки
   */
  async deactivate(req, res, next) {
    try {
      const { category } = req.params
      const userId = req.user.id

      if (!category) {
        throw new ValidationError('Category is required')
      }

      const result = await systemSettingsService.deactivate(category, userId)
      res.json({ success: true, data: result })
    } catch (error) {
      logger.error('Error deactivating settings:', error)
      next(error)
    }
  }
}

module.exports = new SystemSettingsController() 