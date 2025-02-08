/**
 * Сервис для работы с системными настройками
 */

const BaseService = require('./base.service')
const logger = require('../logging')
const { ValidationError } = require('../utils/errors')

class SystemSettingsService extends BaseService {
  constructor() {
    super('system_settings')
  }

  async init(models) {
    await super.init(models)
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
   * Обновить или создать настройки
   */
  async upsertSettings(category, settings, description, userId) {
    this.checkModel()

    if (!category || !settings) {
      throw new ValidationError('Category and settings are required')
    }

    const [record, created] = await this.model.findOrCreate({
      where: { category },
      defaults: {
        settings,
        description,
        updated_by: userId
      }
    })

    if (!created) {
      await record.update({
        settings,
        description,
        updated_by: userId
      })
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