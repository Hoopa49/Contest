const { google } = require('googleapis');
const { initializeModels } = require('../../../models');
const { logger } = require('../../../logging');
const { apiLogger, apiErrorLogger, logApiRequest, logApiResponse, logApiError } = require('../../../logging/youtube-api.logger');
const { ApiError } = require('../../../utils/errors');
const { quotaService } = require('./youtube-quota.service');

class YoutubeApiService {
  constructor() {
    this.settings = null;
    this.youtube = null;
    this.initialized = false;
    this.initializationPromise = null;
    this.models = null;
  }

  async initialize() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        logApiRequest('INITIALIZE', {
          timestamp: new Date().toISOString()
        });

        // Инициализируем модели
        this.models = await initializeModels();
        
        // Проверяем наличие необходимых моделей
        const requiredModels = ['YoutubeSettings', 'YoutubeVideo', 'YoutubeChannel', 'YoutubeApiQuota'];
        const missingModels = requiredModels.filter(model => !this.models[model]);
        
        if (missingModels.length > 0) {
          const error = new Error('Отсутствуют необходимые модели');
          logApiError('INITIALIZE_ERROR', error, { missingModels });
          throw error;
        }

        // Проверяем наличие API ключа
        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) {
          throw new ApiError(
            'API ключ YouTube не настроен в переменных окружения',
            500,
            'API_KEY_MISSING'
          );
        }

        // Инициализируем клиент YouTube API
        this.youtube = google.youtube({
          version: 'v3',
          auth: apiKey
        });

        // Загружаем настройки
        await this.loadSettings();

        this.initialized = true;
        logger.info('YouTube API сервис успешно инициализирован', {
          context: {
            hasModels: !!this.models,
            hasSettings: !!this.settings,
            hasYoutubeClient: !!this.youtube,
            availableModels: Object.keys(this.models)
          }
        });
      } catch (error) {
        this.initialized = false;
        logger.error('Ошибка при инициализации YouTube API сервиса:', {
          error: error?.message,
          stack: error?.stack,
          context: {
            hasApiKey: !!process.env.YOUTUBE_API_KEY,
            hasYoutubeClient: !!this.youtube,
            hasSettings: !!this.settings,
            hasModels: !!this.models,
            modelsInitialized: this.models ? Object.keys(this.models).length : 0
          }
        });
        throw error;
      }
    })();

    return this.initializationPromise;
  }

  /**
   * Загрузка настроек из базы данных
   */
  async loadSettings() {
    try {
      logger.debug('Загрузка настроек YouTube API');
      
      if (!this.models || !this.models.YoutubeSettings) {
        throw new ApiError(
          'Модели не инициализированы',
          500,
          'MODELS_NOT_INITIALIZED'
        );
      }

      this.settings = await this.models.YoutubeSettings.findOne();
      if (!this.settings) {
        logger.info('Создание дефолтных настроек YouTube API');
        
        // Создаем дефолтные настройки
        this.settings = await this.models.YoutubeSettings.create({
          enabled: false,
          quota_limit: parseInt(process.env.YOUTUBE_QUOTA_LIMIT) || 10000,
          search_interval: parseInt(process.env.YOUTUBE_SEARCH_INTERVAL) || 30,
          channel_check_interval: parseInt(process.env.YOUTUBE_CHANNEL_CHECK_INTERVAL) || 60,
          max_results: parseInt(process.env.YOUTUBE_MAX_RESULTS) || 50,
          region: process.env.YOUTUBE_REGION || 'RU',
          language: process.env.YOUTUBE_LANGUAGE || 'ru',
          contest_probability_threshold: parseFloat(process.env.YOUTUBE_CONTEST_PROBABILITY_THRESHOLD) || 0.7,
          min_contest_videos_for_channel: parseInt(process.env.YOUTUBE_MIN_CONTEST_VIDEOS_FOR_CHANNEL) || 3,
          video_order: 'date',
          video_duration: 'any',
          video_definition: 'any',
          video_type: 'video',
          min_subscriber_count: 0,
          min_view_count: 0,
          min_video_age: 0,
          max_video_age: 30
        });
      }
      
      logger.debug('Настройки YouTube API загружены успешно', {
        context: {
          enabled: this.settings.enabled,
          quotaLimit: this.settings.quota_limit
        }
      });
      return this.settings;
    } catch (error) {
      logger.error('Ошибка при загрузке настроек YouTube API:', {
        error: error?.message,
        stack: error?.stack,
        context: {
          hasModels: !!this.models,
          modelExists: !!this.models?.YoutubeSettings
        }
      });
      throw new ApiError(
        'Ошибка загрузки настроек YouTube API',
        500,
        'SETTINGS_LOAD_ERROR',
        error?.message
      );
    }
  }

  /**
   * Получение настроек
   */
  async getSettings() {
    if (!this.initialized) {
      throw new ApiError(
        'YouTube API сервис не инициализирован',
        503,
        'SERVICE_NOT_INITIALIZED'
      );
    }
    return this.settings;
  }

  /**
   * Получение информации о квоте
   */
  async getQuotaInfo() {
    if (!this.initialized) {
      throw new ApiError(
        'YouTube API сервис не инициализирован',
        503,
        'SERVICE_NOT_INITIALIZED'
      );
    }

    try {
      // Здесь должна быть логика получения информации о квоте
      // Пока возвращаем заглушку
      return {
        used: 0,
        lastSync: new Date()
      };
    } catch (error) {
      logger.error('Ошибка при получении информации о квоте:', {
        error: error?.message,
        stack: error?.stack
      });
      throw new ApiError(
        'Ошибка получения информации о квоте',
        500,
        'QUOTA_INFO_ERROR',
        error?.message
      );
    }
  }

  /**
   * Создание базовых параметров запроса
   */
  async getBaseParams() {
    const settings = await this.getSettings();
    return {
      regionCode: settings.region,
      relevanceLanguage: settings.language,
      maxResults: settings.max_results
    };
  }

  /**
   * Поиск видео по ключевым словам
   */
  async searchVideos(params) {
    try {
      // Регистрируем использование квоты для поиска (100 токенов)
      await quotaService.registerQuotaUsage('SEARCH', 1);

      const settings = await this.getSettings();
      const searchParams = {
        part: 'snippet',
        type: 'video',
        maxResults: params.maxResults || settings.max_results,
        ...params
      };

      const response = await this.youtube.search.list(searchParams);

      logger.debug('Выполнен поиск видео в YouTube API:', {
        query: params.q,
        maxResults: searchParams.maxResults,
        totalResults: response.data.pageInfo.totalResults
      });

      return response.data;
    } catch (error) {
      logger.error('Ошибка при поиске видео в YouTube API:', {
        error: error.message,
        params
      });
      throw error;
    }
  }

  /**
   * Получение деталей видео
   * @param {string} videoId - ID видео
   */
  async getVideoDetails(videoId) {
    try {
      const response = await this.youtube.videos.list({
        part: 'snippet,statistics',
        id: videoId
      });

      logger.debug('Получены детали видео из YouTube API:', {
        videoId,
        found: response.data.items.length > 0
      });

      return response.data.items[0];
    } catch (error) {
      logger.error('Ошибка при получении деталей видео из YouTube API:', {
        error: error.message,
        videoId
      });
      throw error;
    }
  }

  /**
   * Получение деталей канала
   * @param {string} channelId - ID канала
   */
  async getChannelDetails(channelId) {
    try {
      if (!this.youtube) {
        await this.loadSettings();
      }

      const response = await this.youtube.channels.list({
        part: 'snippet,statistics',
        id: channelId
      });

      if (!response.data.items || response.data.items.length === 0) {
        logger.warn('Канал не найден:', channelId);
        return null;
      }

      return response.data.items[0];
    } catch (error) {
      logger.error('Ошибка при получении деталей канала:', error);
      throw error;
    }
  }

  /**
   * Получение списка видео канала
   */
  async getChannelVideos(channelId, pageToken = null) {
    try {
      if (!this.youtube) {
        await this.loadSettings();
      }

      const params = {
        ...(await this.getBaseParams()),
        part: 'snippet',
        type: 'video',
        channelId: channelId,
        order: 'date'
      };

      if (pageToken) {
        params.pageToken = pageToken;
      }

      const response = await this.youtube.search.list(params);
      return response.data;
    } catch (error) {
      logger.error('Ошибка при получении списка видео канала:', error);
      throw error;
    }
  }

  /**
   * Получение комментариев к видео
   */
  async getVideoComments(videoId, pageToken = null) {
    try {
      if (!this.youtube) {
        await this.loadSettings();
      }

      const params = {
        ...(await this.getBaseParams()),
        part: 'snippet',
        videoId: videoId,
        order: 'relevance'
      };

      if (pageToken) {
        params.pageToken = pageToken;
      }

      const response = await this.youtube.commentThreads.list(params);
      return response.data;
    } catch (error) {
      logger.error('Ошибка при получении комментариев к видео:', error);
      throw error;
    }
  }
}

// Создаем и экспортируем экземпляр сервиса
const youtubeApiService = new YoutubeApiService();
module.exports = youtubeApiService; 