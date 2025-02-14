/**
 * Контроллер для работы с системными настройками
 */

const systemSettingsService = require('../services/system_settings.service')
const { ValidationError } = require('../utils/errors')
const logger = require('../logging')

class SystemSettingsController {
  /**
   * Получить все активные настройки
   */
  async getAllActive(req, res, next) {
    try {
      const settings = await systemSettingsService.getAllActive()
      
      // Преобразуем массив настроек в объект по категориям
      const formattedSettings = settings.reduce((acc, setting) => {
        if (setting.settings && typeof setting.settings === 'object') {
          // Очищаем данные от new/old объектов
          const cleanSettings = {}
          
          const cleanValue = (value) => {
            if (!value || typeof value !== 'object') {
              return value
            }
            
            // Если есть new/old на верхнем уровне
            if ('new' in value || 'old' in value) {
              return value.new || value.old
            }
            
            // Для вложенных объектов
            const cleaned = {}
            Object.entries(value).forEach(([k, v]) => {
              if (v && typeof v === 'object' && ('new' in v || 'old' in v)) {
                cleaned[k] = v.new || v.old
              } else {
                cleaned[k] = cleanValue(v)
              }
            })
            return cleaned
          }
          
          Object.entries(setting.settings).forEach(([key, value]) => {
            cleanSettings[key] = cleanValue(value)
          })
          
          acc[setting.category] = cleanSettings
        }
        return acc
      }, {})

      res.json({ 
        success: true, 
        data: formattedSettings 
      })
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

      res.json({ 
        success: true, 
        data: settings.settings 
      })
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
      const { settings, description, changes } = req.body
      const userId = req.user.id

      if (!category || !settings) {
        throw new ValidationError('Category and settings are required')
      }

      console.log('Получен запрос на обновление настроек:', {
        category,
        settings,
        description,
        changes
      })

      const result = await systemSettingsService.upsertSettings(
        category,
        settings,
        description,
        userId,
        changes
      )

      console.log('Результат обновления настроек:', result)

      res.json({ 
        success: true, 
        data: result.settings 
      })
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
      res.json({ 
        success: true, 
        data: result.settings 
      })
    } catch (error) {
      logger.error('Error deactivating settings:', error)
      next(error)
    }
  }

  /**
   * Получить историю изменений настроек
   */
  async getHistory(req, res, next) {
    try {
      const history = await systemSettingsService.getHistory()
      
      // Форматируем данные перед отправкой
      const formattedHistory = history.map(record => ({
        id: record.id,
        category: record.category,
        changes: record.changes || {},
        created_at: record.created_at,
        updatedBy: record.updatedBy ? {
          id: record.updatedBy.id,
          email: record.updatedBy.email,
          firstName: record.updatedBy.first_name,
          lastName: record.updatedBy.last_name
        } : {
          id: 'system',
          email: 'system@example.com',
          firstName: 'Система',
          lastName: ''
        }
      }))
      
      res.json({ 
        success: true, 
        data: formattedHistory 
      })
    } catch (error) {
      logger.error('Error getting settings history:', error)
      next(error)
    }
  }

  /**
   * Откатить настройки к предыдущей версии
   */
  async rollback(req, res, next) {
    try {
      const { historyId } = req.params
      const userId = req.user.id

      if (!historyId) {
        throw new ValidationError('History ID is required')
      }

      const settings = await systemSettingsService.rollbackToVersion(historyId, userId)
      
      res.json({ 
        success: true, 
        data: settings 
      })
    } catch (error) {
      logger.error('Error rolling back settings:', error)
      next(error)
    }
  }
}

module.exports = new SystemSettingsController() 