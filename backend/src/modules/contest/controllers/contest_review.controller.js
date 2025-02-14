const contestReviewService = require('../services/contest_review.service')
const { logger } = require('../../../logging')
const contestStatsService = require('../../../services/contest_stats.service')

class ContestReviewController {
  async getReviews(req, res) {
    try {
      const { id } = req.params
      const { page = 1, limit = 10 } = req.query
      const userId = req.user?.id
      
      const result = await contestReviewService.getReviews(
        id,
        parseInt(page),
        parseInt(limit),
        userId
      )

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      logger.error('Error getting reviews:', error)
      res.status(500).json({
        success: false,
        message: 'Не удалось загрузить отзывы'
      })
    }
  }

  async addReview(req, res) {
    try {
      const { id } = req.params
      const { rating, content } = req.body
      const userId = req.user.id
      
      const review = await contestReviewService.addReview(
        id,
        userId,
        { rating, content }
      )

      // Получаем обновленную статистику конкурса
      const stats = await contestStatsService.getStats(id)

      res.json({
        success: true,
        data: { 
          review,
          contestStats: {
            rating: stats.rating
          }
        }
      })
    } catch (error) {
      logger.error('Error adding review:', error)
      res.status(500).json({
        success: false,
        message: 'Не удалось добавить отзыв'
      })
    }
  }

  async updateReview(req, res) {
    try {
      const { reviewId } = req.params
      const { rating, content } = req.body
      const userId = req.user.id

      const review = await contestReviewService.updateReview(
        reviewId,
        userId,
        { rating, content }
      )

      const stats = await contestStatsService.getStats(review.contest_id)

      res.json({
        success: true,
        data: { 
          review,
          contestStats: {
            rating: stats.rating
          }
        }
      })
    } catch (error) {
      logger.error('Error updating review:', error)
      res.status(500).json({
        success: false,
        message: 'Не удалось обновить отзыв'
      })
    }
  }

  async deleteReview(req, res) {
    try {
      const { reviewId } = req.params
      const userId = req.user.id
      
      const contestId = await contestReviewService.deleteReview(reviewId, userId)
      
      if (!contestId) {
        throw new Error('Не удалось получить ID конкурса')
      }
      
      // Получаем обновленную статистику конкурса
      const stats = await contestStatsService.getStats(contestId)

      res.json({
        success: true,
        message: 'Отзыв удален',
        data: {
          contestStats: {
            rating: stats.rating
          }
        }
      })
    } catch (error) {
      logger.error('Error deleting review:', error)
      res.status(500).json({
        success: false,
        message: 'Не удалось удалить отзыв'
      })
    }
  }

  async toggleLike(req, res) {
    try {
      const { reviewId } = req.params
      const userId = req.user.id
      const result = await contestReviewService.toggleLike(reviewId, userId)

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      logger.error('Error toggling review like:', error)
      res.status(500).json({
        success: false,
        message: 'Не удалось обновить лайк'
      })
    }
  }

  async reportReview(req, res) {
    try {
      const { reviewId } = req.params
      const { reason } = req.body
      const userId = req.user.id
      const result = await contestReviewService.reportReview(reviewId, userId, reason)

      res.json({
        success: true,
        message: 'Жалоба отправлена'
      })
    } catch (error) {
      logger.error('Error reporting review:', error)
      res.status(500).json({
        success: false,
        message: 'Не удалось отправить жалобу'
      })
    }
  }
}

module.exports = new ContestReviewController() 