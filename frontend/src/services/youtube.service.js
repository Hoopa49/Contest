import http from '@/utils/axios'

// Базовый URL для API YouTube
const API_URL = '/admin/integrations/youtube'
const INTEGRATIONS_URL = '/admin/integrations'

// Функция для преобразования camelCase в snake_case
const toSnakeCase = (obj) => {
  const snakeCaseObj = {}
  Object.keys(obj).forEach(key => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
    snakeCaseObj[snakeKey] = obj[key]
  })
  return snakeCaseObj
}

/**
 * Получает статистику использования API YouTube
 * @returns {Promise<Object>} Объект со статистикой использования API
 */
const getApiStats = async () => {
  try {
    console.log('Запрос статистики API YouTube')
    const response = await http.get(`${API_URL}/stats/api`)
    console.log('Ответ статистики API:', response.data)
    
    // Проверяем и форматируем ответ
    if (!response?.data?.success || !response.data.data) {
      console.warn('Получен некорректный ответ от сервера в getApiStats:', response.data)
      return getDefaultStats()
    }

    // Получаем данные из ответа
    const rawData = response.data.data
    
    // Форматируем данные в нужную структуру
    const formattedData = {
      today: rawData.today || null,
      history: Array.isArray(rawData.history) 
        ? rawData.history.map(day => ({
            date: day.date,
            used: parseInt(day.used) || 0,
            limit: parseInt(day.limit) || 10000,
            searchRequests: parseInt(day.searchRequests) || 0,
            videoRequests: parseInt(day.videoRequests) || 0,
            channelRequests: parseInt(day.channelRequests) || 0,
            captionsRequests: parseInt(day.captionsRequests) || 0,
            errorCount: parseInt(day.errorCount) || 0,
            status: day.status || 'active'
          }))
        : [],
      totals: rawData.totals || {
        totalUsed: 0,
        totalSearchRequests: 0,
        totalVideoRequests: 0,
        totalChannelRequests: 0,
        totalCaptionsRequests: 0,
        totalErrors: 0
      }
    }
    
    console.log('Форматированные данные:', formattedData)
    return { 
      success: true,
      data: formattedData 
    }
  } catch (error) {
    console.error('Ошибка при получении статистики API:', error)
    return {
      success: false,
      error: error.message,
      data: getDefaultStats().data
    }
  }
}

// Вспомогательная функция для получения структуры данных по умолчанию
const getDefaultStats = () => ({
  success: true,
  data: {
    today: null,
    history: [],
    totals: {
      totalUsed: 0,
      totalSearchRequests: 0,
      totalVideoRequests: 0,
      totalChannelRequests: 0,
      totalCaptionsRequests: 0,
      totalErrors: 0
    }
  }
})

/**
 * Получение статистики YouTube
 * @returns {Promise<Object>} Объект со статистикой
 */
const getStats = async () => {
  try {
    console.log('Запрос статистики YouTube')
    const response = await http.get(`${API_URL}/stats/contests`)
    console.log('Ответ статистики:', response.data)
    return response.data
  } catch (error) {
    console.error('Ошибка при получении статистики:', error)
    throw error
  }
}

/**
 * Получение списка конкурсных видео
 * @param {Object} params - Параметры запроса
 * @returns {Promise} Список видео
 */
async function getContestVideos(params) {
  try {
    console.log('Отправка запроса на сервер:', `${API_URL}/contests/videos`, { params });
    const response = await http.get(`${API_URL}/contests/videos`, { params });
    console.log('Получен ответ от сервера:', response);
    
    if (!response || !response.data) {
      console.warn('Получен пустой ответ от сервера в getContestVideos');
      return { videos: [], total: 0 };
    }
    
    // Проверяем успешность операции
    if (response.data.success && response.data.data) {
      const { videos, total, page, totalPages } = response.data.data;
      console.log('Данные получены успешно:', { videos, total, page, totalPages });
      return {
        videos: videos || [],
        total: total || 0,
        page: parseInt(page) || 1,
        totalPages: parseInt(totalPages) || 1
      };
    }
    
    // Если данные пришли в виде массива
    if (Array.isArray(response.data)) {
      console.log('Данные пришли в виде массива, форматируем');
      return {
        videos: response.data,
        total: response.data.length,
        page: 1,
        totalPages: 1
      };
    }
    
    // Если структура данных неизвестна
    console.warn('Неизвестная структура данных:', response.data);
    return {
      videos: [],
      total: 0,
      page: 1,
      totalPages: 1
    };
  } catch (error) {
    console.error('Ошибка в getContestVideos:', error);
    throw error;
  }
}

