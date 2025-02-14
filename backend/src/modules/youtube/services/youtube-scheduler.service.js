const youtubeApi = require('./youtube-api.service');
const contestProcessor = require('./contest-processor.service');
const youtubeAnalytics = require('./youtube-analytics.service');
const { logger } = require('../../../logging');
const { Op } = require('sequelize');
const cron = require('node-cron');
const { initializeModels } = require('../../../models');

class YoutubeSchedulerService {
  constructor() {
    this.settings = null;
    this.searchInterval = null;
    this.channelInterval = null;
    this.analyticsInterval = null;
    this.models = null;
    this.initialized = false;
  }

  /**
   * Инициализация сервиса
   */
  async initialize() {
    try {
      if (!this.initialized) {
        this.models = await initializeModels();
        if (!this.models) {
          throw new Error('Не удалось инициализировать модели');
        }
        this.initialized = true;
        logger.info('YouTube планировщик успешно инициализирован');
      }
      return true;
    } catch (error) {
      logger.error('Ошибка при инициализации YouTube планировщика:', error);
      throw error;
    }
  }

  /**
   * Загрузка настроек
   */
  async loadSettings() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      const settings = await this.models.YoutubeSettings.findOne();
      if (!settings) {
        logger.error('Настройки YouTube не найдены');
        return null;
      }
      
      this.settings = settings;
      return settings;
    } catch (error) {
      logger.error('Ошибка загрузки настроек YouTube:', error);
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
   * Поиск новых видео
   * @param {Object} customParams - Пользовательские параметры поиска
   */
  async searchNewVideos(customParams = null) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const settings = await this.loadSettings();
      if (!settings) {
        throw new Error('Настройки YouTube не найдены');
      }

      const searchParams = customParams || {
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

      logger.info('Начат поиск видео с параметрами:', { searchParams });

      const keywords = ['конкурс', 'розыгрыш', 'giveaway'];
      for (const keyword of keywords) {
        try {
          const response = await youtubeApi.searchVideos(keyword, searchParams);
          if (response?.items) {
            for (const item of response.items) {
              await contestProcessor.processVideo(item.id.videoId, searchParams);
            }
          }
        } catch (error) {
          logger.error(`Ошибка при поиске по ключевому слову "${keyword}":`, error);
        }
      }

      // Обновляем время последней и следующей синхронизации
      if (settings) {
        settings.last_sync = new Date();
        settings.next_sync = new Date(Date.now() + settings.search_interval * 60 * 1000);
        await settings.save();
      }

      logger.info('Поиск видео завершен');
    } catch (error) {
      logger.error('Ошибка при поиске новых видео:', error);
      throw error;
    }
  }

  /**
   * Проверка каналов
   */
  async checkChannels() {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const settings = await this.loadSettings();
      if (!settings) {
        throw new Error('Настройки не найдены');
      }

      const channels = await this.models.YoutubeChannel.findAll({
        where: {
          contest_channel: true,
          status: 'active'
        }
      });

      logger.info(`Начата проверка ${channels.length} каналов`);

      for (const channel of channels) {
        try {
          const videos = await youtubeApi.getChannelVideos(channel.channel_id);
          await contestProcessor.processChannelVideos(channel, videos);
        } catch (error) {
          logger.error(`Ошибка при обработке канала ${channel.channel_id}:`, error);
        }
      }

      logger.info('Проверка каналов завершена');
    } catch (error) {
      logger.error('Ошибка при проверке каналов:', error);
      throw error;
    }
  }

  /**
   * Запуск всех задач
   */
  async startAll() {
    try {
      const settings = await this.getSettings();

      // Останавливаем существующие интервалы
      this.stopAll();

      // Запускаем поиск новых видео
      this.searchInterval = setInterval(
        () => this.searchNewVideos(),
        settings.search_interval * 60 * 1000
      );

      // Запускаем проверку каналов
      this.channelInterval = setInterval(
        () => this.checkChannels(),
        settings.channel_check_interval * 60 * 1000
      );

      // Запускаем планировщик обновления статистики
      await this.startAnalyticsScheduler();

      // Выполняем первый поиск сразу
      await this.searchNewVideos();

      logger.info('Планировщик задач запущен');
    } catch (error) {
      logger.error('Ошибка при запуске планировщика:', error);
    }
  }

  /**
   * Остановка всех задач
   */
  stopAll() {
    if (this.searchInterval) {
      clearInterval(this.searchInterval);
      this.searchInterval = null;
    }

    if (this.channelInterval) {
      clearInterval(this.channelInterval);
      this.channelInterval = null;
    }

    logger.info('Планировщик задач остановлен');
  }

  /**
   * Запуск планировщика обновления статистики
   */
  async startAnalyticsScheduler() {
    try {
      // Инициализируем сервис аналитики
      await youtubeAnalytics.initialize();

      // Очищаем предыдущий интервал, если он был
      if (this.analyticsInterval) {
        clearInterval(this.analyticsInterval);
      }

      // Обновляем статистику каждые 24 часа
      this.analyticsInterval = setInterval(async () => {
        try {
          logger.info('Запуск обновления статистики YouTube');
          await youtubeAnalytics.aggregateStats(new Date());
          logger.info('Статистика YouTube успешно обновлена');
        } catch (error) {
          logger.error('Ошибка при обновлении статистики YouTube:', error);
        }
      }, 24 * 60 * 60 * 1000); // 24 часа

      // Запускаем первое обновление сразу
      await youtubeAnalytics.aggregateStats(new Date());
      logger.info('Начальное обновление статистики YouTube выполнено');
    } catch (error) {
      logger.error('Ошибка при запуске планировщика аналитики:', error);
      throw error;
    }
  }
}

module.exports = new YoutubeSchedulerService(); 