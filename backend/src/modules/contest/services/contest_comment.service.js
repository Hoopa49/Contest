const { ContestComment, User } = require('../../../models')
const { ApiError } = require('../../../utils/errors')
const { logger } = require('../../../logging')

class ContestCommentService {
  /**
   * Получение комментариев конкурса
   */
  async getComments(contestId, page = 1, limit = 10) {
    logger.info('Getting comments from service:', { contestId, page, limit })

    const offset = (page - 1) * limit

    // Получаем комментарии первого уровня (без родителя)
    const { rows: comments, count: total } = await ContestComment.findAndCountAll({
      where: {
        contest_id: contestId,
        parent_id: null
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: ContestComment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username', 'avatar']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      offset,
      limit
    })

    const totalPages = Math.ceil(total / limit)

    logger.info('Got comments:', { 
      total,
      commentsCount: comments.length,
      totalPages
    })

    return {
      comments,
      page: parseInt(page),
      totalPages,
      total
    }
  }

  /**
   * Добавление комментария
   */
  async addComment(contestId, userId, content, parentId = null) {
    logger.info('Adding comment from service:', { 
      contestId,
      userId,
      content,
      parentId
    })

    // Создаем комментарий
    const comment = await ContestComment.create({
      contest_id: contestId,
      user_id: userId,
      content,
      parent_id: parentId
    })

    // Получаем комментарий с данными автора
    const commentWithAuthor = await ContestComment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar']
        }
      ]
    })

    logger.info('Added comment:', { commentId: comment.id })

    return commentWithAuthor
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
    const parentComment = await ContestComment.findByPk(parentId)
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
    logger.info('Updating comment from service:', {
      commentId,
      userId,
      content
    })

    const comment = await ContestComment.findByPk(commentId)
    if (!comment) {
      throw new ApiError(404, 'Комментарий не найден')
    }

    if (comment.user_id !== userId) {
      throw new ApiError(403, 'Нет прав на редактирование комментария')
    }

    // Обновляем комментарий
    await comment.update({ content })

    // Получаем обновленный комментарий с данными автора
    const updatedComment = await ContestComment.findByPk(commentId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar']
        }
      ]
    })

    logger.info('Updated comment:', { commentId })

    return updatedComment
  }

  /**
   * Удаление комментария
   */
  async deleteComment(commentId, userId) {
    logger.info('Deleting comment from service:', { commentId, userId })

    const comment = await ContestComment.findByPk(commentId)
    if (!comment) {
      throw new ApiError(404, 'Комментарий не найден')
    }

    if (comment.user_id !== userId) {
      throw new ApiError(403, 'Нет прав на удаление комментария')
    }

    await comment.destroy()

    logger.info('Deleted comment:', { commentId })
  }
}

module.exports = new ContestCommentService() 