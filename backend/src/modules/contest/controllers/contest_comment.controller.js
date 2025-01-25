const { ApiError } = require('../../../utils/errors')
const contestCommentService = require('../services/contest_comment.service')
const { logger } = require('../../../logging')

class ContestCommentController {
  /**
   * Получение комментариев конкурса
   */
  async getComments(req, res, next) {
    try {
      const { id: contestId } = req.params
      const { page = 1, limit = 10 } = req.query

      logger.info('Getting contest comments:', { contestId, page, limit })

      const result = await contestCommentService.getComments(contestId, page, limit)
      
      logger.info('Got contest comments:', { 
        contestId,
        commentsCount: result.comments.length,
        totalPages: result.totalPages
      })

      res.json(result)
    } catch (error) {
      logger.error('Error getting contest comments:', error)
      next(error)
    }
  }

  /**
   * Добавление комментария
   */
  async addComment(req, res, next) {
    try {
      const { id: contestId } = req.params
      const { content, parentId } = req.body
      const userId = req.user.id

      logger.info('Adding comment:', { contestId, userId, content, parentId })

      if (!content?.trim()) {
        throw new ApiError(400, 'Комментарий не может быть пустым')
      }

      const comment = await contestCommentService.addComment(contestId, userId, content, parentId)
      
      logger.info('Added comment:', { commentId: comment.id })

      res.json(comment)
    } catch (error) {
      logger.error('Error adding comment:', error)
      next(error)
    }
  }

  /**
   * Добавление ответа на комментарий
   */
  async addReply(req, res, next) {
    try {
      const { id: contestId, commentId } = req.params
      const { content } = req.body
      const userId = req.user.id

      logger.info('Adding reply:', { contestId, commentId, userId, content })

      if (!content?.trim()) {
        throw new ApiError(400, 'Ответ не может быть пустым')
      }

      const reply = await contestCommentService.addReply(contestId, commentId, userId, content)
      
      logger.info('Added reply:', { replyId: reply.id })

      res.json(reply)
    } catch (error) {
      logger.error('Error adding reply:', error)
      next(error)
    }
  }

  /**
   * Обновление комментария
   */
  async updateComment(req, res, next) {
    try {
      const { id } = req.params
      const { content } = req.body
      const userId = req.user.id

      logger.info('Updating comment:', { commentId: id, userId, content })

      if (!content?.trim()) {
        throw new ApiError(400, 'Комментарий не может быть пустым')
      }

      const comment = await contestCommentService.updateComment(id, userId, content)
      
      logger.info('Updated comment:', { commentId: comment.id })

      res.json(comment)
    } catch (error) {
      logger.error('Error updating comment:', error)
      next(error)
    }
  }

  /**
   * Удаление комментария
   */
  async deleteComment(req, res, next) {
    try {
      const { id } = req.params
      const userId = req.user.id

      logger.info('Deleting comment:', { commentId: id, userId })

      await contestCommentService.deleteComment(id, userId)
      
      logger.info('Deleted comment:', { commentId: id })

      res.json({ success: true })
    } catch (error) {
      logger.error('Error deleting comment:', error)
      next(error)
    }
  }
}

module.exports = new ContestCommentController() 