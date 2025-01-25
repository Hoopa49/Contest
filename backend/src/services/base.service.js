/**
 * Базовый сервис
 * Содержит основные CRUD операции для работы с моделями
 */

const { NotFoundError } = require('../utils/errors')
const { logger } = require('../logging')

class BaseService {
  constructor(model) {
    this.model = model
    this.modelName = model.name
  }

  /**
   * Создание записи
   * @param {Object} data - Данные для создания
   * @returns {Promise<Object>} Созданная запись
   */
  async create(data) {
    try {
      const item = await this.model.create(data)
      
      logger.info('Создана новая запись:', { 
        model: this.model.name,
        id: item.id 
      })
      
      return item
    } catch (error) {
      logger.error('Ошибка создания записи:', {
        model: this.model.name,
        error: error.message
      })
      throw error
    }
  }

  /**
   * Получение записи по ID
   * @param {string} id - ID записи
   * @param {Object} options - Дополнительные параметры запроса
   * @returns {Promise<Object>} Найденная запись
   */
  async findById(id) {
    try {
      const item = await this.model.findByPk(id)
      
      if (!item) {
        logger.warn('Запись не найдена:', { 
          model: this.model.name,
          id 
        })
      }
      
      return item
    } catch (error) {
      logger.error('Ошибка поиска записи:', {
        model: this.model.name,
        id,
        error: error.message
      })
      throw error
    }
  }

  /**
   * Поиск одной записи
   * @param {Object} where - Условия поиска
   * @param {Object} options - Дополнительные параметры запроса
   * @returns {Promise<Object>} Найденная запись
   */
  async findOne(where, options = {}) {
    return await this.model.findOne({ where, ...options })
  }

  /**
   * Получение всех записей с пагинацией
   * @param {Object} options - Параметры запроса (where, include, limit, offset и т.д.)
   * @returns {Promise<Object>} Объект с записями и метаданными
   */
  async getAll(options = {}) {
    const { page = 1, limit = 10, ...queryOptions } = options
    const offset = (page - 1) * limit

    const { count, rows } = await this.model.findAndCountAll({
      ...queryOptions,
      limit,
      offset
    })

    return {
      items: rows,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    }
  }

  /**
   * Обновление записи
   * @param {string} id - ID записи
   * @param {Object} data - Данные для обновления
   * @returns {Promise<Object>} Обновленная запись
   */
  async update(id, data) {
    try {
      const item = await this.model.findByPk(id)
      
      if (!item) {
        logger.warn('Запись не найдена:', { 
          model: this.model.name,
          id 
        })
        return null
      }
      
      await item.update(data)
      logger.info('Запись обновлена:', { 
        model: this.model.name,
        id 
      })
      
      return item
    } catch (error) {
      logger.error('Ошибка обновления записи:', {
        model: this.model.name,
        id,
        error: error.message
      })
      throw error
    }
  }

  /**
   * Удаление записи
   * @param {string} id - ID записи
   * @returns {Promise<boolean>} Результат удаления
   */
  async delete(id) {
    try {
      const item = await this.model.findByPk(id)
      
      if (!item) {
        logger.warn('Запись не найдена:', { 
          model: this.model.name,
          id 
        })
        return false
      }
      
      await item.destroy()
      logger.info('Запись удалена:', { 
        model: this.model.name,
        id 
      })
      
      return true
    } catch (error) {
      logger.error('Ошибка удаления записи:', {
        model: this.model.name,
        id,
        error: error.message
      })
      throw error
    }
  }

  /**
   * Массовое создание записей
   * @param {Array} data - Массив данных для создания
   * @returns {Promise<Array>} Массив созданных записей
   */
  async bulkCreate(data) {
    return this.model.bulkCreate(data)
  }

  /**
   * Подсчет записей
   * @param {Object} where - Условия подсчета
   * @returns {Promise<number>} Количество записей
   */
  async count(where = {}) {
    return this.model.count({ where })
  }
}

module.exports = BaseService 