/**
 * Контроллер для работы с конкурсами
 * Обрабатывает запросы связанные с конкурсами
 */

const { Contest, User } = require('../models')
const { Op } = require('sequelize')
const BaseController = require('./base.controller')
const logger = require('../logging')

class ContestController extends BaseController {
  /**
   * Получение списка конкурсов с фильтрацией
   */
  async getContests(req, res) {
    try {
      
      const { search, platformType, status, sortBy, page = 1, perPage = 12 } = req.query

      const where = {}
      
      if (status) {
        where.contest_status = status
      }
      
      if (platformType && platformType !== 'null' && platformType !== 'undefined') {
        const platforms = Array.isArray(platformType) ? platformType : [platformType];
        where.platform_type = {
          [Op.in]: platforms.map(p => p.toLowerCase())
        }
        logger.info('>>> Применяется фильтр по платформам:', {
          platforms: platforms.map(p => p.toLowerCase()),
          condition: where.platform_type
        })
      }
      
      if (search) {
        where.title = { [Op.iLike]: `%${search}%` }
      }

      logger.info('>>> Итоговые условия запроса:', { where })

      let order = []
      switch(sortBy) {
        case 'created_at_desc':
          order.push(['created_at', 'DESC'])
          break
        case 'created_at_asc':
          order.push(['created_at', 'ASC'])
          break
        case 'prize_pool_desc':
          order.push(['prize_pool', 'DESC'])
          break
        case 'prize_pool_asc':
          order.push(['prize_pool', 'ASC'])
          break
        case 'participants_count_desc':
          order.push(['participants_count', 'DESC'])
          break
        case 'participants_count_asc':
          order.push(['participants_count', 'ASC'])
          break
        default:
          order.push(['created_at', 'DESC'])
      }

      const queryOptions = {
        where,
        order,
        limit: perPage,
        offset: (page - 1) * perPage,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name']
          }
        ],
        logging: (sql, timing) => {
          logger.info('>>> SQL запрос:', sql)
          logger.info('>>> Параметры SQL:', { where, order, timing })
        }
      }

      logger.info('>>> Опции запроса:', {
        where,
        order,
        limit: perPage,
        offset: (page - 1) * perPage
      })

      const { rows: contests, count } = await Contest.findAndCountAll(queryOptions)

      logger.info('>>> Получено записей из БД:', count)
      logger.info('>>> Первая запись:', contests[0]?.dataValues)

      const transformedContests = contests.map(c => {
        const json = c.toJSON()
        return {
          ...json,
          platformType: json.platform_type
        }
      })

      logger.info('>>> Преобразованные данные:', {
        count: transformedContests.length,
        sample: transformedContests[0]
      })

      logger.info('=== КОНЕЦ ОБРАБОТКИ ЗАПРОСА ===')

      return res.json({
        success: true,
        data: transformedContests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / perPage),
          totalItems: count,
          perPage: parseInt(perPage)
        }
      })

    } catch (error) {
      logger.error('Ошибка при получении конкурсов:', {
        message: error.message,
        stack: error.stack,
        query: req.query
      })
      return res.status(500).json({
        success: false,
        message: 'Не удалось загрузить конкурсы',
        error: error.message
      })
    }
  }
}

module.exports = new ContestController() 