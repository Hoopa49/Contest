const { youtube_settings: YoutubeSettings, youtube_channel: YoutubeChannel } = require('../../../models');
const youtubeApi = require('./youtube-api.service');
const contestProcessor = require('./contest-processor.service');
const youtubeAnalytics = require('./youtube-analytics.service');
const { logger } = require('../../../logging');
const { Op } = require('sequelize');
const cron = require('node-cron');

class YoutubeSchedulerService {
  constructor() {
    this.settings = null;
    this.searchInterval = null;
    this.channelInterval = null;
    this.analyticsInterval = null;
  }

  /**
   * Загрузка настроек
   */
  async loadSettings() {
    try {
      this.settings = await YoutubeSettings.findOne();
      if (!this.settings) {
        throw new Error('Настройки YouTube API не найдены');
      }
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
   * Поиск новых видео
   * @param {Object} customParams - Пользовательские параметры поиска
   */
  async searchNewVideos(customParams = null) {
    try {
      const settings = await this.getSettings();
      const keywords = ['конкурс', 'розыгрыш', 'giveaway'];
      
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
      
      for (const keyword of keywords) {
        const response = await youtubeApi.searchVideos(keyword, null, searchParams);
        if (response && response.items) {
          for (const item of response.items) {
            await contestProcessor.processVideo(item.id.videoId, searchParams);
          }
        }
      }

      // Обновляем время последней и следующей синхронизации
      settings.last_sync = new Date();
      settings.next_sync = new Date(Date.now() + settings.search_interval * 60 * 1000);
      await settings.save();

      logger.info('Поиск новых видео завершен');
    } catch (error) {
      logger.error('Ошибка при поиске новых видео:', error);
      throw error; // Пробрасываем ошибку дальше для обработки в контроллере
    }
  }

  /**
   * Проверка каналов
   */
  async checkChannels() {
    try {
      const settings = await this.getSettings();
      const channels = await YoutubeChannel.findAll({
        where: {
          contest_count: {
            [Op.gte]: settings.min_contest_videos_for_channel
          }
        }
      });

      for (const channel of channels) {
        const response = await youtubeApi.getChannelVideos(channel.channel_id);
        if (response && response.items) {
          for (const item of response.items) {
            await contestProcessor.processVideo(item.id.videoId);
          }
        }
      }

      logger.info('Проверка каналов завершена');
    } catch (error) {
      logger.error('Ошибка при проверке каналов:', error);
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
      this.startAnalyticsScheduler();

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
  startAnalyticsScheduler() {
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
    youtubeAnalytics.aggregateStats(new Date())
      .then(() => logger.info('Начальное обновление статистики YouTube выполнено'))
      .catch(error => logger.error('Ошибка при начальном обновлении статистики:', error));
  }
}

module.exports = new YoutubeSchedulerService(); 