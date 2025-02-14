const { initializeModels } = require('../../../models')
const logger = require('../../../logging')
const contestStatsService = require('../../../services/contest_stats.service')

class ContestReviewService {
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

  async getReviews(contestId, page = 1, limit = 10, userId) {
    await this.ensureModels()
    try {
      // Валидация contestId
      if (!contestId || typeof contestId === 'object') {
        logger.error('Invalid contestId:', { contestId })
        throw new Error('Некорректный ID конкурса')
      }

      // Преобразуем в строку и проверяем формат UUID
      const validatedId = contestId.toString()
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(validatedId)) {
        logger.error('Invalid UUID format:', { contestId: validatedId })
        throw new Error('Некорректный формат ID конкурса')
      }

      const offset = (page - 1) * limit

      const { count, rows } = await this.models.ContestReview.findAndCountAll({
        where: { contest_id: validatedId },
        include: [
          {
            model: this.models.User,
            as: 'author',
            attributes: ['id', 'username', 'avatar']
          }
        ],
        attributes: [
          'id', 'rating', 'content', 'is_edited', 'likes_count',
          'created_at', 'updated_at'
        ],
        limit,
        offset,
        order: [['created_at', 'DESC']]
      })

      // Если передан userId, проверяем лайки пользователя
      let userLikes = []
      if (userId) {
        userLikes = await this.models.ReviewLike.findAll({
          where: {
            user_id: userId,
            review_id: rows.map(r => r.id)
          }
        })
      }

      const reviews = rows.map(review => {
        const json = review.toJSON()
        
        try {
          // Получаем сырые значения дат из json
          const rawCreatedAt = json.created_at;
          const rawUpdatedAt = json.updated_at;

          logger.debug('Raw date values:', {
            reviewId: json.id,
            rawCreatedAt,
            rawUpdatedAt,
            createdAtType: typeof rawCreatedAt,
            updatedAtType: typeof rawUpdatedAt
          });

          // Преобразуем даты, учитывая возможные форматы
          let created_at, updated_at;

          if (rawCreatedAt instanceof Date) {
            created_at = rawCreatedAt.toISOString();
          } else if (typeof rawCreatedAt === 'string') {
            // Для строк в формате PostgreSQL (2025-02-09 14:37:01.836+00)
            created_at = new Date(rawCreatedAt.replace(' ', 'T')).toISOString();
          } else {
            logger.error('Invalid created_at format:', {
              reviewId: json.id,
              rawCreatedAt,
              type: typeof rawCreatedAt
            });
            throw new Error(`Некорректный формат даты создания: ${typeof rawCreatedAt}`);
          }

          if (rawUpdatedAt instanceof Date) {
            updated_at = rawUpdatedAt.toISOString();
          } else if (typeof rawUpdatedAt === 'string') {
            updated_at = new Date(rawUpdatedAt.replace(' ', 'T')).toISOString();
          } else {
            // Если дата обновления некорректная, используем дату создания
            updated_at = created_at;
          }

          return {
            ...json,
            is_liked: userLikes.some(like => like.review_id === json.id),
            created_at,
            updated_at
          }
        } catch (error) {
          logger.error('Error processing dates:', { 
            reviewId: json.id,
            error: error.message,
            raw_created_at: json.created_at,
            raw_updated_at: json.updated_at
          });
          throw new Error('Ошибка обработки дат отзыва');
        }
      })

      return {
        reviews,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      }
    } catch (error) {
      logger.error('Error getting reviews:', error)
      throw error
    }
  }

  async addReview(contestId, userId, data) {
    await this.ensureModels()
    try {
      contestId = contestId.toString()
      userId = userId.toString()

      // Проверяем, не оставлял ли пользователь уже отзыв
      const existingReview = await this.models.ContestReview.findOne({
        where: {
          contest_id: contestId,
          user_id: userId
        }
      })

      if (existingReview) {
        throw new Error('Вы уже оставили отзыв для этого конкурса')
      }

      // Создаем отзыв
      const review = await this.models.ContestReview.create({
        contest_id: contestId,
        user_id: userId,
        rating: data.rating,
        content: data.content,
        created_at: new Date(),
        updated_at: new Date()
      })

      // Обновляем рейтинг конкурса
      const stats = await contestStatsService.getStats(contestId)
      const reviews = await this.models.ContestReview.findAll({
        where: { contest_id: contestId },
        attributes: ['rating']
      })

      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
      const averageRating = totalRating / reviews.length

      await stats.update({ rating: averageRating })

      return review
    } catch (error) {
      logger.error('Error adding review:', error)
      throw error
    }
  }

  async updateReview(reviewId, userId, data) {
    await this.ensureModels()
    try {
      reviewId = reviewId.toString()
      userId = userId.toString()

      const review = await this.models.ContestReview.findOne({
        where: {
          id: reviewId,
          user_id: userId
        }
      })

      if (!review) {
        throw new Error('Отзыв не найден или у вас нет прав на его редактирование')
      }

      // Обновляем отзыв
      await review.update({
        rating: data.rating,
        content: data.content,
        is_edited: true,
        updated_at: new Date()
      })

      // Обновляем рейтинг конкурса
      const stats = await contestStatsService.getStats(review.contest_id)
      const reviews = await this.models.ContestReview.findAll({
        where: { contest_id: review.contest_id },
        attributes: ['rating']
      })

      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
      const averageRating = totalRating / reviews.length

      await stats.update({ rating: averageRating })

      return review
    } catch (error) {
      logger.error('Error updating review:', error)
      throw error
    }
  }

  async deleteReview(reviewId, userId) {
    await this.ensureModels()
    try {
      reviewId = reviewId.toString()
      userId = userId.toString()

      const review = await this.models.ContestReview.findOne({
        where: {
          id: reviewId,
          user_id: userId
        }
      })

      if (!review) {
        throw new Error('Отзыв не найден или у вас нет прав на его удаление')
      }

      const contestId = review.contest_id

      // Удаляем отзыв
      await review.destroy()

      // Обновляем рейтинг конкурса
      const stats = await contestStatsService.getStats(contestId)
      const reviews = await this.models.ContestReview.findAll({
        where: { contest_id: contestId },
        attributes: ['rating']
      })

      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0

      await stats.update({ rating: averageRating })

      return contestId
    } catch (error) {
      logger.error('Error deleting review:', error)
      throw error
    }
  }

  async toggleLike(reviewId, userId) {
    await this.ensureModels()
    try {
      reviewId = reviewId.toString()
      userId = userId.toString()

      const like = await this.models.ReviewLike.findOne({
        where: {
          review_id: reviewId,
          user_id: userId
        }
      })

      if (like) {
        await like.destroy()
        await this.models.ContestReview.decrement('likes_count', {
          where: { id: reviewId }
        })
        return false
      } else {
        await this.models.ReviewLike.create({
          review_id: reviewId,
          user_id: userId
        })
        await this.models.ContestReview.increment('likes_count', {
          where: { id: reviewId }
        })
        return true
      }
    } catch (error) {
      logger.error('Error toggling review like:', error)
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