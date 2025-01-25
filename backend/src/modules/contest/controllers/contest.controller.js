const contestService = require('../services/contest.service')
const contestStatsService = require('../../../services/contest_stats.service')
const BaseController = require('../../../controllers/base.controller')
const { logger } = require('../../../logging')

class ContestController extends BaseController {
  constructor() {
    super()
    this.service = contestService

    // Привязываем методы к контексту
    this.getContests = this.getContests.bind(this)
    this.getContestById = this.getContestById.bind(this)
    this.createContest = this.createContest.bind(this)
    this.updateContest = this.updateContest.bind(this)
    this.deleteContest = this.deleteContest.bind(this)
    this.participate = this.participate.bind(this)
    this.toggleFavorite = this.toggleFavorite.bind(this)
    this.getFavoriteContests = this.getFavoriteContests.bind(this)
    this.getRecentContests = this.getRecentContests.bind(this)
    this.getContestStats = this.getContestStats.bind(this)
  }

  /**
   * Получение списка конкурсов
   */
  async getContests(req, res) {
    return this.handleAsync(async () => {
      const { page, perPage, search, platform_type, status, sortBy } = req.query
      const userId = req.user?.id
      const result = await this.service.getContestsWithPagination({
        page: parseInt(page) || 1,
        perPage: parseInt(perPage) || 12,
        search,
        platformType: platform_type,
        status,
        sortBy,
        userId
      })

      res.json({
        success: true,
        data: result.data,
        meta: {
          pagination: result.pagination
        }
      })
    })(req, res)
  }

  /**
   * Получение конкурса по ID
   */
  async getContestById(req, res) {
    return this.handleAsync(async () => {
      const { id } = req.params
      const userId = req.user?.id
      const contest = await this.service.getContestById(id, userId)
      res.json({
        success: true,
        data: contest
      })
    })(req, res)
  }

  /**
   * Создание нового конкурса
   */
  async createContest(req, res) {
    return this.handleAsync(async () => {
      const contest = await this.service.createContest({
        ...req.body,
        userId: req.user.id
      })
      res.status(201).json({
        success: true,
        data: contest
      })
    })(req, res)
  }

  /**
   * Обновление конкурса
   */
  async updateContest(req, res) {
    return this.handleAsync(async () => {
      const { id } = req.params
      const contest = await this.service.updateContest(id, req.body, req.user.id)
      res.json({
        success: true,
        data: contest
      })
    })(req, res)
  }

  /**
   * Удаление конкурса
   */
  async deleteContest(req, res) {
    return this.handleAsync(async () => {
      const { id } = req.params
      await this.service.deleteContest(id, req.user.id)
      res.status(204).end()
    })(req, res)
  }

  /**
   * Участие в конкурсе
   */
  async participate(req, res) {
    return this.handleAsync(async () => {
      const { id } = req.params
      const { conditions } = req.body
      const result = await this.service.participate(id, req.user.id, conditions)
      res.json({
        success: true,
        data: result
      })
    })(req, res)
  }

  /**
   * Добавление/удаление конкурса из избранного
   */
  async toggleFavorite(req, res) {
    return this.handleAsync(async () => {
      const { id } = req.params
      const userId = req.user?.id
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Требуется авторизация'
        })
      }

      // Получаем обновленные данные от сервиса
      const result = await this.service.toggleFavorite(id, userId)
      
      if (typeof result?.isFavorite !== 'boolean') {
        log.error('Invalid service response:', result)
        return res.status(500).json({
          success: false,
          message: 'Некорректный ответ сервиса'
        })
      }
      
      res.json({
        success: true,
        data: { isFavorite: result.isFavorite }
      })
    })(req, res)
  }

  /**
   * Получение избранных конкурсов
   */
  async getFavoriteContests(req, res) {
    return this.handleAsync(async () => {
      const userId = req.user?.id
      if (!userId) {
        return res.json({
          success: true,
          data: []
        })
      }
      const contests = await this.service.getFavoriteContests(userId)
      res.json({
        success: true,
        data: contests
      })
    })(req, res)
  }

  /**
   * Получение недавних конкурсов
   */
  async getRecentContests(req, res) {
    return this.handleAsync(async () => {
      const userId = req.user?.id
      const contests = await this.service.getRecentContests(userId)
      res.json({
        success: true,
        data: contests
      })
    })(req, res)
  }

  /**
   * Получение статистики конкурса
   */
  async getContestStats(req, res) {
    return this.handleAsync(async () => {
      const { id } = req.params
      
      // Получаем статистику
      const stats = await contestStatsService.getStats(id)
      
      // Увеличиваем счетчик просмотров
      await contestStatsService.incrementViews(id)

      res.json({
        success: true,
        data: stats
      })
    })(req, res)
  }
}

// Экспортируем экземпляр контроллера
const controller = new ContestController()
module.exports = {
  getContests: controller.getContests,
  getContestById: controller.getContestById,
  createContest: controller.createContest,
  updateContest: controller.updateContest,
  deleteContest: controller.deleteContest,
  participate: controller.participate,
  toggleFavorite: controller.toggleFavorite,
  getFavoriteContests: controller.getFavoriteContests,
  getRecentContests: controller.getRecentContests,
  getContestStats: controller.getContestStats
} 