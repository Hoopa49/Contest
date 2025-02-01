/**
 * YouTube Routes
 * Маршруты для работы с YouTube API
 */

const { Router } = require('express')
const { authenticate } = require('../../auth/middleware/auth.middleware')
const youtubeController = require('../controllers/youtube.controller')
const contestProcessorController = require('../controllers/contest-processor.controller')

const router = Router()

/**
 * Поиск видео
 * @route GET /api/youtube/contests
 */
router.get('/contests', authenticate, youtubeController.searchVideos)

/**
 * Получение списка конкурсных видео
 * @route GET /api/youtube/contests/videos
 */
router.get('/contests/videos', authenticate, youtubeController.getContestVideos)

/**
 * Получение списка конкурсных каналов
 * @route GET /api/youtube/contests/channels
 */
router.get('/contests/channels', authenticate, youtubeController.getContestChannels)

/**
 * Получение информации о канале
 * @route GET /api/youtube/channels/:channelId
 */
router.get('/channels/:channelId', authenticate, youtubeController.getChannelDetails)

/**
 * Получение статистики API
 * @route GET /api/youtube/stats/api
 */
router.get('/stats/api', authenticate, youtubeController.getApiStats)

/**
 * Получение общей статистики
 * @route GET /api/youtube/stats
 */
router.get('/stats', authenticate, youtubeController.getStats)

/**
 * Переключение статуса интеграции
 * @route POST /api/youtube/toggle
 */
router.post('/toggle', authenticate, youtubeController.toggleIntegration)

/**
 * Запуск обработки черновиков
 * @route POST /api/youtube/process-drafts
 */
router.post('/process-drafts', authenticate, contestProcessorController.processDrafts)

module.exports = router 