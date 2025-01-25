const models = require('../models')
const { logger } = require('../logging')

class ContestStatsService {
  /**
   * Получение статистики конкурса
   */
  async getStats(contestId) {
    try {
      let stats = await models.ContestStats.findOne({
        where: { contest_id: contestId }
      })

      if (!stats) {
        stats = await models.ContestStats.create({
          contest_id: contestId,
          views_count: 0,
          participants_count: 0,
          favorites_count: 0,
          rating: 0
        })
        logger.info('Создана новая статистика конкурса:', { contestId })
      }

      return stats
    } catch (error) {
      logger.error('Ошибка получения статистики конкурса:', {
        contestId,
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  }

  /**
   * Обновление просмотров
   */
  async incrementViews(contestId) {
    try {
      const stats = await this.getStats(contestId)
      await stats.increment('views_count')
      return stats
    } catch (error) {
      logger.error('Ошибка увеличения просмотров:', {
        contestId,
        error: error.message
      })
      throw error
    }
  }

  /**
   * Обновление количества участников
   */
  async updateParticipantsCount(contestId, count) {
    try {
      const stats = await this.getStats(contestId)
      const oldCount = stats.participants_count
      await stats.update({ participants_count: count })
      
      logger.info('Обновлено количество участников:', {
        contestId,
        oldCount,
        newCount: count,
        change: count - oldCount
      })
      
      return stats
    } catch (error) {
      logger.error('Ошибка обновления количества участников:', {
        contestId,
        count,
        error: error.message
      })
      throw error
    }
  }

  /**
   * Обновление количества избранных
   */
  async updateFavoritesCount(contestId, count) {
    try {
      logger.info('Начало обновления количества избранных:', {
        contestId,
        newCount: count
      })

      const stats = await this.getStats(contestId)
      const oldCount = stats.favorites_count

      logger.info('Текущая статистика перед обновлением:', {
        contestId,
        stats: {
          id: stats.id,
          favorites_count: stats.favorites_count,
          views_count: stats.views_count,
          participants_count: stats.participants_count
        }
      })

      // Проверяем валидность нового значения
      if (typeof count !== 'number' || count < 0) {
        logger.error('Некорректное значение счетчика избранных:', {
          contestId,
          count,
          type: typeof count
        })
        throw new Error('Некорректное значение счетчика избранных')
      }

      await stats.update({ favorites_count: count })
      
      // Проверяем обновленное значение
      const updatedStats = await this.getStats(contestId)
      logger.info('Статистика после обновления:', {
        contestId,
        stats: {
          id: updatedStats.id,
          favorites_count: updatedStats.favorites_count,
          views_count: updatedStats.views_count,
          participants_count: updatedStats.participants_count
        }
      })
      
      logger.info('Обновлено количество избранных:', {
        contestId,
        oldCount,
        newCount: count,
        change: count - oldCount,
        finalCount: updatedStats.favorites_count
      })
      
      return stats
    } catch (error) {
      logger.error('Ошибка обновления избранных:', {
        contestId,
        count,
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  }

  /**
   * Обновление рейтинга
   */
  async updateRating(contestId, rating) {
    try {
      const stats = await this.getStats(contestId)
      const oldRating = stats.rating
      await stats.update({ rating })

      logger.info('Обновлен рейтинг конкурса:', {
        contestId,
        oldRating,
        newRating: rating,
        change: rating - oldRating
      })

      const contest = await models.Contest.findByPk(contestId)
      if (contest) {
        await this.updateOrganizerRating(contest.user_id)
      }

      return stats
    } catch (error) {
      logger.error('Ошибка обновления рейтинга:', {
        contestId,
        rating,
        error: error.message
      })
      throw error
    }
  }

  /**
   * Добавление данных активности
   */
  async addActivityData(contestId, data) {
    try {
      const stats = await this.getStats(contestId)
      const activityData = stats.activity_data || []
      activityData.push(data)
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
  async updateOrganizerRating(userId) {
    try {
      // Получаем все конкурсы пользователя
      const contests = await models.Contest.findAll({
        where: { user_id: userId }
      })

      if (!contests.length) {
        logger.info('Нет конкурсов для обновления рейтинга:', { userId })
        return
      }

      // Считаем средний рейтинг
      const totalRating = contests.reduce((sum, contest) => {
        return sum + (contest.rating || 0)
      }, 0)
      const averageRating = totalRating / contests.length

      // Обновляем рейтинг организатора
      await models.User.update(
        { organizer_rating: averageRating },
        { where: { id: userId } }
      )

      logger.info('Обновлен рейтинг организатора:', { 
        userId,
        rating: averageRating 
      })
    } catch (error) {
      logger.error('Ошибка обновления рейтинга организатора:', {
        userId,
        error: error.message
      })
      throw error
    }
  }

  async updateContestStats(contestId) {
    try {
      const contest = await models.Contest.findByPk(contestId)

      if (!contest) {
        logger.warn('Конкурс не найден:', { contestId })
        return
      }

      // Получаем текущую статистику
      const stats = await this.getStats(contestId)
      logger.info('Текущая статистика:', {
        contestId,
        currentStats: {
          favorites_count: stats.favorites_count,
          participants_count: stats.participants_count,
          rating: stats.rating,
          views_count: stats.views_count
        }
      })
      
      // Получаем актуальное количество избранных
      const favorites = await models.FavoriteContest.count({
        where: { contest_id: contestId }
      })
      logger.info('Подсчитано количество записей в favorites:', {
        contestId,
        favoritesCount: favorites
      })

      // Получаем количество участников
      const participants = await models.ContestParticipation.count({
        where: { contest_id: contestId }
      })
      logger.info('Подсчитано количество участников:', {
        contestId,
        participantsCount: participants
      })

      // Получаем средний рейтинг из отзывов
      const reviews = await models.ContestReview.findAll({
        where: { contest_id: contestId },
        attributes: [
          [models.sequelize.fn('AVG', models.sequelize.col('rating')), 'avg_rating']
        ]
      })
      const rating = reviews[0]?.get('avg_rating') || 0
      logger.info('Подсчитан средний рейтинг:', {
        contestId,
        rating
      })

      logger.info('Подсчитана статистика конкурса:', {
        contestId,
        favorites,
        participants,
        rating
      })
      
      // Обновляем статистику
      const updateResult = await stats.update({
        favorites_count: favorites,
        participants_count: participants,
        rating: parseFloat(rating)
      })
      logger.info('Результат обновления:', {
        contestId,
        updateResult: {
          favorites_count: updateResult.favorites_count,
          participants_count: updateResult.participants_count,
          rating: updateResult.rating
        }
      })

      // Проверяем, что обновление прошло успешно
      const verifyStats = await this.getStats(contestId)
      logger.info('Проверка обновленной статистики:', {
        contestId,
        verifyStats: {
          favorites_count: verifyStats.favorites_count,
          participants_count: verifyStats.participants_count,
          rating: verifyStats.rating,
          views_count: verifyStats.views_count
        }
      })

      return stats
    } catch (error) {
      logger.error('Ошибка обновления статистики конкурса:', {
        contestId,
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  }
}

module.exports = new ContestStatsService() 