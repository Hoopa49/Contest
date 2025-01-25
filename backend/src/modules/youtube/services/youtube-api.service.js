const { google } = require('googleapis');
const { youtube_settings: YoutubeSettings } = require('../../../models');
const { logger } = require('../../../logging');

class YoutubeApiService {
  constructor(settings) {
    this.settings = settings;
    this.youtube = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      if (this.initialized) {
        return;
      }

      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        throw new Error('API ключ YouTube не настроен в переменных окружения');
      }

      this.youtube = google.youtube({
        version: 'v3',
        auth: apiKey
      });

      logger.info('YouTube API инициализирован:', { 
        apiKey: apiKey.substring(0, 5) + '...' 
      });

      this.initialized = true;
    } catch (error) {
      logger.error('Ошибка инициализации YouTube API:', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Загрузка настроек из базы данных
   */
  async loadSettings() {
    try {
      this.settings = await YoutubeSettings.findOne();
      if (!this.settings) {
        // Создаем дефолтные настройки
        this.settings = await YoutubeSettings.create({
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
      
      const apiKey = process.env.YOUTUBE_API_KEY;
      if (!apiKey) {
        logger.error('API ключ YouTube не настроен в переменных окружения');
        throw new Error('API ключ YouTube не настроен');
      }
      
      logger.debug('Инициализация YouTube API с ключом:', apiKey.substring(0, 5) + '...');
      this.youtube = google.youtube({
        version: 'v3',
        auth: apiKey
      });
      
      return this.settings;
    } catch (error) {
      logger.error('Ошибка при загрузке настроек YouTube API:', error);
      throw error;
    }
  }

  /**
   * Получение настроек
   */
  async getSettings() {
    if (!this.settings) {
      await this.loadSettings();
    }
    return this.settings;
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
      const response = await this.youtube.search.list({
        part: 'snippet',
        type: 'video',
        ...params
      });

      logger.debug('Выполнен поиск видео в YouTube API:', {
        query: params.q,
        maxResults: params.maxResults,
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

module.exports = new YoutubeApiService(); 