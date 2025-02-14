const { initializeModels } = require('../models')
const logger = require('../logging')

class ContestStatsService {
  constructor() {
    this.models = null
  }

  async ensureModels() {
    if (!this.models) {
      this.models = await initializeModels()
      if (!this.models) {
        throw new Error('Не удалось инициализировать модели')
      }
    }
  }

  /**
   * Получение статистики конкурса
   */
  async getStats(contestId) {
    await this.ensureModels()
    try {
      contestId = contestId.toString()
      let stats = await this.models.ContestStats.findOne({
        where: { contest_id: contestId }
      })

      if (!stats) {
        stats = await this.models.ContestStats.create({
          contest_id: contestId,
          views_count: 0,
          participants_count: 0,
          favorites_count: 0,
          rating: 0,
          activity_data: {}
        })
      }

      return stats
    } catch (error) {
      logger.error('Error getting contest stats:', error)
      throw error
    }
  }

  /**
   * Обновление просмотров
   */
  async incrementViews(contestId) {
    await this.ensureModels()
    try {
      contestId = contestId.toString()
      const stats = await this.getStats(contestId)
      await stats.increment('views_count')
      return stats
    } catch (error) {
      logger.error('Error incrementing views:', error)
      throw error
    }
  }

  /**
   * Обновление количества участников
   */
  async updateParticipantsCount(contestId, count) {
    await this.ensureModels()
    try {
      contestId = contestId.toString()
      const stats = await this.getStats(contestId)
      await stats.update({ participants_count: count })

      logger.info('Updated participants count:', {
        contestId,
        count
      })

      return stats
    } catch (error) {
      logger.error('Error updating participants count:', error)
      throw error
    }
  }

  /**
   * Обновление количества избранных
   */
  async updateFavoritesCount(contestId, count) {
    await this.ensureModels()
    try {
      contestId = contestId.toString()
      const stats = await this.getStats(contestId)
      await stats.update({ favorites_count: count })

      logger.info('Updated favorites count:', {
        contestId,
        count
      })

      return stats
    } catch (error) {
      logger.error('Error updating favorites count:', error)
      throw error
    }
  }

  /**
   * Обновление рейтинга
   */
  async updateRating(contestId, rating) {
    await this.ensureModels()
    try {
      contestId = contestId.toString()
      const stats = await this.getStats(contestId)
      await stats.update({ rating })

      logger.info('Updated rating:', {
        contestId,
        rating
      })

      // Обновляем рейтинг организатора
      const contest = await this.models.Contest.findByPk(contestId)
      if (contest) {
        await this.updateOrganizerRating(contest.organizer_id)
      }

      return stats
    } catch (error) {
      logger.error('Error updating rating:', error)
      throw error
    }
  }

  /**
   * Добавление данных активности
   */
  async addActivityData(contestId, data) {
    await this.ensureModels()
    try {
      contestId = contestId.toString()
      const stats = await this.getStats(contestId)

      const activityData = stats.activity_data || {}
      const timestamp = new Date().toISOString()

      // Обновляем данные активности
      Object.entries(data).forEach(([key, value]) => {
        if (!activityData[key]) {
          activityData[key] = []
        }

        // Добавляем новую запись
        activityData[key].push({
          timestamp,
          value
        })

        // Оставляем только последние 100 записей
        if (activityData[key].length > 100) {
          activityData[key] = activityData[key].slice(-100)
        }
      })

      await stats.update({ activity_data: activityData })
      return stats
    } catch (error) {
      logger.error('Error adding activity data:', error)
      throw error
    }
  }

  /**
   * Обновление рейтинга организатора
   */
  async updateOrganizerRating(organizerId) {
    await this.ensureModels()
    try {
      organizerId = organizerId.toString()

      // Получаем все конкурсы организатора
      const contests = await this.models.Contest.findAll({
        where: { organizer_id: organizerId }
      })

      if (contests.length === 0) {
        return 0
      }

      // Собираем рейтинги всех конкурсов
      const ratings = []
      for (const contest of contests) {
        const stats = await this.getStats(contest.id)
        if (stats.rating > 0) {
          ratings.push(stats.rating)
        }
      }

      // Вычисляем средний рейтинг
      let averageRating = 0
      if (ratings.length > 0) {
        averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      }

      // Обновляем рейтинг организатора
      await this.models.User.update(
        { rating: averageRating },
        { where: { id: organizerId } }
      )

      return averageRating
    } catch (error) {
      logger.error('Error updating organizer rating:', error)
      throw error
    }
  }

  async updateContestStats(contestId) {
    await this.ensureModels()
    try {
      contestId = contestId.toString()

      const contest = await this.models.Contest.findByPk(contestId)
      if (!contest) {
        logger.warn('Конкурс не найден:', { contestId })
        return null
      }

      const stats = await this.getStats(contestId)

      // Обновляем количество участников
      const participantsCount = await this.models.ContestParticipant.count({
        where: { contest_id: contestId }
      })

      // Обновляем количество избранных
      const favoritesCount = await this.models.FavoriteContest.count({
        where: { contest_id: contestId }
      })

      // Обновляем рейтинг
      const reviews = await this.models.ContestReview.findAll({
        where: { contest_id: contestId },
        attributes: ['rating']
      })

      let rating = 0
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
        rating = totalRating / reviews.length
      }

      await stats.update({
        participants_count: participantsCount,
        favorites_count: favoritesCount,
        rating
      })

      logger.info('Updated contest stats:', {
        contestId,
        participantsCount,
        favoritesCount,
        rating
      })

      return stats
    } catch (error) {
      logger.error('Error updating contest stats:', error)
      throw error
    }
  }
}

module.exports = new ContestStatsService() 