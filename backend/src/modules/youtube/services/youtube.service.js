/**
 * YouTube Service
 * Сервис для работы с YouTube API
 */

const { google } = require('googleapis')
const { RateLimiter } = require('../../../utils/rate-limiter')
const { initializeModels } = require('../../../models')
const { logger } = require('../../../logging')
const { Op } = require('sequelize')
const youtubeApi = require('./youtube-api.service')
const contestProcessor = require('./contest-processor.service')
const { quotaService } = require('./youtube-quota.service')
const { Sequelize } = require('sequelize')

class YouTubeService {
  constructor() {
    this.youtube = null;
    this.rateLimiter = null;
    this.initialized = false;
    this.models = null;
  }

  async initialize() {
    try {
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        logger.warn('API ключ YouTube не настроен в переменных окружения');
        return;
      }

      this.youtube = google.youtube({
        version: 'v3',
        auth: apiKey
      });

      this.rateLimiter = new RateLimiter('youtube', {
        points: parseInt(process.env.YOUTUBE_QUOTA_LIMIT) || 10000,
        duration: 24 * 60 * 60 // 24 часа в секундах
      });

      // Инициализируем модели
      this.models = await initializeModels();
      if (!this.models) {
        throw new Error('Не удалось инициализировать модели');
      }

      this.initialized = true;
      logger.info('YouTube сервис успешно инициализирован');
    } catch (error) {
      logger.error('Ошибка инициализации YouTube сервиса:', error);
      throw error;
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
    if (!this.initialized) {
      throw new Error('YouTube сервис не инициализирован');
    }
  }

  async searchContests(query = '', options = {}) {
    try {
      await this.ensureInitialized();

      // Проверяем доступность квоты для поиска
      const canSearch = await quotaService.checkQuotaAvailability('SEARCH');
      if (!canSearch) {
        throw new Error('Превышен лимит квоты YouTube API для поиска');
      }

      const canProceed = await this.rateLimiter.checkLimit()
      if (!canProceed) {
        throw new Error('Превышен лимит запросов к API')
      }

      // Формируем дату для фильтра publishedAfter
      let publishedAfter = new Date()
      switch (options.publishedAfter) {
        case 'day':
          publishedAfter.setDate(publishedAfter.getDate() - 1)
          break
        case 'week':
          publishedAfter.setDate(publishedAfter.getDate() - 7)
          break
        case 'month':
          publishedAfter.setMonth(publishedAfter.getMonth() - 1)
          break
        case '3months':
          publishedAfter.setMonth(publishedAfter.getMonth() - 3)
          break
        case 'year':
          publishedAfter.setFullYear(publishedAfter.getFullYear() - 1)
          break
        default:
          publishedAfter.setDate(publishedAfter.getDate() - 1) // По умолчанию за последний день
      }

      // Формируем поисковый запрос с учетом области поиска
      let searchQuery = query
      if (options.searchIn) {
        if (options.searchIn.includes('title')) {
          searchQuery += ' intitle:конкурс OR intitle:розыгрыш OR intitle:giveaway'
        }
        if (options.searchIn.includes('description')) {
          searchQuery += ' indescription:конкурс OR indescription:розыгрыш OR indescription:giveaway'
        }
      }

      const searchParams = {
        part: 'snippet',
        type: 'video',
        q: searchQuery,
        maxResults: options.maxResults || 50,
        order: 'date',
        relevanceLanguage: 'ru',
        publishedAfter: publishedAfter.toISOString(),
        pageToken: options.pageToken
      }

      // Регистрируем использование квоты для поиска (100 токенов за каждый запрос)
      await quotaService.registerQuotaUsage('SEARCH', 1);

      const searchResponse = await this.youtube.search.list(searchParams)
      
      if (!searchResponse?.data?.items?.length) {
        return {
          videos: [],
          total: searchResponse?.data?.pageInfo?.totalResults || 0,
          nextPageToken: searchResponse?.data?.nextPageToken
        }
      }

      // Проверяем доступность квоты для получения деталей видео
      const canGetDetails = await quotaService.checkQuotaAvailability('VIDEO_DETAILS');
      if (!canGetDetails) {
        throw new Error('Превышен лимит квоты YouTube API для получения деталей видео');
      }

      const canProceedVideos = await this.rateLimiter.checkLimit()
      if (!canProceedVideos) {
        throw new Error('Превышен лимит запросов к API')
      }

      const videoIds = searchResponse.data.items.map(item => item.id.videoId)
      const videosResponse = await this.youtube.videos.list({
        part: 'snippet,contentDetails,statistics',
        id: videoIds.join(',')
      })
      // Регистрируем использование квоты для получения деталей видео
      await quotaService.registerQuotaUsage('VIDEO_DETAILS', videoIds.length);

      if (!videosResponse?.data?.items?.length) {
        return {
          videos: [],
          total: searchResponse.data.pageInfo.totalResults,
          nextPageToken: searchResponse.data.nextPageToken
        }
      }

      // Фильтруем и обрабатываем видео
      const processedVideos = videosResponse.data.items
        .filter(video => {
          const viewCount = parseInt(video.statistics.viewCount) || 0
          const likeCount = parseInt(video.statistics.likeCount) || 0
          
          // Применяем фильтры по просмотрам и лайкам
          if (options.minViews && viewCount < options.minViews) return false
          if (options.minLikes && likeCount < options.minLikes) return false
          
          // Исключаем каналы из черного списка
          if (options.excludedChannels?.includes(video.snippet.channelTitle)) return false
          
          return true
        })
        .map(video => {
          const {
            id: videoId,
            snippet: {
              title,
              description,
              publishedAt,
              thumbnails,
              channelId,
              channelTitle,
              tags = []
            },
            statistics: {
              viewCount,
              likeCount,
              commentCount
            }
          } = video

          // Вычисляем вероятность того, что это конкурс
          const contestProbability = this.calculateContestProbability(title, description, tags)

          // Применяем фильтр по вероятности
          if (options.contestProbability && contestProbability < options.contestProbability) {
            return null
          }

          return {
            youtube_id: videoId,
            title,
            description,
            published_at: publishedAt,
            thumbnail_url: thumbnails.medium?.url || thumbnails.default?.url,
            channel_id: channelId,
            channel_title: channelTitle,
            tags,
            view_count: parseInt(viewCount) || 0,
            like_count: parseInt(likeCount) || 0,
            comment_count: parseInt(commentCount) || 0,
            contest_probability: contestProbability
          }
        })
        .filter(Boolean) // Удаляем null элементы

      return {
        videos: processedVideos,
        total: processedVideos.length,
        nextPageToken: searchResponse.data.nextPageToken
      }
    } catch (error) {
      logger.error('Ошибка при поиске видео:', error)
      throw error
    }
  }

