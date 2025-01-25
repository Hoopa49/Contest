/**
 * YouTube Service Tests
 * Тесты для сервиса работы с YouTube API
 */

const { YouTubeService } = require('../services/youtube.service')
const { DraftContest } = require('../../../models')
const config = require('../../../config')

// Мокаем внешние зависимости
jest.mock('googleapis', () => ({
  google: {
    youtube: jest.fn().mockReturnValue({
      search: {
        list: jest.fn()
      },
      videos: {
        list: jest.fn()
      },
      channels: {
        list: jest.fn()
      }
    })
  }
}))

jest.mock('../../../utils/rate-limiter', () => ({
  RateLimiter: jest.fn().mockImplementation(() => ({
    checkLimit: jest.fn()
  }))
}))

jest.mock('../../../models', () => ({
  DraftContest: {
    create: jest.fn().mockImplementation((data) => Promise.resolve({
      id: 'test-draft-id',
      ...data
    }))
  }
}))

describe('YouTubeService', () => {
  let youtubeService
  let youtube
  let rateLimiter
  
  beforeEach(() => {
    jest.clearAllMocks()
    youtubeService = new YouTubeService()
    youtube = require('googleapis').google.youtube()
    rateLimiter = require('../../../utils/rate-limiter').RateLimiter()
  })

  describe('Rate Limiting', () => {
    it('должен блокировать запросы при превышении лимита', async () => {
      // Устанавливаем поведение rate limiter
      const rateLimiterInstance = require('../../../utils/rate-limiter').RateLimiter()
      rateLimiterInstance.checkLimit.mockResolvedValue(false)
      youtubeService.rateLimiter = rateLimiterInstance

      // Проверяем, что запрос блокируется
      await expect(youtubeService.searchContests()).rejects.toThrow('Превышен лимит запросов к API')
      
      // Проверяем, что API YouTube не вызывается
      expect(youtube.search.list).not.toHaveBeenCalled()
    })

    it('должен пропускать запросы при соблюдении лимита', async () => {
      // Устанавливаем поведение rate limiter и API
      const rateLimiterInstance = require('../../../utils/rate-limiter').RateLimiter()
      rateLimiterInstance.checkLimit.mockResolvedValue(true)
      youtubeService.rateLimiter = rateLimiterInstance
      
      const mockSearchResponse = {
        data: {
          items: [],
          pageInfo: { totalResults: 0 }
        }
      }
      youtube.search.list.mockResolvedValueOnce(mockSearchResponse)

      // Выполняем запрос
      await youtubeService.searchContests()

      // Проверяем последовательность вызовов
      expect(rateLimiterInstance.checkLimit).toHaveBeenCalledTimes(1)
      expect(youtube.search.list).toHaveBeenCalledTimes(1)
    })

    it('должен проверять лимиты для каждого метода API', async () => {
      // Устанавливаем поведение rate limiter
      const rateLimiterInstance = require('../../../utils/rate-limiter').RateLimiter()
      rateLimiterInstance.checkLimit.mockResolvedValue(true)
      youtubeService.rateLimiter = rateLimiterInstance

      const mockSearchResponse = {
        data: {
          items: [{ id: { videoId: 'test1' } }],
          pageInfo: { totalResults: 1 }
        }
      }

      const mockVideosResponse = {
        data: {
          items: [{
            id: 'test1',
            snippet: {
              title: 'Тест',
              description: 'Описание',
              publishedAt: '2024-01-01T00:00:00Z',
              thumbnails: {},
              channelId: 'channel1',
              channelTitle: 'Канал'
            },
            statistics: {
              viewCount: '1000',
              likeCount: '100',
              commentCount: '50'
            },
            contentDetails: { duration: 'PT5M' }
          }]
        }
      }

      const mockChannelResponse = {
        data: {
          items: [{
            id: 'channel1',
            snippet: {
              title: 'Тестовый канал',
              description: 'Описание канала'
            },
            statistics: {
              subscriberCount: '1000',
              videoCount: '100'
            }
          }]
        }
      }

      // Устанавливаем поведение API моков
      youtube.search.list.mockResolvedValueOnce(mockSearchResponse)
      youtube.videos.list.mockResolvedValueOnce(mockVideosResponse)
      youtube.channels.list.mockResolvedValueOnce(mockChannelResponse)

      // Выполняем запросы к разным методам
      await youtubeService.searchContests()
      await youtubeService.getChannelInfo('channel1')

      // Проверяем, что rate limiter вызывался для каждого метода
      expect(rateLimiterInstance.checkLimit).toHaveBeenCalledTimes(3)
      expect(youtube.search.list).toHaveBeenCalledTimes(1)
      expect(youtube.videos.list).toHaveBeenCalledTimes(1)
      expect(youtube.channels.list).toHaveBeenCalledTimes(1)
    })
  })

  describe('searchContests', () => {
    let rateLimiterInstance

    beforeEach(() => {
      rateLimiterInstance = require('../../../utils/rate-limiter').RateLimiter()
      rateLimiterInstance.checkLimit.mockResolvedValue(true)
      youtubeService.rateLimiter = rateLimiterInstance
    })

    it('должен искать конкурсы без параметров', async () => {
      // Подготавливаем моки
      const mockSearchResponse = {
        data: {
          items: [
            { id: { videoId: 'test1' } }
          ],
          pageInfo: { totalResults: 1 },
          nextPageToken: 'token123'
        }
      }

      const mockVideosResponse = {
        data: {
          items: [
            {
              id: 'test1',
              snippet: {
                title: 'Тестовый конкурс',
                description: 'Описание конкурса',
                publishedAt: '2024-01-01T00:00:00Z',
                thumbnails: {},
                channelId: 'channel1',
                channelTitle: 'Тестовый канал',
                tags: ['конкурс']
              },
              statistics: {
                viewCount: '1000',
                likeCount: '100',
                commentCount: '50'
              },
              contentDetails: { duration: 'PT5M' }
            }
          ]
        }
      }

      // Устанавливаем поведение моков
      youtube.search.list.mockResolvedValueOnce(mockSearchResponse)
      youtube.videos.list.mockResolvedValueOnce(mockVideosResponse)

      // Выполняем тест
      const result = await youtubeService.searchContests()

      // Проверяем результаты
      expect(result.items).toHaveLength(1)
      expect(result.totalResults).toBe(1)
      expect(result.nextPageToken).toBe('token123')
      expect(DraftContest.create).toHaveBeenCalledWith({
        videoId: 'test1',
        title: 'Тестовый конкурс',
        description: 'Описание конкурса',
        publishedAt: '2024-01-01T00:00:00Z',
        thumbnails: {},
        channelId: 'channel1',
        channelTitle: 'Тестовый канал',
        tags: ['конкурс'],
        duration: 'PT5M',
        viewCount: '1000',
        likeCount: '100',
        commentCount: '50'
      })
    })

    it('должен искать конкурсы с параметрами', async () => {
      const query = 'iphone'
      const maxResults = 10
      const publishedAfter = '2024-01-01T00:00:00Z'

      // Подготавливаем моки
      const mockSearchResponse = {
        data: {
          items: [
            { id: { videoId: 'test1' } }
          ],
          pageInfo: { totalResults: 1 }
        }
      }

      const mockVideosResponse = {
        data: {
          items: [
            {
              id: 'test1',
              snippet: {
                title: 'Конкурс iPhone',
                description: 'Описание конкурса',
                publishedAt: '2024-01-01T00:00:00Z',
                thumbnails: {},
                channelId: 'channel1',
                channelTitle: 'Тестовый канал',
                tags: ['конкурс']
              },
              statistics: {
                viewCount: '1000',
                likeCount: '100',
                commentCount: '50'
              },
              contentDetails: { duration: 'PT5M' }
            }
          ]
        }
      }

      // Устанавливаем поведение моков
      youtube.search.list.mockResolvedValueOnce(mockSearchResponse)
      youtube.videos.list.mockResolvedValueOnce(mockVideosResponse)

      // Выполняем тест
      await youtubeService.searchContests(query, {
        maxResults,
        publishedAfter
      })

      // Проверяем результаты
      expect(youtube.search.list).toHaveBeenCalledWith(expect.objectContaining({
        part: 'snippet',
        type: 'video',
        q: `${query} конкурс розыгрыш`,
        maxResults,
        order: 'date',
        relevanceLanguage: 'ru',
        publishedAfter
      }))
    })

    it('должен обрабатывать ошибки API', async () => {
      // Устанавливаем поведение мока с ошибкой
      youtube.search.list.mockRejectedValueOnce(new Error('API Error'))

      // Проверяем, что ошибка обрабатывается
      await expect(youtubeService.searchContests()).rejects.toThrow('API Error')
    })
  })

  describe('getChannelInfo', () => {
    let rateLimiterInstance

    beforeEach(() => {
      rateLimiterInstance = require('../../../utils/rate-limiter').RateLimiter()
      rateLimiterInstance.checkLimit.mockResolvedValue(true)
      youtubeService.rateLimiter = rateLimiterInstance
    })

    it('должен получать информацию о канале', async () => {
      const channelId = 'test-channel'
      const mockResponse = {
        data: {
          items: [{
            id: channelId,
            snippet: {
              title: 'Тестовый канал',
              description: 'Описание канала'
            },
            statistics: {
              subscriberCount: '1000',
              videoCount: '100'
            }
          }]
        }
      }

      // Устанавливаем поведение мока
      youtube.channels.list.mockResolvedValueOnce(mockResponse)

      // Выполняем тест
      const result = await youtubeService.getChannelInfo(channelId)

      // Проверяем результаты
      expect(result).toEqual(mockResponse.data.items[0])
      expect(youtube.channels.list).toHaveBeenCalledWith({
        part: 'snippet,statistics',
        id: channelId
      })
    })

    it('должен выбрасывать ошибку если канал не найден', async () => {
      const channelId = 'non-existent-channel'
      const mockResponse = {
        data: {
          items: []
        }
      }

      // Устанавливаем поведение мока
      youtube.channels.list.mockResolvedValueOnce(mockResponse)

      // Проверяем, что ошибка обрабатывается
      await expect(youtubeService.getChannelInfo(channelId)).rejects.toThrow('Канал не найден')
    })
  })
}) 