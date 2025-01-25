/**
 * Contest Processor Service Tests
 * Тесты для сервиса обработки конкурсов
 */

const { ContestProcessorService } = require('../services/contest-processor.service')
const { DraftContest, Contest } = require('../../../models')

describe('ContestProcessorService', () => {
  let service

  beforeEach(() => {
    service = new ContestProcessorService()
    jest.clearAllMocks()
  })

  describe('processDraft', () => {
    it('должен обрабатывать черновик и создавать конкурс', async () => {
      // Подготавливаем тестовые данные
      const mockDraft = {
        id: 'test-draft',
        videoId: 'test-video',
        title: 'Тестовый конкурс',
        description: 'Приз: iPhone 15. Правило: подписаться. Требование: быть подписчиком. Начало: 2024-01-01. Конец: 2024-01-31',
        publishedAt: '2024-01-01T00:00:00Z',
        thumbnails: {},
        channelId: 'test-channel',
        channelTitle: 'Тестовый канал',
        tags: ['конкурс'],
        duration: 'PT5M',
        viewCount: '1000',
        likeCount: '100',
        commentCount: '50',
        destroy: jest.fn()
      }

      // Мокаем методы
      DraftContest.findOne = jest.fn().mockResolvedValue(mockDraft)
      Contest.create = jest.fn().mockImplementation(data => ({
        ...data,
        id: 'test-contest'
      }))

      // Выполняем тест
      const result = await service.processDraft('test-draft')

      // Проверяем результаты
      expect(DraftContest.findOne).toHaveBeenCalledWith({
        where: { id: 'test-draft' }
      })
      expect(Contest.create).toHaveBeenCalled()
      expect(mockDraft.destroy).toHaveBeenCalled()
      expect(result).toHaveProperty('prizes', [{ description: 'iPhone 15' }])
      expect(result).toHaveProperty('rules', [{ description: 'подписаться' }])
      expect(result).toHaveProperty('requirements', [{ description: 'быть подписчиком' }])
      expect(result.startDate).toEqual(new Date('2024-01-01T00:00:00.000Z'))
      expect(result.endDate).toEqual(new Date('2024-01-31T00:00:00.000Z'))
    })

    it('должен выбрасывать ошибку если черновик не найден', async () => {
      // Мокаем методы
      DraftContest.findOne = jest.fn().mockResolvedValue(null)

      // Проверяем, что ошибка обрабатывается
      await expect(service.processDraft('non-existent')).rejects.toThrow('Черновик не найден')
    })
  })

  describe('extractPrizes', () => {
    it('должен извлекать призы из описания', () => {
      const description = 'Приз: iPhone 15. Подарок: AirPods. Награда: iPad'
      const result = service.extractPrizes(description)
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({ description: 'iPhone 15' })
      expect(result[1]).toEqual({ description: 'AirPods' })
      expect(result[2]).toEqual({ description: 'iPad' })
    })
  })

  describe('extractRules', () => {
    it('должен извлекать правила из описания', () => {
      const description = 'Правило: подписаться. Условие: поставить лайк'
      const result = service.extractRules(description)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ description: 'подписаться' })
      expect(result[1]).toEqual({ description: 'поставить лайк' })
    })
  })

  describe('extractRequirements', () => {
    it('должен извлекать требования из описания', () => {
      const description = 'Требование: быть подписчиком. Нужно: оставить комментарий'
      const result = service.extractRequirements(description)
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ description: 'быть подписчиком' })
      expect(result[1]).toEqual({ description: 'оставить комментарий' })
    })

    it('должен пропускать числовые значения', () => {
      const description = 'Требование: 1. Требование: быть подписчиком'
      const result = service.extractRequirements(description)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({ description: 'быть подписчиком' })
    })
  })

  describe('extractDates', () => {
    it('должен извлекать даты из описания', () => {
      const description = 'Начало: 2024-01-01. Конец: 2024-01-31'
      const result = service.extractDates(description)
      expect(result.startDate).toEqual(new Date('2024-01-01T00:00:00.000Z'))
      expect(result.endDate).toEqual(new Date('2024-01-31T00:00:00.000Z'))
    })

    it('должен возвращать null для отсутствующих дат', () => {
      const description = 'Конкурс без дат'
      const result = service.extractDates(description)
      expect(result.startDate).toBeNull()
      expect(result.endDate).toBeNull()
    })

    it('должен обрабатывать некорректные форматы дат', () => {
      const invalidFormats = [
        'Начало: вчера. Конец: завтра',
        'Начало: 32.13.2024. Конец: 31.13.2024',
        'Начало: 2024/01/01. Конец: 2024/31/12',
        'Старт: 01-01-2024, Финиш: 31-12-2024'
      ]

      invalidFormats.forEach(description => {
        const result = service.extractDates(description)
        expect(result.startDate).toBeNull()
        expect(result.endDate).toBeNull()
      })
    })

    it('должен обрабатывать даты с некорректной последовательностью', () => {
      const description = 'Начало: 2024-12-31. Конец: 2024-01-01'
      const result = service.extractDates(description)
      expect(result.startDate).toBeNull()
      expect(result.endDate).toBeNull()
    })
  })

  describe('Обработка некорректных данных', () => {
    it('должен обрабатывать пустое описание', async () => {
      const mockDraft = {
        id: 'test-draft',
        videoId: 'test-video',
        title: 'Тестовый конкурс',
        description: '',
        publishedAt: '2024-01-01T00:00:00Z',
        thumbnails: {},
        channelId: 'test-channel',
        channelTitle: 'Тестовый канал',
        destroy: jest.fn()
      }

      DraftContest.findOne = jest.fn().mockResolvedValue(mockDraft)
      Contest.create = jest.fn().mockImplementation(data => ({
        ...data,
        id: 'test-contest'
      }))

      const result = await service.processDraft('test-draft')
      
      expect(result.prizes).toEqual([])
      expect(result.rules).toEqual([])
      expect(result.requirements).toEqual([])
      expect(result.startDate).toBeNull()
      expect(result.endDate).toBeNull()
    })

    it('должен обрабатывать описание без структурированных данных', async () => {
      const mockDraft = {
        id: 'test-draft',
        videoId: 'test-video',
        title: 'Тестовый конкурс',
        description: 'Просто текст без структурированной информации о конкурсе',
        publishedAt: '2024-01-01T00:00:00Z',
        thumbnails: {},
        channelId: 'test-channel',
        channelTitle: 'Тестовый канал',
        destroy: jest.fn()
      }

      DraftContest.findOne = jest.fn().mockResolvedValue(mockDraft)
      Contest.create = jest.fn().mockImplementation(data => ({
        ...data,
        id: 'test-contest'
      }))

      const result = await service.processDraft('test-draft')
      
      expect(result.prizes).toEqual([])
      expect(result.rules).toEqual([])
      expect(result.requirements).toEqual([])
      expect(result.startDate).toBeNull()
      expect(result.endDate).toBeNull()
    })

    it('должен обрабатывать частично структурированные данные', async () => {
      const mockDraft = {
        id: 'test-draft',
        videoId: 'test-video',
        title: 'Тестовый конкурс',
        description: 'Приз: iPhone. Какой-то текст без правил. Требование: подписка',
        publishedAt: '2024-01-01T00:00:00Z',
        thumbnails: {},
        channelId: 'test-channel',
        channelTitle: 'Тестовый канал',
        destroy: jest.fn()
      }

      DraftContest.findOne = jest.fn().mockResolvedValue(mockDraft)
      Contest.create = jest.fn().mockImplementation(data => ({
        ...data,
        id: 'test-contest'
      }))

      const result = await service.processDraft('test-draft')
      
      expect(result.prizes).toHaveLength(1)
      expect(result.prizes[0]).toEqual({ description: 'iPhone' })
      expect(result.rules).toEqual([])
      expect(result.requirements).toHaveLength(1)
      expect(result.requirements[0]).toEqual({ description: 'подписка' })
    })

    it('должен обрабатывать дубликаты в данных', async () => {
      const mockDraft = {
        id: 'test-draft',
        videoId: 'test-video',
        title: 'Тестовый конкурс',
        description: 'Приз: iPhone. Приз: iPhone. Правило: лайк. Правило: лайк',
        publishedAt: '2024-01-01T00:00:00Z',
        thumbnails: {},
        channelId: 'test-channel',
        channelTitle: 'Тестовый канал',
        destroy: jest.fn()
      }

      DraftContest.findOne = jest.fn().mockResolvedValue(mockDraft)
      Contest.create = jest.fn().mockImplementation(data => ({
        ...data,
        id: 'test-contest'
      }))

      const result = await service.processDraft('test-draft')
      
      expect(result.prizes).toHaveLength(1)
      expect(result.rules).toHaveLength(1)
      expect(result.prizes[0]).toEqual({ description: 'iPhone' })
      expect(result.rules[0]).toEqual({ description: 'лайк' })
    })
  })
}) 