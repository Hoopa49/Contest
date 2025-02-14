/**
 * YouTube Controller
 * Контроллер для обработки запросов к YouTube API
 */

const BaseController = require('../../../controllers/base.controller');
const { initializeModels } = require('../../../models');
const youtubeApi = require('../services/youtube-api.service');
const contestProcessor = require('../services/contest-processor.service');
const { quotaService } = require('../services/youtube-quota.service');
const scheduler = require('../services/youtube-scheduler.service');
const { logger } = require('../../../logging');
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const youtubeService = require('../services/youtube.service').youtubeService;
const youtubeAnalyticsService = require('../services/youtube-analytics.service');
const { ApiError, ValidationError } = require('../../../utils/errors');

class YoutubeController extends BaseController {
  constructor() {
    super(youtubeService);
    this.youtubeApi = youtubeApi;
    this.quotaService = quotaService;
    this.models = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      this.models = await initializeModels();
      // Инициализируем YouTube сервис
      await youtubeService.initialize();
      // Инициализируем YouTube API
      await this.youtubeApi.initialize();
      // Инициализируем сервис квот после инициализации моделей
      await this.quotaService.loadSettings();
      // Инициализируем планировщик, но не запускаем его
      await scheduler.initialize();
      
      this.initialized = true;
      logger.info('YouTube контроллер успешно инициализирован');
    } catch (error) {
      logger.error('Ошибка при инициализации YouTube контроллера:', {
        error: error?.message,
        stack: error?.stack,
        context: {
          modelsInitialized: !!this.models,
          apiInitialized: this.youtubeApi?.initialized,
          serviceInitialized: youtubeService.initialized,
          schedulerInitialized: scheduler?.initialized
        }
      });
      throw error;
    }
  }

  async ensureModels() {
    if (!this.models) {
      try {
        this.models = await initializeModels();
        
        if (!this.models) {
          const error = new ValidationError('Не удалось инициализировать модели: модели не определены');
          logger.error(error.message);
          throw error;
        }

        // Проверяем наличие всех необходимых моделей
        const requiredModels = [
          'YoutubeSettings', 
          'IntegrationStats', 
          'Contest', 
          'User',
          'YoutubeChannel',
          'YoutubeVideo'
        ];
        const missingModels = requiredModels.filter(modelName => !this.models[modelName]);
        
        if (missingModels.length > 0) {
          const error = new ValidationError('Отсутствуют необходимые модели', {
            missingModels: missingModels
          });
          logger.error(error.message, {
            metadata: {
              missingModels: missingModels
            }
          });
          throw error;
        }

        logger.info('Модели успешно инициализированы', {
          metadata: {
            availableModels: Object.keys(this.models)
          }
        });
      } catch (err) {
        const error = err instanceof ValidationError ? err : 
                     err instanceof ApiError ? err :
                     new ApiError('Ошибка инициализации моделей', 500, err);
                     
        logger.error('Ошибка инициализации моделей:', {
          metadata: {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
          }
        });
        
        throw error;
      }
    }
    return this.models;
  }

  /**
   * Поиск видео на YouTube
   */
  searchVideos = this.handleAsync(async (req, res) => {
    try {
      await this.ensureModels();
      const { query, maxResults = 50 } = req.query;

      if (!query) {
        throw new ApiError('Необходимо указать поисковый запрос', 400);
      }

      const videos = await this.youtubeApi.searchVideos(query, maxResults);
      logger.info('Выполнен поиск видео:', { 
        metadata: {
          query,
          maxResults,
          found: videos?.length || 0,
          userId: req.user?.id,
          timestamp: new Date().toISOString()
        }
      });

      return this.sendSuccess(res, videos);
    } catch (error) {
      logger.error('Ошибка поиска видео:', {
        metadata: {
          error: error.message,
          stack: error.stack,
          query: req.query
        }
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Ошибка поиска видео', 500, error);
    }
  });

  /**
   * Получение информации о видео
   */
  getVideoDetails = this.handleAsync(async (req, res) => {
    try {
      const { videoId } = req.params;

      if (!videoId) {
        throw new ApiError('Необходимо указать ID видео', 400);
      }

      const video = await this.youtubeApi.getVideoDetails(videoId);
      
      if (!video) {
        logger.warn('Видео не найдено:', { 
          metadata: {
            videoId,
            userId: req.user?.id,
            timestamp: new Date().toISOString()
          }
        });
        throw new ApiError('Видео не найдено', 404);
      }

      logger.info('Получены детали видео:', { 
        metadata: {
          videoId,
          title: video.title,
          channelId: video.channelId,
          publishedAt: video.publishedAt,
          userId: req.user?.id,
          timestamp: new Date().toISOString()
        }
      });

      return this.sendSuccess(res, video);
    } catch (error) {
      logger.error('Ошибка получения деталей видео:', {
        metadata: {
          error: error.message,
          stack: error.stack,
          videoId: req.params.videoId
        }
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Ошибка получения деталей видео', 500, error);
    }
  });

  /**
   * Получение информации о канале
   */
  getChannelDetails = this.handleAsync(async (req, res) => {
    try {
      const { channelId } = req.params;

      if (!channelId) {
        throw new ApiError('Необходимо указать ID канала', 400);
      }

      const channel = await this.youtubeApi.getChannelDetails(channelId);
      
      if (!channel) {
        throw new ApiError('Канал не найден', 404);
      }

      return this.sendSuccess(res, channel);
    } catch (error) {
      logger.error('Ошибка получения деталей канала:', {
        metadata: {
          error: error.message,
          stack: error.stack,
          channelId: req.params.channelId
        }
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Ошибка получения деталей канала', 500, error);
    }
  });

  /**
   * Получение статистики использования API
   */
  getApiStats = this.handleAsync(async (req, res) => {
    try {
      if (!this.initialized) {
        throw new ApiError('Контроллер YouTube не инициализирован', 503);
      }
      
      await this.ensureModels();
      if (!this.quotaService) {
        throw new ApiError('Сервис квот не инициализирован', 500);
      }
      const days = parseInt(req.query.days) || 30;
      const stats = await this.quotaService.getApiStats(days);
      logger.info('Получена статистика API:', { 
        metadata: { 
          days 
        }
      });
      return this.sendSuccess(res, stats);
    } catch (error) {
      logger.error('Ошибка получения статистики API:', {
        metadata: {
          error: error.message,
          stack: error.stack,
          days: req.query.days
        }
      });
      throw new ApiError('Ошибка получения статистики API', 500, error);
    }
  });

  /**
   * Получение аналитики по конкурсным видео
   */
  getContestAnalytics = this.handleAsync(async (req, res) => {
    try {
      const { days = 7 } = req.query;
      const stats = await contestProcessor.getContestStats(days);
      return this.sendSuccess(res, stats);
    } catch (error) {
      logger.error('Ошибка получения аналитики конкурсов:', {
        metadata: {
          error: error.message,
          stack: error.stack,
          days: req.query.days
        }
      });
      throw new ApiError('Ошибка получения аналитики конкурсов', 500, error);
    }
  });

  /**
   * Запуск автоматического поиска видео
   */
  startVideoSearch = this.handleAsync(async (req, res) => {
    try {
      if (!this.initialized) {
        throw new ApiError('YouTube контроллер не инициализирован', 503);
      }

      if (!scheduler.initialized) {
        await scheduler.initialize();
      }

      const searchParams = req.body;
      await scheduler.searchNewVideos(searchParams);
      
      return this.sendSuccess(res, { 
        message: 'Поиск запущен',
        status: 'success'
      });
    } catch (error) {
      logger.error('Ошибка запуска поиска видео:', {
        metadata: {
          error: error.message,
          stack: error.stack,
          context: {
            controllerInitialized: this.initialized,
            schedulerInitialized: scheduler?.initialized
          }
        }
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Ошибка запуска поиска видео', 500, error);
    }
  });

  /**
   * Получение списка конкурсных видео
   */
  getContestVideos = this.handleAsync(async (req, res) => {
    try {
      await this.ensureModels();
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const videos = await this.models.YoutubeVideo.findAndCountAll({
        where: {
          is_contest: true,
          status: 'processed',
          contest_status: 'active'
        },
        limit,
        offset,
        order: [['publish_date', 'DESC']]
      });

      logger.debug('Получены конкурсные видео:', {
        metadata: {
          total: videos.count,
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });

      return this.sendSuccess(res, {
        videos: videos.rows,
        total: videos.count,
        page: parseInt(page),
        totalPages: Math.ceil(videos.count / limit)
      });
    } catch (error) {
      logger.error('Ошибка получения конкурсных видео:', {
        metadata: {
          error: error.message,
          stack: error.stack,
          query: req.query
        }
      });
      throw new ApiError('Ошибка получения конкурсных видео', 500, error);
    }
  });

  /**
   * Получение списка активных конкурсных каналов
   */
  getContestChannels = this.handleAsync(async (req, res) => {
    try {
      await this.ensureModels();
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const channels = await this.models.YoutubeChannel.findAndCountAll({
        where: {
          contest_channel: true,
          status: 'active'
        },
        limit,
        offset,
        order: [['contest_videos_count', 'DESC']]
      });

      logger.debug('Получены конкурсные каналы:', {
        metadata: {
          total: channels.count,
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });

      return this.sendSuccess(res, {
        channels: channels.rows,
        total: channels.count,
        page: parseInt(page),
        totalPages: Math.ceil(channels.count / limit)
      });
    } catch (error) {
      logger.error('Ошибка получения конкурсных каналов:', {
        metadata: {
          error: error.message,
          stack: error.stack,
          query: req.query
        }
      });
      throw new ApiError('Ошибка получения конкурсных каналов', 500, error);
    }
  });

  /**
   * Получение статистики конкурсов
   */
  getStats = this.handleAsync(async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const parsedDays = parseInt(days);
      
      logger.info('Запрос статистики YouTube:', { 
        metadata: {
          days: parsedDays,
          userId: req.user?.id,
          timestamp: new Date().toISOString()
        }
      });
      
      // Получаем статистику
      const stats = await youtubeAnalyticsService.getStats(parsedDays);
      
      logger.trace('Получена статистика YouTube:', {
        metadata: {
          total_contests: stats.total_contests,
          active_contests: stats.active_contests,
          channels_count: stats.channels_count,
          avg_prize_value: stats.avg_prize_value,
          contest_types: stats.contest_types.length,
          daily_stats: stats.daily_stats.length,
          days: parsedDays,
          userId: req.user?.id,
          timestamp: new Date().toISOString()
        }
      });

      return this.sendSuccess(res, stats);
    } catch (error) {
      logger.error('Ошибка получения статистики YouTube:', {
        metadata: {
          error: error.message,
          stack: error.stack,
          days: req.query.days
        }
      });
      throw new ApiError('Ошибка получения статистики YouTube', 500, error);
    }
  });

  /**
   * Получение статистики конкурсов
   */
  getContestStats = this.handleAsync(async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      // Получаем статистику из сервиса
      const stats = await youtubeService.getContestStats({
        startDate,
        endDate
      });

      return this.sendSuccess(res, {
        total: stats.total,
        active: stats.active,
        channels: stats.channels,
        dailyStats: stats.dailyStats
      }, 'Статистика конкурсов получена успешно');
    } catch (error) {
      logger.error('Ошибка получения статистики конкурсов:', {
        metadata: {
          error: error.message,
          stack: error.stack,
          query: req.query
        }
      });
      return this.sendError(res, error);
    }
  });

  /**
   * Получение статуса интеграции
   */
  getIntegrationStatus = async (req, res) => {
    try {
      // Проверяем инициализацию
      if (!this.initialized) {
        logger.warn('Попытка получить статус неинициализированного контроллера');
        return res.status(503).json({
          success: false,
          error: {
            message: 'Сервис YouTube временно недоступен, идет инициализация',
            code: 'SERVICE_INITIALIZING',
            status: 503
          }
        });
      }

      // Безопасное получение настроек и информации о квоте
      let settings = null;
      let quotaInfo = null;
      let errors = [];

      try {
        settings = await this.youtubeApi.getSettings();
      } catch (settingsError) {
        logger.error('Ошибка при получении настроек YouTube:', {
          error: settingsError?.message,
          stack: settingsError?.stack,
          context: {
            controller: 'YoutubeController',
            method: 'getIntegrationStatus',
            component: 'settings'
          }
        });
        errors.push({
          component: 'settings',
          message: settingsError?.message
        });
      }

      try {
        quotaInfo = await this.youtubeApi.getQuotaInfo();
      } catch (quotaError) {
        logger.error('Ошибка при получении информации о квоте:', {
          error: quotaError?.message,
          stack: quotaError?.stack,
          context: {
            controller: 'YoutubeController',
            method: 'getIntegrationStatus',
            component: 'quota'
          }
        });
        errors.push({
          component: 'quota',
          message: quotaError?.message
        });
      }

      // Формируем ответ
      return res.json({
        success: true,
        data: {
          initialized: this.initialized,
          enabled: settings?.enabled || false,
          quotaLimit: settings?.quota_limit || 0,
          quotaUsed: quotaInfo?.used || 0,
          lastSync: quotaInfo?.lastSync || null,
          status: this.initialized ? 'ready' : 'not_initialized',
          errors: errors.length > 0 ? errors : null
        }
      });
    } catch (error) {
      logger.error('Критическая ошибка при получении статуса интеграции:', {
        error: error?.message,
        stack: error?.stack,
        context: {
          controller: 'YoutubeController',
          method: 'getIntegrationStatus',
          initialized: this.initialized,
          apiInitialized: this.youtubeApi?.initialized
        }
      });

      return res.status(error?.status || 500).json({
        success: false,
        error: {
          message: error?.message || 'Ошибка при получении статуса интеграции',
          code: error?.code || 'INTEGRATION_STATUS_ERROR',
          status: error?.status || 500,
          details: error?.details || null
        }
      });
    }
  };

  /**
   * Переключение статуса интеграции
   */
  toggleIntegration = this.handleAsync(async (req, res) => {
    try {
      await this.ensureModels();
      const { enabled } = req.body;
      
      if (typeof enabled !== 'boolean') {
        throw new ApiError('Параметр enabled должен быть булевым значением', 400);
      }

      if (enabled && !process.env.YOUTUBE_API_KEY) {
        throw new ApiError('Необходимо указать API ключ YouTube в переменных окружения перед включением интеграции', 400);
      }

      // Получаем или создаем настройки YouTube
      let [settings] = await this.models.YoutubeSettings.findOrCreate({
        where: {},
        defaults: {
          enabled: false,
          quota_limit: 10000,
          search_interval: 30,
          channel_check_interval: 60,
          max_results: 50,
          region: 'RU',
          language: 'ru'
        }
      });

      // Получаем или создаем статистику интеграции
      let [integrationStats] = await this.models.IntegrationStats.findOrCreate({
        where: { platform: 'youtube' },
        defaults: {
          enabled: false,
          total_requests: 0,
          successful_requests: 0,
          failed_requests: 0
        }
      });

      // Обновляем оба статуса
      settings.enabled = enabled;
      integrationStats.enabled = enabled;

      if (enabled) {
        settings.next_sync = new Date(Date.now() + settings.search_interval * 60000);
        // Если включаем интеграцию, инициализируем планировщик
        if (!scheduler.initialized) {
          await scheduler.initialize();
        }
      } else {
        settings.next_sync = null;
        // Если выключаем интеграцию, останавливаем планировщик
        scheduler.stopAll();
      }
      
      await Promise.all([
        settings.save(),
        integrationStats.save()
      ]);

      // Создаем запись в истории изменений
      await this.models.SystemSettingsHistory.create({
        setting_key: 'youtube_integration',
        old_value: !enabled,
        new_value: enabled,
        changed_by: req.user?.id || 'system'
      });

      return this.sendSuccess(res, { 
        enabled: settings.enabled,
        hasApiKey: !!process.env.YOUTUBE_API_KEY
      });
    } catch (error) {
      logger.error('Ошибка переключения статуса интеграции:', {
        metadata: {
          error: error.message,
          stack: error.stack
        }
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Ошибка переключения статуса интеграции', 500, error);
    }
  });

  /**
   * Получение настроек
   */
  getSettings = this.handleAsync(async (req, res) => {
    try {
      await this.ensureModels();
      const settings = await this.models.YoutubeSettings.findOne();
      
      if (!settings) {
        // Если настройки не найдены, создаем их с дефолтными значениями
        const defaultSettings = await this.models.YoutubeSettings.create({
          enabled: false,
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

        return this.sendSuccess(res, {
          ...defaultSettings.toJSON(),
          api_key: process.env.YOUTUBE_API_KEY || null
        });
      }

      // Преобразуем данные в нужный формат
      const formattedSettings = {
        id: settings.id,
        enabled: settings.enabled,
        api_key: process.env.YOUTUBE_API_KEY || null,
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
    } catch (error) {
      logger.error('Ошибка получения настроек:', {
        metadata: {
          error: error.message,
          stack: error.stack
        }
      });
      throw new ApiError('Ошибка получения настроек', 500, error);
    }
  });

  /**
   * Обновление настроек
   */
  updateSettings = this.handleAsync(async (req, res) => {
    try {
      await this.ensureModels();
      const settings = await this.models.YoutubeSettings.findOne();
      
      if (!settings) {
        throw new ApiError('Настройки не найдены', 404);
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
      const updatedRecord = await this.models.YoutubeSettings.findOne();
      const formattedSettings = {
        id: updatedRecord.id,
        enabled: updatedRecord.enabled,
        api_key: process.env.YOUTUBE_API_KEY || null,
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
    } catch (error) {
      logger.error('Ошибка обновления настроек:', {
        metadata: {
          error: error.message,
          stack: error.stack,
          body: req.body
        }
      });
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Ошибка обновления настроек', 500, error);
    }
  });
}

// Создаем и экспортируем контроллер
const controller = new YoutubeController();

module.exports = {
  controller,
  initialize: async () => {
    try {
      if (!controller.initialized) {
        await controller.initialize();
      }
      return controller;
    } catch (err) {
      logger.error('Ошибка инициализации контроллера YouTube:', {
        metadata: {
          message: err?.message || 'Неизвестная ошибка',
          stack: err?.stack || 'No stack trace',
          timestamp: new Date().toISOString()
        }
      });
      throw new ApiError(
        'Ошибка инициализации контроллера YouTube',
        500,
        'CONTROLLER_INITIALIZATION_ERROR'
      );
    }
  }
}; 