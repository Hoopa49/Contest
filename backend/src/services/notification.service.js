/**
 * Сервис для работы с уведомлениями
 */

const { Notification, NotificationSettings } = require('../models')
const { NotFoundError } = require('../utils/errors')

class NotificationService {
  // Получение всех уведомлений пользователя
  async getAllForUser(userId) {
    return Notification.findAll({
      where: {
        user_id: userId,
        deleted_at: null
      },
      order: [['created_at', 'DESC']]
    })
  }

  // Получение непрочитанных уведомлений
  async getUnreadForUser(userId) {
    return Notification.findAll({
      where: {
        user_id: userId,
        read: false,
        deleted_at: null
      },
      order: [['created_at', 'DESC']]
    })
  }

  // Отметить уведомление как прочитанное
  async markAsRead(notificationId, userId) {
    const notification = await this.findNotification(notificationId, userId)
    
    return notification.update({ read: true })
  }

  // Отметить все уведомления как прочитанные
  async markAllAsRead(userId) {
    return Notification.update(
      { read: true },
      {
        where: {
          user_id: userId,
          read: false,
          deleted_at: null
        }
      }
    )
  }

  // Удаление уведомления
  async delete(notificationId, userId) {
    const notification = await this.findNotification(notificationId, userId)
    
    return notification.update({ deleted_at: new Date() })
  }

  // Получение настроек уведомлений
  async getSettings(userId) {
    const settings = await NotificationSettings.findOne({
      where: { user_id: userId }
    })

    if (!settings) {
      return this.createDefaultSettings(userId)
    }

    return settings
  }

  // Обновление настроек уведомлений
  async updateSettings(userId, data) {
    const [settings] = await NotificationSettings.upsert({
      user_id: userId,
      ...data
    })
    return settings
  }

  // Создание уведомления
  async create(data) {
    return Notification.create({
      ...data,
      read: false
    })
  }

  // Вспомогательные методы
  async findNotification(id, userId) {
    const notification = await Notification.findOne({
      where: {
        id,
        user_id: userId,
        deleted_at: null
      }
    })

    if (!notification) {
      throw new NotFoundError('Уведомление не найдено')
    }

    return notification
  }

  // Создание настроек по умолчанию
  async createDefaultSettings(userId) {
    return NotificationSettings.create({
      user_id: userId,
      channels: {
        email: {
          enabled: true,
          address: '',
          frequency: 'instant'
        },
        push: {
          enabled: true,
          desktop: true,
          mobile: true
        },
        telegram: {
          enabled: false,
          username: ''
        }
      },
      types: {
        system: {
          enabled: true,
          channels: ['push'],
          importance: 'normal'
        },
        contest: {
          enabled: true,
          channels: ['email', 'push'],
          importance: 'high'
        },
        platform: {
          enabled: true,
          channels: ['push'],
          importance: 'low'
        },
        security: {
          enabled: true,
          channels: ['email', 'push', 'telegram'],
          importance: 'critical'
        }
      },
      schedule: {
        quietHours: {
          enabled: false,
          start: '23:00',
          end: '07:00'
        },
        days: {
          mon: true,
          tue: true,
          wed: true,
          thu: true,
          fri: true,
          sat: true,
          sun: true
        }
      }
    })
  }
}

module.exports = NotificationService 