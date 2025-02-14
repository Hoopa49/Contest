/**
 * Сервис для работы с системными настройками
 */

const BaseService = require('./base.service')
const logger = require('../logging')
const { ValidationError } = require('../utils/errors')
const bcrypt = require('bcryptjs')

class SystemSettingsService extends BaseService {
  constructor() {
    super('SystemSettings')
  }

  async init(models) {
    await super.init(models)
    this.historyModel = models.SystemSettingsHistory
    this.userModel = models.User
    await this.initializeDefaultSettings()
  }

  /**
   * Инициализация настроек по умолчанию
   */
  async initializeDefaultSettings() {
    try {
      const settings = await this.model.findOne({ where: { category: 'system' } })
      if (!settings) {
        // Создаем или получаем системного пользователя
        const [systemUser] = await this.userModel.findOrCreate({
          where: {
            id: '00000000-0000-0000-0000-000000000000'
          },
          defaults: {
            email: 'system@example.com',
            username: 'system',
            auth_provider: 'local',
            role: 'admin',
            first_name: 'System',
            last_name: 'User',
            password_hash: await bcrypt.hash('system', 10)
          }
        });

        await this.upsertSettings(
          'system',
          {
            app: {
              name: 'Contest Aggregator',
              description: 'Агрегатор конкурсов из разных платформ',
              version: '1.0.0',
              maintenance_mode: false
            },
            email: {
              smtp_host: process.env.SMTP_HOST || '',
              smtp_port: parseInt(process.env.SMTP_PORT) || 587,
              smtp_secure: process.env.SMTP_SECURE === 'true',
              smtp_user: process.env.SMTP_USER || '',
              smtp_pass: process.env.SMTP_PASS || '',
              from_email: process.env.FROM_EMAIL || 'noreply@example.com',
              from_name: process.env.FROM_NAME || 'Contest Aggregator'
            },
            notifications: {
              enabled: true,
              channels: {
                email: true,
                push: true,
                telegram: false
              }
            },
            security: {
              max_login_attempts: 5,
              lockout_duration: 15, // minutes
              password_expiry: 90, // days
              session_timeout: 30, // minutes
              require_2fa: false
            },
            integrations: {
              youtube: {
                enabled: true,
                api_key: process.env.YOUTUBE_API_KEY || null,
                quota_limit: 10000,
                search_interval: 30
              },
              telegram: {
                enabled: false,
                bot_token: process.env.TELEGRAM_BOT_TOKEN || '',
                webhook_url: process.env.TELEGRAM_WEBHOOK_URL || ''
              },
              vk: {
                enabled: false,
                access_token: process.env.VK_ACCESS_TOKEN || '',
                group_id: process.env.VK_GROUP_ID || ''
              }
            }
          },
          'Initial system settings',
          systemUser.id
        );
        logger.info('Default settings initialized')
      }
    } catch (error) {
      logger.error('Error initializing default settings:', error)
      throw error
    }
  }

  /**
   * Получение всех настроек
   */
  async getSettings() {
    const settings = await this.model.findOne({ where: { category: 'system' } })
    if (!settings) {
      throw new ValidationError('Settings not found')
    }
    return settings.settings
  }

  /**
   * Обновление настроек
   * @param {Object} data - Новые настройки
   * @param {string} userId - ID пользователя, выполняющего обновление
   */
  async updateSettings(data, userId) {
    try {
      const settings = await this.model.findOne({ where: { category: 'system' } })
      if (!settings) {
        throw new ValidationError('Settings not found')
      }

      // Обновляем только разрешенные поля
      const allowedFields = ['app', 'email', 'notifications', 'security', 'integrations']
      const updateData = { ...settings.settings }

      allowedFields.forEach(field => {
        if (data[field]) {
          updateData[field] = {
            ...settings.settings[field],
            ...data[field]
          }
        }
      })

      await this.upsertSettings(
        'system',
        updateData,
        'Settings updated via updateSettings',
        userId
      )

      return updateData
    } catch (error) {
      logger.error('Error updating settings:', error)
      throw error
    }
  }

  /**
   * Получение настроек по подкатегории
   * @param {string} category - Подкатегория настроек (app, email, etc.)
   */
  async getSettingsByCategory(category) {
    const settings = await this.getSettings()
    if (!settings[category]) {
      throw new ValidationError(`Category ${category} not found`)
    }
    return settings[category]
  }

  /**
   * Обновление настроек по подкатегории
   * @param {string} category - Подкатегория настроек (app, email, etc.)
   * @param {Object} data - Новые настройки
   * @param {string} userId - ID пользователя, выполняющего обновление
   */
  async updateSettingsByCategory(category, data, userId) {
    try {
      const settings = await this.model.findOne({ where: { category: 'system' } })
      if (!settings) {
        throw new ValidationError('Settings not found')
      }

      const currentSettings = settings.settings
      if (!currentSettings[category]) {
        throw new ValidationError(`Category ${category} not found`)
      }

      const updateData = {
        ...currentSettings,
        [category]: {
          ...currentSettings[category],
          ...data
        }
      }

      await this.upsertSettings(
        'system',
        updateData,
        `Settings updated for category ${category}`,
        userId
      )

      return updateData[category]
    } catch (error) {
      logger.error(`Error updating settings category ${category}:`, error)
      throw error
    }
  }

