const { Op } = require('sequelize')
const { logger } = require('../../../logging')
const { 
  Contest, 
  User, 
  FavoriteContest,
  ContestParticipation,
  ContestStats
} = require('../../../models')
const contestStatsService = require('../../../services/contest_stats.service')
const { ValidationError, ForbiddenError } = require('../../../utils/errors')
const BaseService = require('../../../services/base.service')

class ContestService extends BaseService {
  constructor() {
    super(Contest)
  }

  // Преобразование snake_case в camelCase
  _formatContest(contest) {
    if (!contest) return null
    
    const formatted = contest.toJSON ? contest.toJSON() : contest
    const platformType = (formatted.platform_type || 'youtube').toLowerCase()
    const defaultStartDate = new Date()
    const defaultEndDate = new Date(defaultStartDate.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Форматируем автора как organizer для фронтенда
    const formatOrganizer = (author) => {
      if (!author) {
        return {
          id: '',
          name: 'Неизвестный организатор',
          email: '',
          avatar: null,
          rating: 0,
          role: 'user',
          status: 'active'
        }
      }
      
      const authorData = author.toJSON ? author.toJSON() : author
      
      // Определяем статус на основе флагов
      let status = 'active'
      if (authorData.is_blocked) status = 'blocked'
      else if (!authorData.is_active) status = 'inactive'
      
      return {
        id: authorData.id || '',
        name: authorData.first_name && authorData.last_name 
          ? `${authorData.first_name} ${authorData.last_name}`.trim()
          : authorData.username || 'Неизвестный организатор',
        email: authorData.email || '',
        avatar: authorData.avatar || null,
        rating: parseFloat(authorData.rating) || 0,
        role: authorData.role || 'user',
        status: status
      }
    }

    const formatItems = (items) => {
      if (!items || !Array.isArray(items)) return []
      return items.map(item => {
        const itemData = item.toJSON ? item.toJSON() : item
        if (typeof itemData === 'string') return { text: itemData, required: false }
        return {
          text: itemData.description || itemData.text || '',
          required: !!itemData.required,
          fulfilled: !!itemData.fulfilled,
          status: itemData.status || 'pending'
        }
      })
    }

    const formatSidebarRequirements = (items) => {
      if (!items || !Array.isArray(items)) return []
      return items.map(item => {
        if (typeof item === 'string') return { text: item, required: false }
        return {
          text: item.description || item.text || '',
          value: item.value || 0,
          required: !!item.required
        }
      })
    }

    const formatPrizes = (prizes) => {
      if (!prizes || !Array.isArray(prizes)) return []
      return prizes.map((prize, index) => {
        const prizeData = prize.toJSON ? prize.toJSON() : prize
        return {
          id: prizeData.id || `prize_${index + 1}`,
          title: prizeData.title || `${index + 1} место`,
          description: prizeData.description || '',
          value: parseInt(prizeData.value || prizeData.amount) || 0,
          type: prizeData.type || 'main',
          position: parseInt(prizeData.position || prizeData.place) || (index + 1),
          features: Array.isArray(prizeData.features) ? prizeData.features : []
        }
      })
    }

    // Форматируем статистику
    const stats = formatted.stats ? (formatted.stats.toJSON ? formatted.stats.toJSON() : formatted.stats) : {}
    const formattedStats = {
      views_count: parseInt(stats.views_count) || 0,
      participants_count: parseInt(stats.participants_count) || 0,
      favorites_count: parseInt(stats.favorites_count) || 0,
      rating: parseFloat(stats.rating) || 0,
      reviews_count: parseInt(stats.reviews_count) || 0
    }

    const formattedContest = {
      id: formatted.id || '',
      title: formatted.title || '',
      description: formatted.description || '',
      platform_type: platformType,
      platform: platformType,
      status: formatted.contest_status || formatted.status || 'active',
      contest_status: formatted.contest_status || formatted.status || 'active',
      platform_id: formatted.platform_id || '',
      source_url: formatted.source_url || '',
      start_date: formatted.start_date ? new Date(formatted.start_date).toISOString() : defaultStartDate.toISOString(),
      end_date: formatted.end_date ? new Date(formatted.end_date).toISOString() : defaultEndDate.toISOString(),
      deadline: formatted.end_date ? new Date(formatted.end_date).toISOString() : defaultEndDate.toISOString(),
      views_count: parseInt(formattedStats.views_count) || 0,
      participants_count: parseInt(formattedStats.participants_count) || 0,
      favorites_count: parseInt(formattedStats.favorites_count) || 0,
      rating: parseFloat(formattedStats.rating) || 0,
      reviews_count: parseInt(formattedStats.reviews_count) || 0,
      prize_value: parseInt(formatted.prize_value || formatted.prizeValue) || 0,
      rules: formatItems(formatted.rules_data || formatted.rules || []),
      prizes: formatPrizes(formatted.prizes_data || formatted.prizes || []),
      requirements: formatItems(formatted.requirements_data || formatted.requirements || []),
      sidebarRequirements: formatSidebarRequirements(formatted.requirements_data || []),
      tags_list: Array.isArray(formatted.tags_list) ? formatted.tags_list : [],
      created_at: formatted.created_at ? new Date(formatted.created_at).toISOString() : new Date().toISOString(),
      updated_at: formatted.updated_at ? new Date(formatted.updated_at).toISOString() : new Date().toISOString(),
      allow_reviews: formatted.allow_reviews !== false,
      allow_comments: formatted.allow_comments !== false,
      image: formatted.image || null,
      organizer: formatOrganizer(formatted.author || formatted.organizer),
      author: formatOrganizer(formatted.author || formatted.organizer),
      is_favorite: !!formatted.is_favorite,
      has_user_participated: !!formatted.has_user_participated,
      participation_status: formatted.participation_status || 'none'
    }

    return formattedContest
  }

  async getAllContests({ page = 1, limit = 10, status }) {
    const offset = (page - 1) * limit
    const where = {}
    
    if (status) {
      where.contest_status = status
    }

    try {
      const { count, rows } = await Contest.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'first_name', 'last_name', 'email']
          }
        ],
        limit,
        offset,
        order: [['created_at', 'DESC']]
      })

      logger.info('Получен список конкурсов', {
        metadata: {
          count,
          page,
          status,
          limit
        }
      })
      
      return rows.map(contest => this._formatContest(contest))
    } catch (error) {
      logger.error('Ошибка получения списка конкурсов', {
        metadata: {
          error: {
            message: error.message,
            stack: error.stack
          },
          params: {
            page,
            limit,
            status
          }
        }
      })
      throw error
    }
  }

  async getContestsWithPagination({ page = 1, perPage = 12, search, platformType, status, sortBy, userId }) {
    try {
      const where = {}
      
      if (status) {
        where.contest_status = status
      }
      
      if (Array.isArray(platformType) && platformType.length > 0) {
        where.platform_type = {
          [Op.in]: platformType.map(p => p.toLowerCase())
        }
      }
      
      if (search) {
        where.title = {
          [Op.iLike]: `%${search}%`
        }
      }

      const includes = [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: ContestStats,
          as: 'stats',
          attributes: ['views_count', 'participants_count', 'favorites_count', 'rating']
        }
      ]

      if (userId) {
        includes.push({
          model: FavoriteContest,
          as: 'favorites',
          where: { user_id: userId },
          required: false,
          attributes: []
        })
      }

      const { count, rows } = await Contest.findAndCountAll({
        where,
        include: includes,
        limit: perPage,
        offset: (page - 1) * perPage,
        distinct: true,
        order: [['created_at', 'DESC']]
      })

      logger.info('Получен список конкурсов с фильтрами', {
        metadata: {
          count,
          page,
          search: search || 'нет',
          platforms: platformType || 'все',
          status: status || 'все',
          user_id: userId
        }
      })

      const contestsWithStats = rows.map(contest => {
        const formatted = this._formatContest(contest)
        if (contest.stats) {
          formatted.views_count = contest.stats.views_count
          formatted.participants_count = contest.stats.participants_count
          formatted.favorites_count = contest.stats.favorites_count
          formatted.rating = contest.stats.rating
        }
        if (userId) {
          formatted.is_favorite = contest.favorites && contest.favorites.length > 0
        }
        return formatted
      })

      return {
        data: contestsWithStats,
        count,
        pagination: {
          total: count,
          per_page: perPage,
          current_page: page,
          last_page: Math.ceil(count / perPage)
        },
        filters: {
          search,
          platformType,
          status,
          sortBy
        }
      }
    } catch (error) {
      logger.error('Ошибка получения списка конкурсов', {
        metadata: {
          error: {
            message: error.message,
            stack: error.stack
          },
          params: {
            page,
            perPage,
            search,
            platformType,
            status,
            userId
          }
        }
      })
      throw error
    }
  }

  async getRecentContests(userId) {
    const contests = await Contest.findAll({
      where: {
        contest_status: 'active'
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: FavoriteContest,
          as: 'favorites',
          where: { user_id: userId },
          required: false,
          attributes: []
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    })

    return contests.map(contest => this._formatContest(contest))
  }

  async getContestById(contestId, userId) {
    logger.info('Запрос конкурса:', {
      contestId,
      userId: userId || 'anonymous'
    })

    try {
      const contest = await Contest.findOne({
        where: { id: contestId },
        include: [
          {
            model: User,
            as: 'author',
            attributes: [
              'id', 
              'first_name', 
              'last_name', 
              'email', 
              'rating',
              'avatar',
              'role',
              'is_active',
              'is_blocked'
            ]
          },
          {
            model: ContestParticipation,
            as: 'participations',
            where: userId ? { user_id: userId } : undefined,
            required: false,
            attributes: ['id', 'status', 'created_at']
          },
          {
            model: ContestStats,
            as: 'stats',
            attributes: [
              'views_count', 
              'participants_count', 
              'favorites_count', 
              'rating'
            ]
          }
        ],
        attributes: [
          'id',
          'title',
          'description',
          'platform_type',
          'platform_id',
          'source_url',
          'start_date',
          'end_date',
          'contest_status',
          'prize_value',
          'rules_data',
          'prizes_data',
          'requirements_data',
          'allow_comments',
          'allow_reviews',
          'allow_rating',
          'created_at',
          'updated_at'
        ]
      })

      if (!contest) {
        logger.warn('Конкурс не найден:', { contestId })
        throw new Error('Конкурс не найден')
      }

      // Проверяем, добавлен ли конкурс в избранное
      let isFavorite = false
      if (userId) {
        const favorite = await FavoriteContest.findOne({
          where: {
            contest_id: contestId,
            user_id: userId
          }
        })
        isFavorite = !!favorite
      }

      // Форматируем данные конкурса
      const formattedContest = this._formatContest({
        ...contest.get({ plain: true }),
        is_favorite: isFavorite,
        has_user_participated: contest.participations && contest.participations.length > 0
      })

      // Подробное логирование данных
      logger.debug('Форматированные данные конкурса:', {
        contestId,
        userId: userId || 'anonymous',
        formattedData: formattedContest
      })

      logger.info('Конкурс получен:', {
        contestId,
        userId: userId || 'anonymous',
        title: formattedContest.title,
        platform: formattedContest.platform,
        status: formattedContest.status,
        authorId: contest.author?.id,
        authorName: contest.author ? `${contest.author.first_name} ${contest.author.last_name}` : '',
        stats: {
          views: formattedContest.views_count || 0,
          participants: formattedContest.participants_count || 0,
          favorites: formattedContest.favorites_count || 0,
          rating: formattedContest.rating || 0
        },
        userInteraction: {
          isFavorite,
          hasParticipated: formattedContest.has_user_participated
        },
        dates: {
          created: formattedContest.created_at,
          start: formattedContest.start_date,
          end: formattedContest.end_date
        }
      })

      return formattedContest
    } catch (error) {
      logger.error('Ошибка получения конкурса:', {
        contestId,
        userId: userId || 'anonymous',
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  }

  async createContest(data, userId) {
    try {
      logger.debug('Создание нового конкурса:', data)
      
      const contest = await this.create({
        ...data,
        user_id: userId,
        status: 'draft'
      })

      // Создаем запись статистики для нового конкурса
      await contestStatsService.getStats(contest.id)
      
      logger.debug('Конкурс создан:', contest.id)
      return contest
    } catch (error) {
      throw error
    }
  }

  async updateContest(id, data, userId) {
    try {
      logger.debug('Обновление конкурса:', { id, userId })
      
      const contest = await this.findById(id)
      if (!contest) {
        logger.debug('Конкурс не найден:', id)
        throw new ValidationError('Конкурс не найден')
      }
      
      if (contest.user_id !== userId) {
        logger.debug('Отказано в доступе:', { contestUserId: contest.user_id, requestUserId: userId })
        throw new ForbiddenError('У вас нет прав на редактирование этого конкурса')
      }
      
      const updatedContest = await contest.update(data)
      logger.debug('Конкурс обновлен:', contest.id)
      return updatedContest
    } catch (error) {
      throw error
    }
  }

  async deleteContest(id, userId) {
    try {
      logger.debug('Удаление конкурса:', { id, userId })
      
      const contest = await this.findById(id)
      if (!contest) {
        logger.debug('Конкурс не найден:', id)
        throw new ValidationError('Конкурс не найден')
      }
      
      if (contest.user_id !== userId) {
        logger.debug('Отказано в доступе:', { contestUserId: contest.user_id, requestUserId: userId })
        throw new ForbiddenError('У вас нет прав на удаление этого конкурса')
      }
      
      await contest.destroy()
      logger.debug('Конкурс удален:', id)
      return true
    } catch (error) {
      throw error
    }
  }

  /**
   * Проверяет, участвует ли пользователь в конкурсе
   */
  async hasUserParticipated(contestId, userId) {
    const participation = await ContestParticipation.findOne({
      where: {
        contest_id: contestId,
        user_id: userId
      }
    })
    return !!participation
  }

  /**
   * Добавляет участие пользователя в конкурсе
   */
  async participate(contestId, userId, conditions) {
    try {
      logger.debug('Добавление участия:', { contestId, userId, conditions })
      
      // Проверяем, не участвует ли уже пользователь
      const existingParticipation = await ContestParticipation.findOne({
        where: {
          contest_id: contestId,
          user_id: userId
        }
      })

      if (existingParticipation) {
        throw new Error('Вы уже участвуете в этом конкурсе')
      }
      
      const participation = await ContestParticipation.create({
        contest_id: contestId,
        user_id: userId,
        ...conditions
      })

      // Получаем текущую статистику
      const stats = await contestStatsService.getStats(contestId)
      
      // Увеличиваем количество участников
      await contestStatsService.updateParticipantsCount(contestId, (stats.participants_count || 0) + 1)
      
      logger.info('Участие добавлено:', participation)
      return participation
    } catch (error) {
      logger.error('Error in participate:', error)
      throw error
    }
  }

  /**
   * Добавляет/удаляет конкурс из избранного
   */
  async toggleFavorite(contestId, userId) {
    logger.info('Изменение статуса избранного:', { contestId, userId })

    const transaction = await models.sequelize.transaction()

    try {
      // Получаем конкурс для контекста
      const contest = await Contest.findByPk(contestId, { transaction })
      if (!contest) {
        logger.warn('Конкурс не найден:', { contestId })
        throw new Error('Конкурс не найден')
      }

      // Проверяем, добавлен ли конкурс в избранное
      const favorite = await FavoriteContest.findOne({
        where: { contest_id: contestId, user_id: userId },
        transaction
      })

      let isFavorite = false
      let action = ''

      // Логируем текущее состояние избранного
      const initialFavoritesCount = await FavoriteContest.count({
        where: { contest_id: contestId },
        transaction
      })
      logger.info('Текущее количество избранных:', {
        contestId,
        initialFavoritesCount
      })

      if (favorite) {
        // Если конкурс уже в избранном - удаляем
        await favorite.destroy({ transaction })
        action = 'removed'
        isFavorite = false
      } else {
        // Добавляем конкурс в избранное
        await FavoriteContest.create({
          contest_id: contestId,
          user_id: userId
        }, { transaction })
        action = 'added'
        isFavorite = true
      }

      // Получаем актуальное количество избранных
      const currentFavoritesCount = await FavoriteContest.count({
        where: { contest_id: contestId },
        transaction
      })

      // Получаем текущую статистику
      const stats = await contestStatsService.getStats(contestId)
      
      // Обновляем статистику с сохранением views_count
      await stats.update({
        favorites_count: currentFavoritesCount,
        views_count: stats.views_count,
        participants_count: stats.participants_count,
        rating: stats.rating
      }, { transaction })

      await transaction.commit()

      // Получаем обновленную статистику для логирования
      const updatedStats = await contestStatsService.getStats(contestId)
      logger.info('Статус избранного изменен:', {
        contestId,
        userId,
        action,
        isFavorite,
        contestTitle: contest.title,
        stats: {
          favorites_count: updatedStats.favorites_count,
          views_count: updatedStats.views_count,
          participants_count: updatedStats.participants_count
        }
      })

      return { isFavorite }
    } catch (error) {
      await transaction.rollback()
      logger.error('Ошибка изменения статуса избранного:', {
        contestId,
        userId,
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  }

  /**
   * Получение списка избранных конкурсов пользователя
   * @param {string} userId - ID пользователя
   * @returns {Promise<Array>} Список избранных конкурсов
   */
  async getFavoriteContests(userId) {
    if (!userId) {
      throw new Error('ID пользователя не указан')
    }

    logger.info('Получение избранных конкурсов:', { userId })

    try {
      const contests = await Contest.findAll({
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: FavoriteContest,
            as: 'favorites',
            where: { user_id: userId },
            required: true
          },
          {
            model: ContestStats,
            as: 'stats',
            attributes: ['views_count', 'participants_count', 'favorites_count', 'rating']
          }
        ],
        order: [['created_at', 'DESC']]
      })

      const formattedContests = contests.map(contest => {
        const formatted = this._formatContest(contest)
        if (contest.stats) {
          formatted.views_count = contest.stats.views_count
          formatted.participants_count = contest.stats.participants_count
          formatted.favorites_count = contest.stats.favorites_count
          formatted.rating = contest.stats.rating
        }
        formatted.is_favorite = true
        return formatted
      })

      logger.info('Получены избранные конкурсы:', { 
        userId,
        count: contests.length,
        statuses: contests.map(c => c.contest_status),
        platforms: contests.map(c => c.platform_type),
        totalViews: contests.reduce((sum, c) => sum + (c.stats?.views_count || 0), 0),
        totalParticipants: contests.reduce((sum, c) => sum + (c.stats?.participants_count || 0), 0)
      })

      return formattedContests
    } catch (error) {
      logger.error('Ошибка получения избранных конкурсов:', {
        userId,
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  }

  async getContestsByAuthor(userId) {
    if (!userId) {
      throw new Error('ID автора не указан')
    }

    logger.info('Получение конкурсов автора:', { userId })

    try {
      const contests = await Contest.findAll({
        where: { user_id: userId },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: ContestStats,
            as: 'stats',
            attributes: ['views_count', 'participants_count', 'favorites_count', 'rating']
          }
        ],
        order: [['created_at', 'DESC']]
      })

      const formattedContests = contests.map(contest => {
        const formatted = this._formatContest(contest)
        if (contest.stats) {
          formatted.views_count = contest.stats.views_count
          formatted.participants_count = contest.stats.participants_count
          formatted.favorites_count = contest.stats.favorites_count
          formatted.rating = contest.stats.rating
        }
        return formatted
      })

      logger.info('Получены конкурсы автора:', { 
        userId,
        count: contests.length,
        statuses: contests.map(c => c.contest_status),
        platforms: contests.map(c => c.platform_type),
        totalViews: contests.reduce((sum, c) => sum + (c.stats?.views_count || 0), 0),
        totalParticipants: contests.reduce((sum, c) => sum + (c.stats?.participants_count || 0), 0),
        averageRating: contests.reduce((sum, c) => sum + (c.stats?.rating || 0), 0) / contests.length
      })

      return formattedContests
    } catch (error) {
      logger.error('Ошибка получения конкурсов автора:', {
        userId,
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  }
}

// Создаем экземпляр сервиса
const contestService = new ContestService()

module.exports = {
  getContestsWithPagination: contestService.getContestsWithPagination.bind(contestService),
  getRecentContests: contestService.getRecentContests.bind(contestService),
  getContestById: contestService.getContestById.bind(contestService),
  createContest: contestService.createContest.bind(contestService),
  updateContest: contestService.updateContest.bind(contestService),
  deleteContest: contestService.deleteContest.bind(contestService),
  participate: contestService.participate.bind(contestService),
  hasUserParticipated: contestService.hasUserParticipated.bind(contestService),
  toggleFavorite: contestService.toggleFavorite.bind(contestService),
  getFavoriteContests: contestService.getFavoriteContests.bind(contestService),
  getContestsByAuthor: contestService.getContestsByAuthor.bind(contestService)
} 