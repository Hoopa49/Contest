/**
 * Сервис для работы с пользователями
 * Управление пользователями и их данными
 */

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const BaseService = require('./base.service')
const { Op, Sequelize } = require('sequelize')
const { logger } = require('../logging')
const config = require('../config')
const { ValidationError, ConflictError } = require('../utils/errors')

class UserService extends BaseService {
  constructor() {
    super('User')
    this.Contest = null
  }

  init(models) {
    super.init(models)
    this.Contest = models.Contest
    logger.info('UserService initialized with models')
  }

  /**
   * Получение пользователя по ID
   * @param {string} id - ID пользователя
   * @returns {Promise<Object>} Пользователь
   */
  async getById(id) {
    this.checkModel()
    return this.findById(id)
  }

  /**
   * Создание нового пользователя
   * @param {Object} userData - Данные пользователя
   * @returns {Promise<Object>} Созданный пользователь
   */
  async createUser(userData) {
    // Проверяем существование пользователя с таким email
    const existingUser = await this.model.findOne({
      where: { email: userData.email }
    })

    if (existingUser) {
      throw new ConflictError('Пользователь с таким email уже существует')
    }

    // Валидация пароля
    if (!userData.password || userData.password.length < 6) {
      throw new ValidationError('Пароль должен содержать минимум 6 символов')
    }

    // Хешируем пароль
    const password_hash = await bcrypt.hash(userData.password, 10)

    // Создаем пользователя
    const user = await this.create({
      ...userData,
      password_hash,
      role: userData.role || 'user'
    })

    return this.sanitizeUser(user)
  }

  /**
   * Аутентификация пользователя
   * @param {Object} params - Параметры аутентификации
   * @param {string} params.email - Email пользователя
   * @param {string} params.password - Пароль пользователя
   * @param {boolean} params.remember - Флаг "запомнить меня"
   * @returns {Promise<Object>} Аутентифицированный пользователь с токеном
   */
  async authenticateUser({ email, password, remember = false }) {
    try {
      logger.debug('Попытка аутентификации:', { email })
      
      const user = await this.model.findOne({
        where: { email }
      })

      if (!user) {
        logger.debug('Пользователь не найден:', { email })
        throw new ValidationError('Неверный email или пароль')
      }

      if (!user.is_active) {
        logger.debug('Аккаунт деактивирован:', { email })
        throw new ValidationError('Аккаунт деактивирован')
      }

      logger.debug('Проверка пароля:', { 
        email,
        passwordLength: password?.length,
        hashedPasswordLength: user.password_hash?.length
      })

      const isValidPassword = await bcrypt.compare(password, user.password_hash)
      logger.debug('Результат проверки пароля:', { email, isValidPassword })

      if (!isValidPassword) {
        throw new ValidationError('Неверный email или пароль')
      }

      // Обновляем время последнего входа
      await user.update({ last_login: new Date() })

      // Генерируем токены
      const expiresIn = remember ? config.jwt.refreshExpiresIn : config.jwt.accessExpiresIn
      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          role: user.role
        },
        config.jwt.accessSecret,
        { expiresIn }
      )

      // Если выбрано "запомнить меня", генерируем refresh token
      let refreshToken = null
      if (remember) {
        refreshToken = jwt.sign(
          { userId: user.id },
          config.jwt.refreshSecret,
          { expiresIn: config.jwt.refreshExpiresIn }
        )
      }

      const sanitizedUser = this.sanitizeUser(user)
      logger.debug('Аутентификация успешна:', { email })
      
