const { ContestReview, User, Contest, ReviewLike } = require('../../../models')
const { logger } = require('../../../logging')
const contestStatsService = require('../../../services/contest_stats.service')

class ContestReviewService {
  async getReviews(contestId, page = 1, limit = 10, userId = null) {
    try {
      const reviews = await ContestReview.findAndCountAll({
        where: { contest_id: contestId },
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'first_name', 'last_name', 'email', 'avatar']
          },
          {
            model: User,
            as: 'liked_by',
            attributes: ['id'],
            through: { attributes: [] }
          }
        ],
        order: [['created_at', 'DESC']],
        limit: limit,
        offset: (page - 1) * limit
      })

      const formattedReviews = reviews.rows.map(review => {
        const reviewJson = review.toJSON()
        return {
          ...reviewJson,
          author: {
            id: reviewJson.author.id,
            username: `${reviewJson.author.first_name} ${reviewJson.author.last_name}`.trim(),
            avatar: reviewJson.author.avatar
          },
          is_liked: userId ? reviewJson.liked_by.some(user => user.id === userId) : false,
          likes_count: reviewJson.likes_count || 0
        }
      })

      logger.info('Получены отзывы для конкурса:', { 
        contestId,
        count: reviews.count 
      })

      return {
        reviews: formattedReviews,
        total: reviews.count,
        page: page,
        totalPages: Math.ceil(reviews.count / limit)
      }
    } catch (error) {
      logger.error('Ошибка получения отзывов:', {
        contestId,
        error: error.message
      })
      throw error
    }
  }

  async addReview(contestId, userId, data) {
    try {
      const review = await ContestReview.create({
        contest_id: contestId,
        user_id: userId,
        ...data
      })

      logger.info('Добавлен новый отзыв:', { 
        contestId,
        userId,
        reviewId: review.id 
      })

      return review
    } catch (error) {
      logger.error('Ошибка добавления отзыва:', {
        contestId,
        userId,
        error: error.message
      })
      throw error
    }
  }

  async updateReview(reviewId, userId, data) {
    try {
      const review = await ContestReview.findByPk(reviewId)

      if (!review) {
        logger.warn('Отзыв не найден:', { reviewId })
        throw new Error('REVIEW_NOT_FOUND')
      }

      if (review.user_id !== userId) {
        logger.warn('Отказано в доступе к отзыву:', { 
          reviewId,
          ownerId: review.user_id,
          requesterId: userId 
        })
        throw new Error('ACCESS_DENIED')
      }

      await review.update(data)
      logger.info('Отзыв обновлен:', { reviewId })

      return review
    } catch (error) {
      logger.error('Ошибка обновления отзыва:', {
        reviewId,
        userId,
        error: error.message
      })
      throw error
    }
  }

  async deleteReview(reviewId, userId) {
    try {
      const review = await ContestReview.findOne({
        where: { id: reviewId, user_id: userId }
      })

      if (!review) {
        throw new Error('Отзыв не найден')
      }

      const contestId = review.contest_id
      await review.destroy()

      // Пересчитываем средний рейтинг
      const reviews = await ContestReview.findAll({
        where: { contest_id: contestId }
      })

      let averageRating = 0
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
        averageRating = totalRating / reviews.length
      }

      await contestStatsService.updateRating(contestId, averageRating)

      return contestId
    } catch (error) {
      logger.error('Error deleting review:', error)
      throw error
    }
  }

  async toggleLike(reviewId, userId) {
    try {
      const like = await ReviewLike.findOne({
        where: { review_id: reviewId, user_id: userId }
      })

      if (like) {
        await like.destroy()
        logger.info('Лайк удален:', { reviewId, userId })
        return false
      } else {
        await ReviewLike.create({
          review_id: reviewId,
          user_id: userId
        })
        logger.info('Лайк добавлен:', { reviewId, userId })
        return true
      }
    } catch (error) {
      logger.error('Ошибка при работе с лайками:', {
        reviewId,
        userId,
        error: error.message
      })
      throw error
    }
  }

  async reportReview(reviewId, userId, reason) {
    try {
      const report = await this.reportModel.create({
        review_id: reviewId,
        user_id: userId,
        reason
      })

      logger.info('Отзыв помечен как спам:', { 
        reviewId,
        userId,
        reportId: report.id 
      })

      return report
    } catch (error) {
      logger.error('Ошибка отправки жалобы:', {
        reviewId,
        userId,
        error: error.message
      })
      throw error
    }
  }
}

module.exports = new ContestReviewService() 