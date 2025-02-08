/**
 * Сервис для работы с настройками приложения
 */

const BaseService = require('./base.service')
const logger = require('../logging')
const { ValidationError } = require('../utils/errors')
const bcrypt = require('bcryptjs')

class SettingsService extends BaseService {
  constructor() {
    super('Settings')
  }

  /**
   * Инициализация сервиса
   * @param {Object} models - Модели приложения
   */
  async init(models) {
    super.init(models)
    await this.initializeDefaultSettings()
  }

  /**
   * Инициализация настроек по умолчанию
   */
  async initializeDefaultSettings() {
    try {
      const settings = await this.model.findOne()
      if (!settings) {
        // Создаем или получаем системного пользователя
        const systemUser = await this.models.User.findOrCreate({
          where: {
            id: '00000000-0000-0000-0000-000000000000'
          },
          defaults: {
            email: 'system@example.com',
            auth_provider: 'local',
            role: 'admin',
            first_name: 'System',
            last_name: 'User',
            password_hash: await bcrypt.hash('system', 10)
          }
        });

        await this.model.create({
          user_id: '00000000-0000-0000-0000-000000000000',
          name: 'system_settings',
          value: {
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
          }
        })
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
    const settings = await this.model.findOne()
    if (!settings) {
      throw new ValidationError('Settings not found')
    }
    return settings
  }

  /**
   * Обновление настроек
   * @param {Object} data - Новые настройки
   */
  async updateSettings(data) {
    try {
      const settings = await this.model.findOne()
      if (!settings) {
        throw new ValidationError('Settings not found')
      }

      // Обновляем только разрешенные поля
      const allowedFields = ['app', 'email', 'notifications', 'security', 'integrations']
      const updateData = {}

      allowedFields.forEach(field => {
        if (data[field]) {
          updateData[field] = {
            ...settings[field],
            ...data[field]
          }
        }
      })

      await settings.update(updateData)
      logger.info('Settings updated successfully')

      return settings
    } catch (error) {
      logger.error('Error updating settings:', error)
      throw error
    }
  }

  /**
   * Получение настроек по категории
   * @param {string} category - Категория настроек
   */
  async getSettingsByCategory(category) {
    const settings = await this.getSettings()
    if (!settings[category]) {
      throw new ValidationError(`Category ${category} not found`)
    }
    return settings[category]
  }

  /**
   * Обновление настроек по категории
   * @param {string} category - Категория настроек
   * @param {Object} data - Новые настройки
   */
  async updateSettingsByCategory(category, data) {
    try {
      const settings = await this.model.findOne()
      if (!settings) {
        throw new ValidationError('Settings not found')
      }

      if (!settings[category]) {
        throw new ValidationError(`Category ${category} not found`)
      }

      const updateData = {}
      updateData[category] = {
        ...settings[category],
        ...data
      }

      await settings.update(updateData)
      logger.info(`Settings category ${category} updated successfully`)

      return settings[category]
    } catch (error) {
      logger.error(`Error updating settings category ${category}:`, error)
      throw error
    }
  }
}

module.exports = new SettingsService() 