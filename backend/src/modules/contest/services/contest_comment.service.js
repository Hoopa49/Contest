const { initializeModels } = require('../../../models')
const { ApiError } = require('../../../utils/errors')
const logger = require('../../../logging')

class ContestCommentService {
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
   * Получение комментариев конкурса
   */
  async getComments(contestId, page = 1, limit = 10) {
    await this.ensureModels()
    try {
      contestId = contestId.toString()
      const offset = (page - 1) * limit

      const { count, rows } = await this.models.ContestComment.findAndCountAll({
        where: { contest_id: contestId },
        include: [
          {
            model: this.models.User,
            as: 'author',
            attributes: ['id', 'username', 'avatar']
          }
        ],
        limit,
        offset,
        order: [['created_at', 'DESC']]
      })

      return {
        comments: rows,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit)
        }
      }
    } catch (error) {
      logger.error('Error getting comments:', error)
      throw error
    }
  }

  /**
   * Добавление комментария
   */
  async addComment(contestId, userId, content) {
    await this.ensureModels()
    try {
      contestId = contestId.toString()
      userId = userId.toString()

      const comment = await this.models.ContestComment.create({
        contest_id: contestId,
        user_id: userId,
        content
      })

      return comment
    } catch (error) {
      logger.error('Error adding comment:', error)
      throw error
    }
  }

  /**
   * Добавление ответа на комментарий
   */
  async addReply(contestId, parentId, userId, content) {
    logger.info('Adding reply from service:', {
      contestId,
      parentId,
      userId,
      content
    })

    // Проверяем существование родительского комментария
    const parentComment = await this.models.ContestComment.findByPk(parentId)
    if (!parentComment) {
      throw new ApiError(404, 'Родительский комментарий не найден')
    }

    // Создаем ответ
    const reply = await this.addComment(contestId, userId, content, parentId)

    logger.info('Added reply:', { replyId: reply.id })

    return reply
  }

  /**
   * Обновление комментария
   */
  async updateComment(commentId, userId, content) {
    await this.ensureModels()
    try {
      commentId = commentId.toString()
      userId = userId.toString()

      const comment = await this.models.ContestComment.findOne({
        where: {
          id: commentId,
          user_id: userId
        }
      })

      if (!comment) {
        throw new Error('Комментарий не найден или у вас нет прав на его редактирование')
      }

      await comment.update({
        content,
        is_edited: true
      })

      return comment
    } catch (error) {
      logger.error('Error updating comment:', error)
      throw error
    }
  }

  /**
   * Удаление комментария
   */
  async deleteComment(commentId, userId) {
    await this.ensureModels()
    try {
      commentId = commentId.toString()
      userId = userId.toString()

      const comment = await this.models.ContestComment.findOne({
        where: {
          id: commentId,
          user_id: userId
        }
      })

      if (!comment) {
        throw new Error('Комментарий не найден или у вас нет прав на его удаление')
      }

      await comment.destroy()
      return true
    } catch (error) {
      logger.error('Error deleting comment:', error)
      throw error
    }
  }
}

module.exports = new ContestCommentService() 