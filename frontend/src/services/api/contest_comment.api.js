import { apiService } from './api.service'

class ContestCommentApi {
  /**
   * Получение комментариев конкурса
   */
  async getComments(contestId, page = 1, limit = 10) {
    try {
      console.log('Getting comments:', { contestId, page, limit })
      const response = await apiService.get(`/contests/${contestId}/comments`, {
        params: { page, limit }
      })
      console.log('Comments response:', response)
      return response
    } catch (error) {
      console.error('Error getting comments:', error)
      throw error
    }
  }

  /**
   * Добавление комментария
   */
  async addComment(contestId, data) {
    try {
      console.log('Adding comment:', { contestId, data })
      const response = await apiService.post(`/contests/${contestId}/comments`, data)
      console.log('Add comment response:', response)
      return response
    } catch (error) {
      console.error('Error adding comment:', error)
      throw error
    }
  }

  /**
   * Добавление ответа на комментарий
   */
  async addReply(contestId, commentId, data) {
    try {
      console.log('Adding reply:', { contestId, commentId, data })
      const response = await apiService.post(`/contests/${contestId}/comments/${commentId}/replies`, data)
      console.log('Add reply response:', response)
      return response
    } catch (error) {
      console.error('Error adding reply:', error)
      throw error
    }
  }

  /**
   * Обновление комментария
   */
  async updateComment(commentId, content) {
    try {
      console.log('Updating comment:', { commentId, content })
      const response = await apiService.put(`/contests/comments/${commentId}`, { content })
      console.log('Update comment response:', response)
      return response
    } catch (error) {
      console.error('Error updating comment:', error)
      throw error
    }
  }

  /**
   * Удаление комментария
   */
  async deleteComment(commentId) {
    try {
      console.log('Deleting comment:', { commentId })
      const response = await apiService.delete(`/contests/comments/${commentId}`)
      console.log('Delete comment response:', response)
      return response
    } catch (error) {
      console.error('Error deleting comment:', error)
      throw error
    }
  }
}

export const contestCommentApi = new ContestCommentApi() 