/**
 * Получение списка конкурсных каналов
 * @param {Object} params - Параметры запроса
 * @returns {Promise} Список каналов
 */
async function getContestChannels(params) {
  try {
    console.log('Отправка запроса на сервер:', `${API_URL}/contests/channels`, { params });
    const response = await http.get(`${API_URL}/contests/channels`, { params });
    console.log('Получен ответ от сервера:', response);
    
    if (!response || !response.data) {
      console.warn('Получен пустой ответ от сервера в getContestChannels');
      return { channels: [], total: 0 };
    }
    
    // Проверяем успешность операции
    if (response.data.success && response.data.data) {
      const { channels, total, page, totalPages } = response.data.data;
      console.log('Данные получены успешно:', { channels, total, page, totalPages });
      return {
        channels: channels || [],
        total: total || 0,
        page: parseInt(page) || 1,
        totalPages: parseInt(totalPages) || 1
      };
    }
    
    // Если данные пришли в виде массива
    if (Array.isArray(response.data)) {
      console.log('Данные пришли в виде массива, форматируем');
      return {
        channels: response.data,
        total: response.data.length,
        page: 1,
        totalPages: 1
      };
    }
    
    // Если структура данных неизвестна
    console.warn('Неизвестная структура данных:', response.data);
    return {
      channels: [],
      total: 0,
      page: 1,
      totalPages: 1
    };
  } catch (error) {
    console.error('Ошибка в getContestChannels:', error);
    throw error;
  }
}

