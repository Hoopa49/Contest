/**
 * YouTube Controller
 * Контроллер для обработки запросов к YouTube API
 */

const BaseController = require('../../../controllers/base.controller');
const { youtube_video: YoutubeVideo, youtube_channel: YoutubeChannel, youtube_analytics: YoutubeAnalytics, youtube_settings: YoutubeSettings, integration_stats: IntegrationStats } = require('../../../models');
const youtubeApi = require('../services/youtube-api.service');
const contestProcessor = require('../services/contest-processor.service');
const quotaService = require('../services/youtube-quota.service');
const scheduler = require('../services/youtube-scheduler.service');
const { logger } = require('../../../logging');
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const youtubeService = require('../services/youtube.service');
const youtubeAnalyticsService = require('../services/youtube-analytics.service');
const { ApiError } = require('../../../utils/errors');

class YoutubeController extends BaseController {
  constructor() {
    super();
    this.getStats = this.handleAsync(this.getStats.bind(this));
    this.getApiStats = this.handleAsync(this.getApiStats.bind(this));
    this.toggleIntegration = this.handleAsync(this.toggleIntegration.bind(this));
    this.getContestVideos = this.handleAsync(this.getContestVideos.bind(this));
    this.getContestChannels = this.handleAsync(this.getContestChannels.bind(this));
    this.searchVideos = this.handleAsync(this.searchVideos.bind(this));
    this.getVideoDetails = this.handleAsync(this.getVideoDetails.bind(this));
    this.quotaService = quotaService;
    this.youtubeApi = youtubeApi;
  }

