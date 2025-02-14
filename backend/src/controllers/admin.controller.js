/**
 * Контроллер для административных функций
 */

const BaseController = require('./base.controller')
const UserModel = require('../models/user.model')
const ContestModel = require('../models/contest.model')
const SystemSettingsModel = require('../models/system_settings.model')
const IntegrationActivityModel = require('../models/integration_activities.model')
const ContestStatsModel = require('../models/contest_stats')
const AnalyticsDataModel = require('../models/analytics_data.model')
const { Op, Sequelize } = require('sequelize')
require('../modules/youtube/schemas/admin.schema')

class AdminController extends BaseController {
  /**
   * Получение системной статистики
   * @returns {Promise<SystemStats>}
   */
  async getSystemStats(req, res) {
    try {
      const now = new Date()
      const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000)
      const oneHourAgo = new Date(now - 60 * 60 * 1000)

      /** @type {SystemStats} */
      const stats = {
        // Базовая статистика
        totalUsers: await UserModel.count(),
        activeContests: await ContestModel.count({ 
          where: { contest_status: 'active' } 
        }),
        newRegistrations: await UserModel.count({
          where: {
            created_at: {
              [Op.gte]: oneDayAgo
            }
          }
        }),

        // Статистика активности
        userActivities: await IntegrationActivityModel.count({
          where: {
            created_at: {
              [Op.gte]: oneHourAgo
            },
            status: 'success'
          }
        }),

        // Статистика конкурсов
        totalViews: await ContestStatsModel.sum('views_count'),
        totalParticipants: await ContestStatsModel.sum('participants_count'),
        averageRating: await ContestStatsModel.findOne({
          attributes: [
            [Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating']
          ],
          raw: true
        }).then(result => Number(result?.avgRating || 0).toFixed(1)),

        // Аналитические данные за последние 24 часа
        analytics: await AnalyticsDataModel.findOne({
          where: {
            created_at: {
              [Op.gte]: oneDayAgo
            }
          },
          attributes: ['metrics', 'dimensions', 'metadata'],
          raw: true
        }).then(result => ({
          metrics: result?.metrics || {},
          dimensions: result?.dimensions || {},
          metadata: result?.metadata || {}
        }))
      }

      return this.sendSuccess(res, stats)
    } catch (error) {
      return this.sendError(res, error)
    }
  }

  /**
   * Получение последних действий
   * @returns {Promise<UserAction[]>}
   */
  async getRecentActions(req, res) {
    try {
      /** @type {UserAction[]} */
      const actions = await IntegrationActivityModel.findAll({
        where: { status: 'success' },
        order: [['created_at', 'DESC']],
        limit: 10,
        include: [{
          model: UserModel,
          as: 'user',
          attributes: ['id', 'email', 'first_name', 'last_name']
        }]
      })

      return this.sendSuccess(res, actions)
    } catch (error) {
      return this.sendError(res, error)
    }
  }

  /**
   * Получение активности интеграций
   * @returns {Promise<Object>}
   */
  async getIntegrationActivity(req, res) {
    try {
      const { timeRange } = req.query
      const integrationService = require('../services/integration.service')
      const activity = await integrationService.getActivity(timeRange)
      return this.sendSuccess(res, activity)
    } catch (error) {
      return this.sendError(res, error)
    }
  }

  /**
   * Получение списка пользователей
   * @returns {Promise<AdminUser[]>}
   */
  async getUsers(req, res) {
    try {
      /** @type {AdminUser[]} */
      const users = await UserModel.findAll({
        attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at', 'last_login']
      })

      return this.sendSuccess(res, users)
    } catch (error) {
      return this.sendError(res, error)
    }
  }

  /**
   * Блокировка/разблокировка пользователя
   * @returns {Promise<ApiResponse>}
   */
  async toggleUserStatus(req, res) {
    try {
      const user = await UserModel.findByPk(req.params.userId)
      if (!user) {
        return this.sendError(res, 'Пользователь не найден', 404)
      }

      user.is_active = !user.is_active
      await user.save()

      return this.sendSuccess(res, { message: 'Статус пользователя обновлен' })
    } catch (error) {
      return this.sendError(res, error)
    }
  }

  /**
   * Получение настроек системы
   * @returns {Promise<SystemSetting[]>}
   */
  async getSettings(req, res) {
    try {
      /** @type {SystemSetting[]} */
      const settings = await SystemSettingsModel.findAll()
      return this.sendSuccess(res, settings)
    } catch (error) {
      return this.sendError(res, error)
    }
  }

  /**
   * Обновление настроек системы
   * @param {Object} req.body.settings - Массив настроек для обновления
   * @returns {Promise<ApiResponse>}
   */
  async updateSettings(req, res) {
    try {
      const { settings } = req.body
      await Promise.all(
        settings.map(({ category, settings }) =>
          SystemSettingsModel.upsert({ category, settings })
        )
      )

      return this.sendSuccess(res, { message: 'Настройки обновлены' })
    } catch (error) {
      return this.sendError(res, error)
    }
  }

  /**
   * Получение системных логов
   * @returns {Promise<{rows: SystemLog[], count: number}>}
   */
  async getLogs(req, res) {
    try {
      const { page = 1, perPage = 20, type } = req.query
      const where = type ? { type } : {}

      /** @type {{rows: SystemLog[], count: number}} */
      const { rows: logs, count } = await LogModel.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit: perPage,
        offset: (page - 1) * perPage
      })

      return this.sendPaginated(res, logs, {
        total: count,
        page: parseInt(page),
        perPage: parseInt(perPage)
      })
    } catch (error) {
      return this.sendError(res, error)
    }
  }

  /**
   * Обновление пользователя
   * @returns {Promise<AdminUser>}
   */
  async updateUser(req, res) {
    try {
      const user = await UserModel.findByPk(req.params.userId)
      if (!user) {
        return this.sendError(res, 'Пользователь не найден', 404)
      }

      // Обновляем только разрешенные поля
      const allowedFields = ['email', 'first_name', 'last_name', 'role', 'is_active']
      const updateData = {}
      
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field]
        }
      })

      await UserModel.update(updateData, {
        where: { id: req.params.userId }
      })

      // Получаем обновленные данные пользователя
      const updatedUser = await UserModel.findByPk(req.params.userId)
      return this.sendSuccess(res, updatedUser)
    } catch (error) {
      return this.sendError(res, error)
    }
  }

  /**
   * Удаление пользователя
   * @returns {Promise<ApiResponse>}
   */
  async deleteUser(req, res) {
    try {
      const user = await UserModel.findByPk(req.params.userId)
      if (!user) {
        return this.sendError(res, 'Пользователь не найден', 404)
      }

      await user.destroy()
      return this.sendSuccess(res, { message: 'Пользователь успешно удален' })
    } catch (error) {
      return this.sendError(res, error)
    }
  }
}

module.exports = AdminController 