  // Добавляем метод для вычисления вероятности конкурса
  calculateContestProbability(title, description, tags) {
    const contestKeywords = [
      'конкурс', 'розыгрыш', 'giveaway', 'приз', 'подарок',
      'бесплатно', 'участвуй', 'победитель', 'выиграй', 'раздача'
    ]

    let probability = 0
    const normalizedTitle = title.toLowerCase()
    const normalizedDescription = description.toLowerCase()
    const normalizedTags = tags.map(tag => tag.toLowerCase())

    // Проверяем заголовок (50% веса)
    contestKeywords.forEach(keyword => {
      if (normalizedTitle.includes(keyword)) {
        probability += 0.5 / contestKeywords.length
      }
    })

    // Проверяем описание (30% веса)
    contestKeywords.forEach(keyword => {
      if (normalizedDescription.includes(keyword)) {
        probability += 0.3 / contestKeywords.length
      }
    })

    // Проверяем теги (20% веса)
    contestKeywords.forEach(keyword => {
      if (normalizedTags.includes(keyword)) {
        probability += 0.2 / contestKeywords.length
      }
    })

    return Math.min(1, probability)
  }

  async getChannelInfo(channelId) {
    try {
      await this.ensureInitialized();

      // Проверяем доступность квоты
      const canGetChannel = await quotaService.checkQuotaAvailability('CHANNEL_DETAILS');
      if (!canGetChannel) {
        throw new Error('Превышен лимит квоты YouTube API для получения информации о канале');
      }

      const response = await this.youtube.channels.list({
        part: 'snippet,statistics',
        id: channelId
      });

      // Регистрируем использование квоты
      await quotaService.registerQuotaUsage('CHANNEL_DETAILS');

      if (!response?.data?.items?.length) {
        return null;
      }

      const channel = response.data.items[0];
      return {
        youtube_id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        thumbnail_url: channel.snippet.thumbnails?.default?.url,
        subscriber_count: parseInt(channel.statistics.subscriberCount) || 0,
        video_count: parseInt(channel.statistics.videoCount) || 0,
        view_count: parseInt(channel.statistics.viewCount) || 0
      };
    } catch (error) {
      logger.error('Ошибка при получении информации о канале:', {
        channelId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Получение статистики конкурсов
   */
  async getContestStats({ startDate, endDate }) {
    try {
      await this.ensureInitialized();

      const where = {
        is_contest: true
      };

      if (startDate) {
        where.created_at = {
          [Op.gte]: new Date(startDate)
        };
      }

      if (endDate) {
        where.created_at = {
          ...where.created_at,
          [Op.lte]: new Date(endDate)
        };
      }

      // Получаем общее количество конкурсов
      const total = await this.models.YoutubeVideo.count({
        where: { is_contest: true }
      });

      // Получаем количество активных конкурсов (за последние 30 дней)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const active = await this.models.YoutubeVideo.count({
        where: {
          is_contest: true,
          created_at: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      });

      // Получаем количество каналов с конкурсами
      const channels = await this.models.YoutubeChannel.count({
        where: {
          contest_videos_count: {
            [Op.gt]: 0
          }
        }
      });

      // Получаем ежедневную статистику
      const dailyStats = await this.models.YoutubeVideo.findAll({
        where: {
          is_contest: true,
          created_at: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        attributes: [
          [Sequelize.fn('DATE', Sequelize.col('created_at')), 'date'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
          [Sequelize.fn('AVG', Sequelize.col('views_count')), 'avgViews'],
          [Sequelize.fn('AVG', Sequelize.col('likes_count')), 'avgLikes'],
          [Sequelize.fn('AVG', Sequelize.col('comments_count')), 'avgComments']
        ],
        group: [Sequelize.fn('DATE', Sequelize.col('created_at'))],
        order: [[Sequelize.fn('DATE', Sequelize.col('created_at')), 'ASC']]
      });

      return {
        total,
        active,
        channels,
        dailyStats: dailyStats.map(stat => ({
          date: stat.get('date'),
          count: parseInt(stat.get('count')),
          avgViews: Math.round(parseFloat(stat.get('avgViews')) || 0),
          avgLikes: Math.round(parseFloat(stat.get('avgLikes')) || 0),
          avgComments: Math.round(parseFloat(stat.get('avgComments')) || 0)
        }))
      };
    } catch (error) {
      logger.error('Ошибка при получении статистики конкурсов:', {
        error: error.message,
        stack: error.stack,
        params: { startDate, endDate }
      });
      throw error;
    }
  }
}

// Создаем единственный экземпляр сервиса
const youtubeService = new YouTubeService();

// Экспортируем сервис
module.exports = {
  YouTubeService,
  youtubeService
}; 