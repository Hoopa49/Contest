import { apiService } from './api.service'
import { tokenService } from './auth/token.service'

const checkAuth = () => {
  const token = tokenService.getAccessToken()
  if (!token) {
    throw new Error('Необходима авторизация')
  }
  return true
}

const reviewApi = {
  /**
   * Получить отзывы конкурса
   * @param {string} contestId - ID конкурса
   * @returns {Promise<Object>} Ответ от сервера
   */
  async getReviews(contestId) {
    try {
      checkAuth()
      const response = await apiService.get(`/contests/${contestId}/reviews`)
      console.log('Reviews response:', response)
      
      if (response.success && response.data) {
        const reviews = Array.isArray(response.data.reviews) ? response.data.reviews : []
        return {
          success: true,
          reviews: reviews.map(review => ({
            ...review,
            isLiked: review.is_liked || false,
            likesCount: review.likes_count || 0
          })),
          total: response.data?.total || 0,
          page: response.data?.page || 1,
          totalPages: response.data?.totalPages || 1
        }
      }
      
      return { 
        success: false,
        message: response.message || 'Не удалось загрузить отзывы'
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      return { 
        success: false,
        message: error.message || 'Не удалось загрузить отзывы'
      }
    }
  },

  /**
   * Добавить отзыв к конкурсу
   * @param {string} contestId - ID конкурса
   * @param {Object} data - Данные отзыва
   * @returns {Promise<Object>} Ответ от сервера
   */
  async addReview(contestId, data) {
    try {
      checkAuth()
      console.log('Raw data received:', {
        contestId,
        data
      })
      
      // Формируем данные для бэкенда
      const requestData = {
        rating: parseInt(data.rating),
        content: data.content || ''
      }
      
      console.log('Request data:', requestData)
      const response = await apiService.post(`/contests/${contestId}/reviews`, requestData)
      
      console.log('Server response:', response)
      
      // Проверяем успешность ответа и наличие данных
      if (response.success && response.data?.review) {
        return {
          success: true,
          data: {
            review: response.data.review,
            contestStats: response.data.contestStats
          }
        }
      }
      
      return {
        success: false,
        message: response.message || 'Не удалось добавить отзыв'
      }
    } catch (error) {
      console.error('Error details:', {
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        requestData: error.config?.data,
        error: error.message
      })
      return {
        success: false,
        message: error.response?.data?.message || 'Не удалось добавить отзыв'
      }
    }
  },

  /**
   * Обновить отзыв
   * @param {string} reviewId - ID отзыва
   * @param {Object} data - Новые данные отзыва
   * @returns {Promise<Object>} Ответ от сервера
   */
  async updateReview(reviewId, data) {
    try {
      checkAuth()
      console.log('Update review request:', {
        reviewId,
        data
      })
      
      const response = await apiService.put(`/contests/reviews/${reviewId}`, data)
      console.log('Update review response:', response)
      
      // Проверяем успешность ответа и наличие данных
      if (response.success && response.data) {
        return {
          success: true,
          data: {
            review: {
              ...response.data.review,
              id: response.data.review.id || reviewId,
              isLiked: response.data.review.is_liked || false,
              likesCount: response.data.review.likes_count || 0,
              rating: response.data.review.rating || data.rating,
              content: response.data.review.content || data.content
            },
            contestStats: response.data.contestStats
          }
        }
      }
      
      return {
        success: false,
        message: response.message || 'Не удалось обновить отзыв'
      }
    } catch (error) {
      console.error('Error updating review:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Не удалось обновить отзыв'
      }
    }
  },

  /**
   * Удалить отзыв
   * @param {string} reviewId - ID отзыва
   * @returns {Promise<Object>} Ответ от сервера
   */
  async deleteReview(reviewId) {
    try {
      checkAuth()
      console.log('Delete review request:', { reviewId })
      
      const response = await apiService.delete(`/contests/reviews/${reviewId}`)
      console.log('Delete review response:', response)
      
      // Проверяем успешность ответа или наличие сообщения об удалении
      if (response.success || response.message === 'Отзыв удален') {
        return { 
          success: true,
          data: {
            contestStats: response.data?.contestStats
          },
          message: 'Отзыв успешно удален'
        }
      }
      
      return {
        success: false,
        message: response.message || 'Не удалось удалить отзыв'
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Не удалось удалить отзыв'
      }
    }
  },

  /**
   * Переключить лайк отзыва
   * @param {string} reviewId - ID отзыва
   * @returns {Promise<Object>} Ответ от сервера
   */
  async toggleLike(reviewId) {
    try {
      checkAuth()
      const response = await apiService.post(`/contests/reviews/${reviewId}/like`)
      console.log('Toggle like response:', response)
      
      if (response.success) {
        // Проверяем различные варианты структуры ответа
        const isLiked = response.data?.is_liked ?? response.data?.isLiked ?? response.data
        const likesCount = response.data?.likes_count ?? response.data?.likesCount ?? null
        
        return { 
          success: true,
          data: {
            isLiked: !!isLiked, // Приводим к булевому значению
            likesCount: typeof likesCount === 'number' ? likesCount : undefined
          }
        }
      }
      return { 
        success: false,
        message: response.message || 'Не удалось обновить лайк'
      }
    } catch (error) {
      console.error('Error toggling review like:', error)
      return { 
        success: false,
        message: error.response?.data?.message || 'Не удалось обновить лайк'
      }
    }
  },

  /**
   * Пожаловаться на отзыв
   * @param {string} reviewId - ID отзыва
   * @param {string} reason - Причина жалобы
   * @returns {Promise<Object>} Ответ от сервера
   */
  async reportReview(reviewId, reason) {
    try {
      checkAuth()
      console.log('Report review request:', { reviewId, reason })
      
      const response = await apiService.post(`/contests/reviews/${reviewId}/report`, { reason })
      console.log('Report review response:', response)
      
      if (response.success) {
        return {
          success: true,
          message: 'Жалоба успешно отправлена'
        }
      }
      
      return {
        success: false,
        message: response.message || 'Не удалось отправить жалобу'
      }
    } catch (error) {
      console.error('Error reporting review:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Не удалось отправить жалобу'
      }
    }
  }
}

export default reviewApi 