export const youtubeService = {
  /**
   * Получение статуса интеграции
   * @returns {Promise} Статус интеграции
   */
  async getIntegrationStatus() {
    const response = await http.get(`${API_URL}/status`)
    return response.data
  },

  /**
   * Переключение статуса интеграции
   * @param {boolean} enabled - Новый статус
   * @returns {Promise} Результат операции
   */
  async toggleIntegration(enabled) {
    const response = await http.post(`${API_URL}/toggle`, { enabled })
    return response.data
  },

  /**
   * Поиск видео по ключевым словам
   * @param {Object} params - Параметры поиска
   * @returns {Promise} Результаты поиска
   */
  async searchVideos(params) {
    try {
      console.log('Отправка запроса поиска:', params)
      
      // Преобразуем даты и форматируем параметры
      const searchParams = {
        query: params.query,
        published_after: params.publishedAfter,
        min_views: params.minViews,
        min_likes: params.minLikes,
        contest_probability: params.contestProbability,
        excluded_channels: params.excludedChannels,
        search_in: params.searchIn,
        max_results: params.maxResults
      }
      
      const response = await http.get(`${API_URL}/search`, { params: searchParams })
      
      if (!response?.data) {
        console.warn('Получен пустой ответ от сервера')
        return { videos: [], total: 0 }
      }
      
      // Форматируем видео для отображения
      const videos = (response.data.videos || []).map(video => ({
        ...video,
        thumbnail: video.thumbnail_url || '',
        videoId: video.youtube_id || '',
        channelTitle: video.channel_title || '',
        viewCount: video.view_count || 0,
        likeCount: video.like_count || 0,
        commentCount: video.comment_count || 0,
        publishedAt: video.published_at || null,
        contest_probability: video.contest_probability || 0
      }))
      
      return {
        videos,
        total: response.data.total || 0,
        nextPageToken: response.data.nextPageToken
      }
    } catch (error) {
      console.error('Ошибка при поиске видео:', error)
      throw error
    }
  },

  /**
   * Запуск автоматического поиска видео
   * @param {Object} params - Параметры поиска
   * @returns {Promise} Статус операции
   */
  async startVideoSearch(params) {
    // Преобразуем camelCase в snake_case перед отправкой
    const snakeCaseParams = toSnakeCase(params)
    const response = await http.post(`${API_URL}/search/start`, snakeCaseParams)
    return response.data
  },

  /**
   * Получение информации о видео
   * @param {string} videoId - ID видео
   * @returns {Promise} Информация о видео
   */
  async getVideoDetails(videoId) {
    const response = await http.get(`${API_URL}/videos/${videoId}`)
    return response.data
  },

  /**
   * Получение информации о канале
   * @param {string} channelId - ID канала
   * @returns {Promise} Информация о канале
   */
  async getChannelDetails(channelId) {
    const response = await http.get(`${API_URL}/channels/${channelId}`)
    return response.data
  },

  /**
   * Получение списка конкурсных видео
   * @param {Object} params - Параметры запроса
   * @returns {Promise} Список видео
   */
  async getContestVideos(params) {
    try {
      console.log('Отправка запроса на сервер:', `${API_URL}/contests/videos`, { params });
      const response = await http.get(`${API_URL}/contests/videos`, { params });
      console.log('Получен ответ от сервера:', response);
      
      if (!response || !response.data) {
        console.warn('Получен пустой ответ от сервера в getContestVideos');
        return { videos: [], total: 0 };
      }
      
      // Проверяем успешность операции
      if (response.data.success && response.data.data) {
        const { videos, total, page, totalPages } = response.data.data;
        console.log('Данные получены успешно:', { videos, total, page, totalPages });
        return {
          videos: videos || [],
          total: total || 0,
          page: parseInt(page) || 1,
          totalPages: parseInt(totalPages) || 1
        };
      }
      
      // Если данные пришли в виде массива
      if (Array.isArray(response.data)) {
        console.log('Данные пришли в виде массива, форматируем');
        return {
          videos: response.data,
          total: response.data.length,
          page: 1,
          totalPages: 1
        };
      }
      
      // Если структура данных неизвестна
      console.warn('Неизвестная структура данных:', response.data);
      return {
        videos: [],
        total: 0,
        page: 1,
        totalPages: 1
      };
    } catch (error) {
      console.error('Ошибка в getContestVideos:', error);
      throw error;
    }
  },

  /**
   * Получение списка каналов с конкурсами
   * @param {Object} params - Параметры запроса
   * @returns {Promise} Список каналов
   */
  async getContestChannels(params) {
    try {
      console.log('Отправка запроса на сервер:', `${API_URL}/contests/channels`, { params });
      const response = await http.get(`${API_URL}/contests/channels`, { params });
      console.log('Получен ответ от сервера:', response);
      
      if (!response || !response.data) {
        console.warn('Получен пустой ответ от сервера в getContestChannels');
        return { channels: [], total: 0 };
      }
      
      // Проверяем успешность операции
      if (response.data.success && response.data.data) {
        const { channels, total, page, totalPages } = response.data.data;
        console.log('Данные получены успешно:', { channels, total, page, totalPages });
        return {
          channels: channels || [],
          total: total || 0,
          page: parseInt(page) || 1,
          totalPages: parseInt(totalPages) || 1
        };
      }
      
      // Если данные пришли в виде массива
      if (Array.isArray(response.data)) {
        console.log('Данные пришли в виде массива, форматируем');
        return {
          channels: response.data,
          total: response.data.length,
          page: 1,
          totalPages: 1
        };
      }
      
      // Если структура данных неизвестна
      console.warn('Неизвестная структура данных:', response.data);
      return {
        channels: [],
        total: 0,
        page: 1,
        totalPages: 1
      };
    } catch (error) {
      console.error('Ошибка в getContestChannels:', error);
      throw error;
    }
  },

  /**
   * Получение статистики интеграции
   * @param {Object} params - Параметры запроса
   * @returns {Promise} Статистика интеграции
   */
  async getContestStats(params) {
    try {
      console.log('Отправка запроса статистики ЮТУБ:', `${INTEGRATIONS_URL}/stats`, { params })
      const response = await http.get(`${INTEGRATIONS_URL}/stats`, { params })
      console.log('Получен ответ от сервера ЮТУБ:', response)
      
      // Проверяем и форматируем ответ
      if (!response || !response.data) {
        console.warn('Получен пустой ответ от сервера в getContestStats')
        return {
          data: {
            total_contests: 0,
            active_contests: 0,
            channels_count: 0,
            avg_prize_value: 0,
            error_count: 0,
            enabled: false,
            last_sync: null,
            daily_stats: []
          }
        }
      }
      
      // Проверяем успешность операции
      if (response.data.success && response.data.data) {
        const stats = response.data.data
        console.log('Данные статистики получены успешно:', stats)
        
        // Находим статистику YouTube среди всех платформ
        const youtubeStats = stats.platforms.find(p => p.platform === 'youtube') || {
          contests_found: 0,
          error_count: 0,
          enabled: false,
          last_sync: null
        }
        
        return {
          data: {
            total_contests: parseInt(youtubeStats.contests_found) || 0,
            active_contests: parseInt(youtubeStats.active_contests) || 0,
            channels_count: parseInt(youtubeStats.channels_count) || 0,
            avg_prize_value: 0,
            error_count: parseInt(youtubeStats.error_count) || 0,
            enabled: youtubeStats.enabled || false,
            last_sync: youtubeStats.last_sync,
            daily_stats: []
          }
        }
      }
      
      // Если данные пришли напрямую
      if (response.data) {
        const stats = response.data
        console.log('Данные статистики получены напрямую:', stats)
        
        // Находим статистику YouTube среди всех платформ
        const youtubeStats = stats.platforms.find(p => p.platform === 'youtube') || {
          contests_found: 0,
          error_count: 0,
          enabled: false,
          last_sync: null
        }
        
        return {
          data: {
            total_contests: parseInt(youtubeStats.contests_found) || 0,
            active_contests: parseInt(youtubeStats.active_contests) || 0,
            channels_count: parseInt(youtubeStats.channels_count) || 0,
            avg_prize_value: 0,
            error_count: parseInt(youtubeStats.error_count) || 0,
            enabled: youtubeStats.enabled || false,
            last_sync: youtubeStats.last_sync,
            daily_stats: []
          }
        }
      }
      
      // Если структура данных неизвестна
      console.warn('Неизвестная структура данных:', response.data)
      return {
        data: {
          total_contests: 0,
          active_contests: 0,
          channels_count: 0,
          avg_prize_value: 0,
          error_count: 0,
          enabled: false,
          last_sync: null,
          daily_stats: []
        }
      }
    } catch (error) {
      console.error('Ошибка в getContestStats:', error)
      throw error
    }
  },

  /**
   * Обновление настроек YouTube API
   * @param {Object} settings - Новые настройки
   * @returns {Promise} Обновленные настройки
   */
  async updateSettings(settings) {
    // Преобразуем camelCase в snake_case перед отправкой
    const snakeCaseSettings = toSnakeCase(settings)
    const response = await http.put(`${API_URL}/settings`, snakeCaseSettings)
    return response.data
  },

  /**
   * Получение текущих настроек
   * @returns {Promise} Текущие настройки
   */
  async getSettings() {
    const response = await http.get(`${API_URL}/settings`)
    return response.data
  },

  getApiStats,

  /**
   * Получение статистики конкурсов
   * @param {Object} params - Параметры запроса
   * @returns {Promise} Статистика конкурсов
   */
  async getContestStats(params = { days: 30 }) {
    try {
      console.log('Запрос статистики конкурсов с параметрами:', params);
      const response = await http.get(`${API_URL}/stats/contests`, { params });
      
      if (!response || !response.data) {
        console.warn('Получен пустой ответ от сервера в getContestStats');
        return null;
      }
      
      // Получаем данные из ответа
      const rawData = response.data.data || response.data;
      
      if (!rawData) {
        console.warn('Некорректная структура данных в ответе:', response.data);
        return null;
      }
      
      // Форматируем данные
      const formattedData = {
        total_contests: parseInt(rawData.total_contests) || 0,
        active_contests: parseInt(rawData.active_contests) || 0,
        channels_count: parseInt(rawData.channels_count) || 0,
        avg_prize_value: parseFloat(rawData.avg_prize_value) || 0,
        contest_types: Array.isArray(rawData.contest_types) 
          ? rawData.contest_types.map(type => ({
              name: type.name || 'Другое',
              count: parseInt(type.count) || 0,
              percentage: parseFloat(type.percentage) || 0
            }))
          : [],
        daily_stats: Array.isArray(rawData.daily_stats)
          ? rawData.daily_stats.map(day => ({
              date: day.date,
              contests: parseInt(day.contests) || 0,
              views: parseInt(day.views) || 0,
              participants: parseInt(day.participants) || 0
            }))
          : []
      };
      
      console.log('Форматированные данные:', formattedData);
      return { data: formattedData };
    } catch (error) {
      console.error('Ошибка при получении статистики конкурсов:', error);
      throw error;
    }
  },

  getStats,

  getContestVideos,
  getContestChannels
} 