  /**
   * Поиск видео на YouTube
   */
  async searchVideos(req, res) {
    try {
      const { query, maxResults = 50 } = req.query;

      const videos = await this.youtubeApi.searchVideos(query, maxResults);
      logger.info('Выполнен поиск видео:', { 
        query,
        maxResults,
        found: videos?.length || 0,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });

      return this.sendSuccess(res, videos);
    } catch (error) {
      logger.error('Ошибка поиска видео:', {
        query: req.query.query,
        maxResults: req.query.maxResults,
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
      return this.sendError(res, 'Ошибка поиска видео');
    }
  }

  /**
   * Получение информации о видео
   */
  async getVideoDetails(req, res) {
    try {
      const { videoId } = req.params;

      const video = await this.youtubeApi.getVideoDetails(videoId);
      
      if (!video) {
        logger.warn('Видео не найдено:', { 
          videoId,
          userId: req.user?.id,
          timestamp: new Date().toISOString()
        });
        return this.sendError(res, 'Видео не найдено', 404);
      }

      logger.info('Получены детали видео:', { 
        videoId,
        title: video.title,
        channelId: video.channelId,
        publishedAt: video.publishedAt,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });

      return this.sendSuccess(res, video);
    } catch (error) {
      logger.error('Ошибка получения деталей видео:', {
        videoId: req.params.videoId,
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
      return this.sendError(res, 'Ошибка получения деталей видео');
    }
  }

  /**
   * Получение информации о канале
   */
  getChannelDetails = this.handleAsync(async (req, res) => {
    const { channelId } = req.params;
    const channel = await youtubeApi.getChannelDetails(channelId);
    return this.sendSuccess(res, channel);
  });

  /**
   * Получение статистики использования API
   */
  async getApiStats(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const stats = await quotaService.getQuotaStats(days);
      logger.info('Получена статистика API:', { days });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Ошибка получения статистики API:', {
        error: error.message
      });
      res.status(500).json({
        success: false,
        message: 'Ошибка получения статистики API'
      });
    }
  }

  /**
   * Получение аналитики по конкурсным видео
   */
  getContestAnalytics = this.handleAsync(async (req, res) => {
    const { days = 7 } = req.query;
    const stats = await contestProcessor.getContestStats(days);
    return this.sendSuccess(res, stats);
  });

  /**
   * Запуск автоматического поиска видео
   */
  startVideoSearch = this.handleAsync(async (req, res) => {
    const settings = await YoutubeSettings.findOne();
    if (!settings) {
      return this.sendError(res, 'Настройки не найдены', 404);
    }

    const searchParams = {
      maxResults: settings.max_results,
      region: settings.region,
      language: settings.language,
      videoOrder: settings.video_order,
      videoDuration: settings.video_duration,
      videoDefinition: settings.video_definition,
      videoType: settings.video_type,
      minSubscriberCount: settings.min_subscriber_count,
      minViewCount: settings.min_view_count,
      minVideoAge: settings.min_video_age,
      maxVideoAge: settings.max_video_age,
      contestProbabilityThreshold: settings.contest_probability_threshold
    };

    await scheduler.searchNewVideos(searchParams);
    return this.sendSuccess(res, { message: 'Поиск запущен' });
  });

  /**
   * Получение списка конкурсных видео
   */
  async getContestVideos(req, res) {
    try {
      const { page = 1, limit = 10, status = 'all' } = req.query;
      const offset = (page - 1) * limit;

      const where = {
        is_contest: true
      };

      if (status !== 'all') {
        where.contest_status = status;
      }

      const videos = await YoutubeVideo.findAndCountAll({
        where,
        limit,
        offset,
        order: [['publish_date', 'DESC']],
        include: [{
          model: YoutubeChannel,
          as: 'channel'
        }]
      });

      logger.debug('Получены конкурсные видео:', {
        total: videos.count,
        page: parseInt(page),
        limit: parseInt(limit),
        status
      });

      return this.sendSuccess(res, {
        videos: videos.rows,
        total: videos.count,
        page: parseInt(page),
        totalPages: Math.ceil(videos.count / limit)
      });
    } catch (error) {
      logger.error('Ошибка при получении конкурсных видео:', {
        error: error.message,
        stack: error.stack
      });
      return this.sendError(res, 'Ошибка при получении конкурсных видео');
    }
  }

  /**
   * Получение списка активных конкурсных каналов
   */
  async getContestChannels(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const channels = await YoutubeChannel.findAndCountAll({
        where: {
          contest_channel: true,
          status: 'active'
        },
        limit,
        offset,
        order: [['contest_videos_count', 'DESC']]
      });

      logger.debug('Получены конкурсные каналы:', {
        total: channels.count,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      return this.sendSuccess(res, {
        channels: channels.rows,
        total: channels.count,
        page: parseInt(page),
        totalPages: Math.ceil(channels.count / limit)
      });
    } catch (error) {
      logger.error('Ошибка при получении конкурсных каналов:', {
        error: error.message,
        stack: error.stack
      });
      return this.sendError(res, 'Ошибка при получении конкурсных каналов');
    }
  }

  /**
   * Получение статистики конкурсов
   */
  async getStats(req, res) {
    try {
      const { days = 30 } = req.query;
      const parsedDays = parseInt(days);
      
      logger.info('Запрос статистики YouTube:', { 
        days: parsedDays,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
      
      // Получаем статистику
      const stats = await youtubeAnalyticsService.getStats(parsedDays);
      
      logger.trace('Получена статистика YouTube:', {
        total_contests: stats.total_contests,
        active_contests: stats.active_contests,
        channels_count: stats.channels_count,
        avg_prize_value: stats.avg_prize_value,
        contest_types: stats.contest_types.length,
        daily_stats: stats.daily_stats.length,
        days: parsedDays,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });

      return this.sendSuccess(res, stats);
    } catch (error) {
      logger.error('Ошибка при получении статистики:', {
        days: req.query.days,
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
      return this.sendError(res, 'Не удалось получить статистику');
    }
  }

  /**
   * Получение статуса интеграции
   */
  getIntegrationStatus = this.handleAsync(async (req, res) => {
    const settings = await YoutubeSettings.findOne();
    
    if (!settings) {
      // Если настройки не найдены, создаем их с дефолтными значениями
      const defaultSettings = await YoutubeSettings.create({
        enabled: false,
        api_key: process.env.YOUTUBE_API_KEY || null,
        quota_limit: 10000,
        search_interval: 30,
        channel_check_interval: 60,
        max_results: 50,
        region: 'RU',
        language: 'ru',
        contest_probability_threshold: 0.7,
        min_contest_videos_for_channel: 3,
        video_order: 'date',
        video_duration: 'any',
        video_definition: 'any',
        video_type: 'video',
        min_subscriber_count: 0,
        min_view_count: 0,
        min_video_age: 0,
        max_video_age: 30
      });

      return this.sendSuccess(res, { enabled: defaultSettings.enabled });
    }

    return this.sendSuccess(res, { enabled: settings.enabled });
  });

  /**
   * Переключение статуса интеграции
   */
  async toggleIntegration(req, res) {
    const { enabled } = req.body;
    
    // Обновляем настройки YouTube
    const settings = await YoutubeSettings.findOne();
    if (!settings) {
      return this.sendError(res, 'Настройки не найдены', 404);
    }

    // Обновляем статус в integration_stats
    const integrationStats = await IntegrationStats.findOne({
      where: { platform: 'youtube' }
    });
    
    if (!integrationStats) {
      return this.sendError(res, 'Статистика интеграции не найдена', 404);
    }

    // Обновляем оба статуса
    settings.enabled = enabled;
    integrationStats.enabled = enabled;

    if (enabled) {
      settings.next_sync = new Date(Date.now() + settings.search_interval * 60000);
    } else {
      settings.next_sync = null;
    }
    
    await Promise.all([
      settings.save(),
      integrationStats.save()
    ]);

    return this.sendSuccess(res, { enabled: settings.enabled });
  }

  /**
   * Получение настроек
   */
  getSettings = this.handleAsync(async (req, res) => {
    const settings = await YoutubeSettings.findOne();
    
    if (!settings) {
      // Если настройки не найдены, создаем их с дефолтными значениями
      const defaultSettings = await YoutubeSettings.create({
        enabled: false,
        api_key: process.env.YOUTUBE_API_KEY || null,
        quota_limit: 10000,
        search_interval: 30,
        channel_check_interval: 60,
        max_results: 50,
        region: 'RU',
        language: 'ru',
        contest_probability_threshold: 0.7,
        min_contest_videos_for_channel: 3,
        video_order: 'date',
        video_duration: 'any',
        video_definition: 'any',
        video_type: 'video',
        min_subscriber_count: 0,
        min_view_count: 0,
        min_video_age: 0,
        max_video_age: 30
      });

      return this.sendSuccess(res, defaultSettings);
    }

    // Преобразуем данные в нужный формат
    const formattedSettings = {
      id: settings.id,
      enabled: settings.enabled,
      api_key: settings.api_key,
      quota_limit: parseInt(settings.quota_limit),
      search_interval: parseInt(settings.search_interval),
      channel_check_interval: parseInt(settings.channel_check_interval),
      max_results: parseInt(settings.max_results),
      region: settings.region,
      language: settings.language,
      contest_probability_threshold: parseFloat(settings.contest_probability_threshold),
      min_contest_videos_for_channel: parseInt(settings.min_contest_videos_for_channel),
      video_order: settings.video_order,
      video_duration: settings.video_duration,
      video_definition: settings.video_definition,
      video_type: settings.video_type,
      min_subscriber_count: parseInt(settings.min_subscriber_count),
      min_view_count: parseInt(settings.min_view_count),
      min_video_age: parseInt(settings.min_video_age),
      max_video_age: parseInt(settings.max_video_age),
      last_sync: settings.last_sync,
      next_sync: settings.next_sync,
      created_at: settings.created_at,
      updated_at: settings.updated_at
    };

    return this.sendSuccess(res, formattedSettings);
  });

  /**
   * Обновление настроек
   */
  updateSettings = this.handleAsync(async (req, res) => {
    const settings = await YoutubeSettings.findOne();
    
    if (!settings) {
      return this.sendError(res, 'Настройки не найдены', 404);
    }

    const currentSettings = settings.toJSON();
    const updatedSettings = {
      ...currentSettings,
      ...req.body,
      quota_limit: parseInt(req.body.quota_limit) || currentSettings.quota_limit,
      search_interval: parseInt(req.body.search_interval) || currentSettings.search_interval,
      channel_check_interval: parseInt(req.body.channel_check_interval) || currentSettings.channel_check_interval,
      max_results: parseInt(req.body.max_results) || currentSettings.max_results,
      contest_probability_threshold: parseFloat(req.body.contest_probability_threshold) || currentSettings.contest_probability_threshold,
      min_contest_videos_for_channel: parseInt(req.body.min_contest_videos_for_channel) || currentSettings.min_contest_videos_for_channel,
      min_subscriber_count: parseInt(req.body.min_subscriber_count) || currentSettings.min_subscriber_count,
      min_view_count: parseInt(req.body.min_view_count) || currentSettings.min_view_count,
      min_video_age: parseInt(req.body.min_video_age) || currentSettings.min_video_age,
      max_video_age: parseInt(req.body.max_video_age) || currentSettings.max_video_age
    };

    if (updatedSettings.enabled) {
      updatedSettings.next_sync = new Date(Date.now() + updatedSettings.search_interval * 60000);
    }

    await settings.update(updatedSettings);

    // Получаем обновленные настройки и форматируем их
    const updatedRecord = await YoutubeSettings.findOne();
    const formattedSettings = {
      id: updatedRecord.id,
      enabled: updatedRecord.enabled,
      api_key: updatedRecord.api_key,
      quota_limit: parseInt(updatedRecord.quota_limit),
      search_interval: parseInt(updatedRecord.search_interval),
      channel_check_interval: parseInt(updatedRecord.channel_check_interval),
      max_results: parseInt(updatedRecord.max_results),
      region: updatedRecord.region,
      language: updatedRecord.language,
      contest_probability_threshold: parseFloat(updatedRecord.contest_probability_threshold),
      min_contest_videos_for_channel: parseInt(updatedRecord.min_contest_videos_for_channel),
      video_order: updatedRecord.video_order,
      video_duration: updatedRecord.video_duration,
      video_definition: updatedRecord.video_definition,
      video_type: updatedRecord.video_type,
      min_subscriber_count: parseInt(updatedRecord.min_subscriber_count),
      min_view_count: parseInt(updatedRecord.min_view_count),
      min_video_age: parseInt(updatedRecord.min_video_age),
      max_video_age: parseInt(updatedRecord.max_video_age),
      last_sync: updatedRecord.last_sync,
      next_sync: updatedRecord.next_sync,
      created_at: updatedRecord.created_at,
      updated_at: updatedRecord.updated_at
    };

    return this.sendSuccess(res, formattedSettings);
  });
}

const youtubeController = new YoutubeController();
module.exports = youtubeController; 