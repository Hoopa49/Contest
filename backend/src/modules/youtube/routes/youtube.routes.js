const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/youtube.controller');
const { authMiddleware, adminMiddleware } = require('../../../middleware/auth.middleware');

// Все маршруты требуют аутентификации и прав админа
router.use(authMiddleware);
router.use(adminMiddleware);

// Поиск видео
router.get('/search', youtubeController.searchVideos);
router.post('/search/start', youtubeController.startVideoSearch);

// Получение информации о видео и каналах
router.get('/videos/:videoId', youtubeController.getVideoDetails);
router.get('/channels/:channelId', youtubeController.getChannelDetails);

// Конкурсные видео и каналы
router.get('/contests/videos', youtubeController.getContestVideos);
router.get('/contests/channels', youtubeController.getContestChannels);

// Статистика
router.get('/stats/api', youtubeController.getApiStats);
router.get('/stats/contests', youtubeController.getStats);

// Управление интеграцией
router.get('/status', youtubeController.getIntegrationStatus);
router.post('/toggle', youtubeController.toggleIntegration);

// Настройки
router.get('/settings', youtubeController.getSettings);
router.put('/settings', youtubeController.updateSettings);

module.exports = router; 