      return {
        ...sanitizedUser,
        token,
        refreshToken,
        expiresIn
      }
    } catch (error) {
      logger.error('Ошибка при аутентификации:', { 
        email,
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  }

  /**
   * Обновление данных пользователя
   * @param {string} id - ID пользователя
   * @param {Object} userData - Новые данные пользователя
   * @returns {Promise<Object>} Обновленный пользователь
   */
  async updateUser(id, userData) {
    const user = await this.findById(id)
    if (!user) {
      throw new ValidationError('Пользователь не найден')
    }

    // Если меняется email, проверяем его уникальность
    if (userData.email && userData.email !== user.email) {
      const existingUser = await this.model.findOne({
        where: { email: userData.email }
      })
      if (existingUser) {
        throw new ConflictError('Пользователь с таким email уже существует')
      }
    }

    // Если меняется пароль, хешируем его
    if (userData.password) {
      if (userData.password.length < 6) {
        throw new ValidationError('Пароль должен содержать минимум 6 символов')
      }
      userData.password_hash = await bcrypt.hash(userData.password, 10)
      delete userData.password
    }

    const updatedUser = await user.update(userData)
    return this.sanitizeUser(updatedUser)
  }

  /**
   * Изменение пароля пользователя
   * @param {string} id - ID пользователя
   * @param {string} oldPassword - Старый пароль
   * @param {string} newPassword - Новый пароль
   * @returns {Promise<boolean>} Результат изменения пароля
   */
  async changePassword(id, oldPassword, newPassword) {
    const user = await this.findById(id)
    if (!user) {
      throw new ValidationError('Пользователь не найден')
    }

    // Проверяем старый пароль
    const isValidPassword = await bcrypt.compare(oldPassword, user.password_hash)
    if (!isValidPassword) {
      throw new ValidationError('Неверный текущий пароль')
    }

    // Валидация нового пароля
    if (!newPassword || newPassword.length < 6) {
      throw new ValidationError('Новый пароль должен содержать минимум 6 символов')
    }

    // Хешируем и сохраняем новый пароль
    const password_hash = await bcrypt.hash(newPassword, 10)
    await user.update({ password_hash })

    return true
  }

  /**
   * Получение статистики пользователя
   * @param {string} userId - ID пользователя
   * @returns {Promise<Object>} Статистика пользователя
   */
  async getUserStats(userId) {
    try {
      if (!userId) {
        throw new ValidationError('ID пользователя не указан');
      }

      // Проверяем существование пользователя
      const user = await this.findById(userId);
      if (!user) {
        throw new ValidationError('Пользователь не найден');
      }

      // Инициализируем объект статистики
      const result = {
        total: 0,
        active: 0,
        completed: 0,
        failed: 0,
        draft: 0
      };

      try {
        // Получение статистики через Sequelize
        const stats = await this.Contest.findAll({
          attributes: [
            'contest_status',
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
          ],
          where: {
            user_id: userId
          },
          group: ['contest_status'],
          raw: true
        });

        // Обработка результатов
        if (Array.isArray(stats)) {
          stats.forEach(stat => {
            const status = stat.contest_status;
            const count = parseInt(stat.count, 10) || 0;
            
            if (status && result.hasOwnProperty(status)) {
              result[status] = count;
            }
          });
        }

        // Подсчет общего количества (исключая черновики)
        result.total = result.active + result.completed + result.failed;

        return result;
      } catch (dbError) {
        logger.error('Ошибка при запросе к базе данных:', {
          userId,
          error: dbError.message,
          stack: dbError.stack
        });
        throw new Error('Ошибка при получении статистики');
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      logger.error('Ошибка при получении статистики пользователя:', {
        userId,
        error: error.message,
        stack: error.stack
      });
      throw new Error('Ошибка при получении статистики пользователя');
    }
  }

  /**
   * Получение активности пользователя
   * @param {string} userId - ID пользователя
   * @returns {Promise<Array>} Список активности пользователя
   */
  async getUserActivity(userId) {
    try {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const activity = await this.Contest.findAll({
        where: {
          user_id: userId,
          updated_at: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        order: [['updated_at', 'DESC']],
        limit: 10,
        raw: true
      })

      return activity.map(item => ({
        id: item.id,
        title: item.title,
        status: item.contest_status,
        statusDescription: this.getStatusDescription(item.contest_status),
        updatedAt: item.updated_at
      }))
    } catch (error) {
      logger.error('Error getting user activity:', error)
      throw error
    }
  }

  /**
   * Получение описания статуса конкурса
   * @param {string} status - Статус конкурса
   * @returns {string} Описание статуса
   */
  getStatusDescription(status) {
    const descriptions = {
      draft: 'Черновик создан',
      active: 'Конкурс запущен',
      completed: 'Конкурс завершен',
      cancelled: 'Конкурс отменен'
    }
    return descriptions[status] || status
  }

  /**
   * Удаление чувствительных данных пользователя
   * @param {Object} user - Объект пользователя
   * @returns {Object} Очищенный объект пользователя
   */
  sanitizeUser(user) {
    const userData = user.toJSON()
    delete userData.password_hash
    return userData
  }

  async findById(id) {
    try {
      const user = await this.model.findByPk(id)
      
      if (!user) {
        logger.warn('Пользователь не найден:', { id })
      }
      
      return user
    } catch (error) {
      logger.error('Ошибка поиска пользователя:', {
        id,
        error: error.message
      })
      throw error
    }
  }
}

module.exports = new UserService() 