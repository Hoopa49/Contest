/**
 * YouTube Module
 * Модуль для работы с YouTube API и поиска конкурсов
 */

const { Router } = require('express')
const routes = require('./routes')
const youtubeService = require('./services/youtube.service')
const youtubeRoutes = require('./routes/youtube.routes')
const youtubeController = require('./controllers/youtube.controller')
const youtubeApi = require('./services/youtube-api.service')
const youtubeQuota = require('./services/youtube-quota.service')
const contestProcessor = require('./services/contest-processor.service')
const youtubeScheduler = require('./services/youtube-scheduler.service')

// Создаем роутер для модуля
const router = Router()

// Подключаем роуты
router.use('/youtube', routes)

// Инициализация планировщика при запуске
youtubeScheduler.startScheduler()

module.exports = {
  router,
  youtubeService,
  routes: youtubeRoutes,
  controller: youtubeController,
  services: {
    youtubeApi,
    youtubeQuota,
    contestProcessor,
    youtubeScheduler
  }
} 