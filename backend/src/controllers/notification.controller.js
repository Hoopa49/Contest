/**
 * Контроллер для работы с уведомлениями
 */

const BaseController = require('./base.controller')
const NotificationService = require('../services/notification.service')

class NotificationController extends BaseController {
  constructor() {
    super(new NotificationService())
  }

  // Получение всех уведомлений пользователя
  getAll = this.handleAsync(async (req, res) => {
    const notifications = await this.service.getAllForUser(req.user.id)
    this.sendSuccess(res, notifications)
  })

  // Получение непрочитанных уведомлений
  getUnread = this.handleAsync(async (req, res) => {
    const notifications = await this.service.getUnreadForUser(req.user.id)
    this.sendSuccess(res, notifications)
  })

  // Отметить уведомление как прочитанное
  markAsRead = this.handleAsync(async (req, res) => {
    await this.service.markAsRead(req.params.id, req.user.id)
    this.sendSuccess(res, { success: true })
  })

  // Отметить все уведомления как прочитанные
  markAllAsRead = this.handleAsync(async (req, res) => {
    await this.service.markAllAsRead(req.user.id)
    this.sendSuccess(res, { success: true })
  })

  // Удаление уведомления
  delete = this.handleAsync(async (req, res) => {
    await this.service.delete(req.params.id, req.user.id)
    this.sendSuccess(res, { success: true })
  })

  // Получение настроек уведомлений
  getSettings = this.handleAsync(async (req, res) => {
    const settings = await this.service.getSettings(req.user.id)
    this.sendSuccess(res, settings)
  })

  // Обновление настроек уведомлений
  updateSettings = this.handleAsync(async (req, res) => {
    const settings = await this.service.updateSettings(req.user.id, req.body)
    this.sendSuccess(res, settings)
  })
}

module.exports = new NotificationController() 