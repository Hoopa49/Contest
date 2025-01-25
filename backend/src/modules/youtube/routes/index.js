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
 * Поиск конкурсов
 * @route GET /api/youtube/contests
 */
router.get('/contests', authenticate, youtubeController.searchContests)

/**
 * Получение информации о канале
 * @route GET /api/youtube/channels/:channelId
 */
router.get('/channels/:channelId', authenticate, youtubeController.getChannelInfo)

/**
 * Запуск обработки черновиков
 * @route POST /api/youtube/process-drafts
 */
router.post('/process-drafts', authenticate, contestProcessorController.processDrafts)

module.exports = router 