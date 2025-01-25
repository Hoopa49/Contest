/**
 * Контроллер для административных функций
 */

const BaseController = require('./base.controller')
const UserModel = require('../models/user.model')
const ContestModel = require('../models/contest.model')
const SettingsModel = require('../models/settings.model')
const LogModel = require('../models/log.model')
const { Op } = require('sequelize')

class AdminController extends BaseController {
  /**
   * Получение системной статистики
   */
  async getSystemStats(req, res) {
    try {
      const stats = {
        totalUsers: await UserModel.count(),
        activeContests: await ContestModel.count({ 
          where: { contest_status: 'active' } 
        }),
        newRegistrations: await UserModel.count({
          where: {
            created_at: {
              [Op.gte]: new Date(new Date() - 24 * 60 * 60 * 1000)
            }
          }
        }),
        apiRequestsPerHour: await LogModel.count({
          where: {
            type: 'api_request',
            created_at: {
              [Op.gte]: new Date(new Date() - 60 * 60 * 1000)
            }
          }
        })
      }

      return this.sendSuccess(res, stats)
    } catch (error) {
      return this.sendError(res, error)
    }
  }

  /**
   * Получение последних действий
   */
  async getRecentActions(req, res) {
    try {
      const actions = await LogModel.findAll({
        where: { type: 'user_action' },
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
   * Получение списка пользователей
   */
  async getUsers(req, res) {
    try {
      const users = await UserModel.findAll({
        attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at']
      })

      return this.sendSuccess(res, users)
    } catch (error) {
      return this.sendError(res, error)
    }
  }

  /**
   * Блокировка/разблокировка пользователя
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
   */
  async getSettings(req, res) {
    try {
      const settings = await SettingsModel.findAll()
      return this.sendSuccess(res, settings)
    } catch (error) {
      return this.sendError(res, error)
    }
  }

  /**
   * Обновление настроек системы
   */
  async updateSettings(req, res) {
    try {
      const { settings } = req.body
      await Promise.all(
        settings.map(({ key, value }) =>
          SettingsModel.upsert({ key, value })
        )
      )

      return this.sendSuccess(res, { message: 'Настройки обновлены' })
    } catch (error) {
      return this.sendError(res, error)
    }
  }

  /**
   * Получение системных логов
   */
  async getLogs(req, res) {
    try {
      const { page = 1, perPage = 20, type } = req.query
      const where = type ? { type } : {}

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
}

module.exports = AdminController 