  /**
   * Получить настройки по категории
   */
  async getByCategory(category) {
    this.checkModel()
    
    const settings = await this.model.findOne({
      where: { 
        category,
        is_active: true
      }
    })
    
    return settings
  }

  /**
   * Получить историю изменений
   */
  async getHistory() {
    try {
      const history = await this.historyModel.findAll({
        order: [['created_at', 'DESC']],
        include: [{
          model: this.models.User,
          as: 'updatedBy',
          attributes: ['id', 'email', 'first_name', 'last_name']
        }]
      })

      return history.map(record => {
        const createdAt = record.created_at || record.createdAt
        return {
          id: record.id,
          category: record.category,
          changes: record.changes || {},
          created_at: createdAt ? createdAt.toISOString() : new Date().toISOString(),
          updatedBy: record.updatedBy ? {
            id: record.updatedBy.id,
            email: record.updatedBy.email,
            first_name: record.updatedBy.first_name,
            last_name: record.updatedBy.last_name
          } : null
        }
      })
    } catch (error) {
      logger.error('Error getting settings history:', error)
      throw error
    }
  }

  /**
   * Создать запись в истории
   */
  async createHistoryRecord(settingsId, category, oldSettings, newSettings, description, userId) {
    this.checkModel()

    // Вычисляем изменения
    const changes = {}
    
    // Если переданы готовые изменения, используем их напрямую
    if (newSettings.changes && Object.keys(newSettings.changes).length > 0) {
      Object.assign(changes, newSettings.changes)
    } else {
      // Иначе вычисляем изменения
      for (const [key, value] of Object.entries(newSettings)) {
        if (JSON.stringify(oldSettings[key]) !== JSON.stringify(value)) {
          changes[key] = {
            old: oldSettings[key],
            new: value
          }
        }
      }

      // Проверяем удаленные ключи
      for (const key of Object.keys(oldSettings)) {
        if (!(key in newSettings)) {
          changes[key] = {
            old: oldSettings[key],
            type: 'removed'
          }
        }
      }
    }

    // Проверяем, есть ли реальные изменения
    if (Object.keys(changes).length === 0) {
      logger.info('No changes detected, skipping history record')
      return null
    }

    logger.info('Creating history record with changes:', changes)

    return this.historyModel.create({
      settings_id: settingsId,
      category,
      settings: newSettings,
      changes,
      description,
      updated_by: userId
    })
  }

  /**
   * Откатить к предыдущей версии
   */
  async rollbackToVersion(historyId, userId) {
    this.checkModel()

    const historyRecord = await this.historyModel.findByPk(historyId)
    if (!historyRecord) {
      throw new ValidationError('History record not found')
    }

    const settings = await this.model.findOne({
      where: { category: historyRecord.category }
    })

    if (!settings) {
      throw new ValidationError('Settings not found')
    }

    // Обновляем настройки
    await settings.update({
      settings: historyRecord.settings,
      updated_by: userId
    })

    // Создаем запись в истории о откате
    await this.createHistoryRecord(
      settings.id,
      settings.category,
      settings.settings,
      historyRecord.settings,
      'Откат к предыдущей версии',
      userId
    )

    return settings
  }

  /**
   * Обновить или создать настройки с записью в историю
   */
  async upsertSettings(category, settings, description, userId, changes = null) {
    this.checkModel()

    if (!category || !settings) {
      throw new ValidationError('Category and settings are required')
    }

    logger.info('Upserting settings:', {
      category,
      settings,
      description,
      userId,
      changes
    })

    const [record, created] = await this.model.findOrCreate({
      where: { category },
      defaults: {
        settings,
        description,
        updated_by: userId
      }
    })

    if (!created) {
      const oldSettings = record.settings
      await record.update({
        settings,
        description,
        updated_by: userId
      })

      // Создаем запись в истории
      await this.createHistoryRecord(
        record.id,
        category,
        oldSettings,
        changes || settings,
        description,
        userId
      )
    }

    return record
  }

  /**
   * Получить все активные настройки
   */
  async getAllActive() {
    this.checkModel()
    
    return this.model.findAll({
      where: { is_active: true }
    })
  }

  /**
   * Деактивировать настройки
   */
  async deactivate(category, userId) {
    this.checkModel()
    
    const settings = await this.getByCategory(category)
    if (!settings) {
      throw new ValidationError('Settings not found')
    }

    await settings.update({
      is_active: false,
      updated_by: userId
    })

    return settings
  }
}

module.exports = new SystemSettingsService() 