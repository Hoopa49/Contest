/**
 * YouTube Service
 * Сервис для работы с YouTube API
 */

const { google } = require('googleapis')
const { RateLimiter } = require('../../../utils/rate-limiter')
const { DraftContest } = require('../../../models')
const { logger } = require('../../../logging')
const { 
  youtube_video: YoutubeVideo,
  youtube_channel: YoutubeChannel,
  youtube_settings: YoutubeSettings
} = require('../../../models')
const { Op } = require('sequelize')
const youtubeApi = require('./youtube-api.service')
const contestProcessor = require('./contest-processor.service')

class YouTubeService {
  constructor() {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      logger.error('API ключ YouTube не настроен в переменных окружения');
      throw new Error('API ключ YouTube не настроен');
    }

    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey
    })

    this.rateLimiter = new RateLimiter('youtube', {
      points: parseInt(process.env.YOUTUBE_QUOTA_LIMIT) || 10000,
      duration: 24 * 60 * 60 // 24 часа в секундах
    })
  }

  async searchContests(query = '', options = {}) {
    try {
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

      const searchResponse = await this.youtube.search.list(searchParams)

      if (!searchResponse?.data?.items?.length) {
        return {
          videos: [],
          total: searchResponse?.data?.pageInfo?.totalResults || 0,
          nextPageToken: searchResponse?.data?.nextPageToken
        }
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
      const canProceed = await this.rateLimiter.checkLimit()
      if (!canProceed) {
        throw new Error('Превышен лимит запросов к API')
      }

      const response = await this.youtube.channels.list({
        part: 'snippet,statistics',
        id: channelId
      })

      if (!response?.data?.items?.length) {
        throw new Error('Канал не найден')
      }

      return response.data.items[0]
    } catch (error) {
      logger.error('Ошибка при получении информации о канале:', error)
      throw error
    }
  }
}

module.exports = {
  YouTubeService,
  youtubeService: new YouTubeService()
} 