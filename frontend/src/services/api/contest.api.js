/**
 * API для работы с конкурсами
 * Методы для получения и управления конкурсами
 */

import http from '../../utils/axios'

class ContestAPI {
  /**
   * Получение списка конкурсов с фильтрацией и пагинацией
   */
  async getContests(params) {
    try {
      console.debug('Fetching contests with params:', params)
      
      // Преобразуем параметры для API
      const requestParams = {
        ...params,
        platformType: Array.isArray(params.platform_type) ? params.platform_type : [],
        _t: Date.now()
      }
      
      // Удаляем старый параметр
      delete requestParams.platform_type
      
      // Если массив платформ пустой, удаляем параметр
      if (requestParams.platformType.length === 0) {
        delete requestParams.platformType
      }
      
      // Логируем запрос
      const requestConfig = {
        params: requestParams,
        headers: {
          ...http.defaults.headers,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }
      
      // Логируем полный URL запроса
      const fullUrl = http.getUri({
        url: '/contests',
        params: requestParams
      })
      console.debug('Full request URL:', fullUrl)
      
      const response = await http.get('/contests', requestConfig)
      console.debug('Raw API response:', response)
      
      // Проверяем формат ответа
      if (!response?.data?.success) {
        console.error('Invalid response format:', response)
        throw new Error('Invalid response format')
      }

      // Получаем данные и пагинацию
      const { data, meta } = response.data
      console.debug('Received contests:', {
        count: data?.length,
        pagination: meta?.pagination,
        filters: params,
        data: data
      })

      return {
        data: data || [],
        pagination: meta?.pagination || {
          page: 1,
          perPage: 12,
          total: 0,
          totalPages: 0
        }
      }
    } catch (error) {
      console.error('Error in getContests:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      })
      
      // Проверяем тип ошибки
      if (error.response?.status === 401) {
        throw new Error('Требуется авторизация')
      }
      if (error.response?.status === 403) {
        throw new Error('Нет доступа к конкурсам')
      }
      
      throw new Error(error.response?.data?.message || 'Не удалось загрузить конкурсы')
    }
  }

  /**
   * Получение деталей конкурса
   */
  async getContestDetails(id) {
    try {
      console.debug('Fetching contest details:', id)
      
      const response = await http.get(`/contests/${id}`)
      console.debug('Raw API response:', response)
      
      if (!response?.data?.success) {
        console.error('Invalid response format:', response)
        throw new Error('Invalid response format')
      }
      
      const contest = response.data?.data
      
      // Форматируем данные для фронтенда
      if (contest) {
        contest.platform = (contest.platform_type || 'youtube').toLowerCase()
        contest.rating = parseFloat(contest.rating) || 0
        contest.deadline = contest.end_date ? new Date(contest.end_date).toISOString() : null
        
        // Форматируем организатора
        if (!contest.organizer && contest.author) {
          contest.organizer = {
            id: contest.author.id,
            name: contest.author.first_name && contest.author.last_name 
              ? `${contest.author.first_name} ${contest.author.last_name}`.trim()
              : 'Неизвестный организатор',
            avatar: contest.author.avatar || null
          }
        }
        
        // Проверяем наличие массивов
        contest.rules = Array.isArray(contest.rules) ? contest.rules : []
        contest.prizes = Array.isArray(contest.prizes) ? contest.prizes : []
        contest.requirements = Array.isArray(contest.requirements) ? contest.requirements : []
      }
      
      return contest
    } catch (error) {
      console.error('Error in getContestDetails:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
      
      if (error.response?.status === 404) {
        throw new Error('Конкурс не найден')
      }
      if (error.response?.status === 401) {
        throw new Error('Требуется авторизация')
      }
      if (error.response?.status === 403) {
        throw new Error('Нет доступа к конкурсу')
      }
      
      throw new Error(error.response?.data?.message || 'Не удалось загрузить конкурс')
    }
  }

  /**
   * Получение списка всех конкурсов
   */
  async getAll() {
    const response = await http.get('/contests')
    return response.data?.data
  }

  /**
   * Получение конкурса по ID
   */
  async getById(id) {
    const response = await http.get(`/contests/${id}`)
    return response.data?.data
  }

  /**
   * Создание нового конкурса
   */
  async create(contestData) {
    const response = await http.post('/contests', contestData)
    return response.data?.data
  }

  /**
   * Обновление конкурса
   */
  async update(id, contestData) {
    const response = await http.put(`/contests/${id}`, contestData)
    return response.data?.data
  }

  /**
   * Удаление конкурса
   */
  async delete(id) {
    await http.delete(`/contests/${id}`)
  }

  /**
   * Получение черновиков конкурсов
   */
  async getDrafts() {
    const response = await http.get('/contests/drafts')
    return response.data?.data
  }

  /**
   * Публикация конкурса
   */
  async publish(id) {
    const response = await http.post(`/contests/${id}/publish`)
    return response.data?.data
  }

  /**
   * Отмена публикации конкурса
   */
  async unpublish(id) {
    const response = await http.post(`/contests/${id}/unpublish`)
    return response.data?.data
  }

  /**
   * Получение статистики конкурса
   */
  async getStats(id) {
    try {
      console.debug('Fetching contest stats:', id)
      
      const response = await http.get(`/contests/${id}/stats`)
      console.debug('Raw stats response:', JSON.stringify(response.data, null, 2))
      
      if (!response?.data?.success) {
        console.error('Invalid response format:', response)
        throw new Error('Invalid response format')
      }

      // Форматируем даты для графика
      const stats = response.data.data
      if (stats.activityData) {
        stats.activityData = stats.activityData.map(item => ({
          ...item,
          date: new Date(item.date).toLocaleDateString()
        }))
      }

      return stats
    } catch (error) {
      console.error('Error fetching contest stats:', {
        contestId: id,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
      
      if (error.response?.status === 401) {
        throw new Error('Требуется авторизация')
      }
      if (error.response?.status === 403) {
        throw new Error('Нет доступа к статистике')
      }
      
      throw new Error(error.response?.data?.message || 'Не удалось загрузить статистику')
    }
  }

  /**
   * Переключение избранного статуса конкурса
   */
  async toggleFavorite(contestId) {
    try {
      console.debug('Toggling favorite for contest:', contestId)
      
      const response = await http.post(`/contests/${contestId}/favorite`)
      console.debug('Raw API response:', JSON.stringify(response.data, null, 2))
      
      if (!response?.data?.success) {
        console.error('Invalid response format:', response)
        throw new Error('Invalid response format')
      }
      
      // Проверяем структуру данных
      const result = response.data
      console.debug('Parsed response:', {
        success: result.success,
        data: result.data,
        isFavorite: result.data?.isFavorite
      })
      
      if (typeof result.data?.isFavorite !== 'boolean') {
        console.error('Invalid isFavorite value:', result.data)
        throw new Error('Invalid response data')
      }
      
      return result
    } catch (error) {
      console.error('Error in toggleFavorite:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
      
      if (error.response?.status === 401) {
        throw new Error('Требуется авторизация')
      }
      if (error.response?.status === 403) {
        throw new Error('Нет доступа к конкурсу')
      }
      
      throw new Error(error.response?.data?.message || 'Не удалось обновить избранное')
    }
  }

  /**
   * Участие в конкурсе
   */
  async participate(id) {
    try {
      console.debug('Participating in contest:', id)
      
      const response = await http.post(`/contests/${id}/participate`)
      console.debug('Raw API response:', response)
      
      if (!response?.data?.success) {
        console.error('Invalid response format:', response)
        throw new Error('Invalid response format')
      }
      
      return response.data?.data
    } catch (error) {
      console.error('Error in participate:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
      
      if (error.response?.status === 401) {
        throw new Error('Требуется авторизация')
      }
      if (error.response?.status === 403) {
        throw new Error('Нет доступа к конкурсу')
      }
      if (error.response?.status === 409) {
        throw new Error('Вы уже участвуете')
      }
      
      throw new Error(error.response?.data?.message || 'Не удалось отправить заявку на участие')
    }
  }

  /**
   * Получение списка избранных конкурсов пользователя
   */
  async getFavoriteContests() {
    try {
      console.debug('Fetching favorite contests')
      
      const response = await http.get('/contests/favorites')
      
      if (!response?.data?.success) {
        console.error('Invalid response format:', response)
        throw new Error('Invalid response format')
      }

      return response.data
    } catch (error) {
      console.error('Error fetching favorite contests:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
      
      if (error.response?.status === 401) {
        throw new Error('Требуется авторизация')
      }
      
      throw new Error(error.response?.data?.message || 'Не удалось загрузить избранные конкурсы')
    }
  }

  /**
   * Получение конкурса по ID
   */
  async getContest(contestId) {
    try {
      console.debug('Fetching contest details:', contestId)
      
      // Загружаем детали конкурса
      const response = await http.get(`/contests/${contestId}`)
      console.debug('Raw API response:', response)
      
      if (!response?.data?.success) {
        console.error('Invalid response format:', response)
        throw new Error('Invalid response format')
      }

      // Загружаем статистику
      const stats = await this.getStats(contestId)
      
      return {
        data: {
          ...response.data.data,
          stats
        }
      }
    } catch (error) {
      console.error('Error in getContest:', {
        contestId,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
      
      if (error.response?.status === 404) {
        throw new Error('Конкурс не найден')
      }
      if (error.response?.status === 401) {
        throw new Error('Требуется авторизация')
      }
      if (error.response?.status === 403) {
        throw new Error('Нет доступа к конкурсу')
      }
      
      throw new Error(error.response?.data?.message || 'Не удалось загрузить конкурс')
    }
  }
}

export const contestService = new ContestAPI() 