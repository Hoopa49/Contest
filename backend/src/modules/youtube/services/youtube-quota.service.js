const { youtube_api_quota: YoutubeApiQuota, youtube_settings: YoutubeSettings } = require('../../../models');
const { logger } = require('../../../logging');
const { Op, Sequelize } = require('sequelize');

// Стоимость операций в единицах квоты
const QUOTA_COSTS = {
  SEARCH: 100,
  VIDEO_DETAILS: 1,
  CHANNEL_DETAILS: 1,
  COMMENTS: 1
};

class YoutubeQuotaService {
  constructor() {
    this.settings = null;
  }

  /**
   * Загрузка настроек
   */
  async loadSettings() {
    try {
      let settings = await YoutubeSettings.findOne();
      if (!settings) {
        settings = await YoutubeSettings.create({
          enabled: false,
          api_key: process.env.YOUTUBE_API_KEY || null,
          quota_limit: 10000,
          search_interval: 30,
          channel_check_interval: 60,
          max_results: 50,
          region: 'RU',
          language: 'ru',
          contest_probability_threshold: 0.7,
          min_contest_videos_for_channel: 3
        });
      }
      this.settings = settings;
      return settings;
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
   * Получение или создание записи о квоте для текущего дня
   */
  async getOrCreateQuota() {
    try {
      const settings = await this.getSettings();
      const today = new Date().toISOString().split('T')[0];

      // Ищем запись квоты на сегодня
      let quota = await YoutubeApiQuota.findOne({
        where: { date: today }
      });

      if (quota) {
        logger.info('Найдена существующая запись квоты:', {
          date: today,
          used: quota.quota_used,
          limit: settings.quota_limit
        });
        return quota;
      }

      try {
        // Создаем новую запись квоты
        quota = await YoutubeApiQuota.create({
          date: today,
          quota_used: 0,
          quota_limit: settings.quota_limit,
          search_requests: 0,
          video_requests: 0,
          channel_requests: 0,
          captions_requests: 0,
          error_count: 0,
          status: 'active',
          last_request_time: Sequelize.fn('NOW')
        });

        logger.info('Создана новая запись квоты:', {
          date: today,
          limit: settings.quota_limit
        });

        return quota;
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          // Если запись была создана другим процессом
          quota = await YoutubeApiQuota.findOne({
            where: { date: today }
          });
          return quota;
        }
        throw error;
      }
    } catch (error) {
      logger.error('Ошибка при работе с квотой:', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Проверка доступности квоты для операции
   */
  async checkQuotaAvailability(operation) {
    try {
      const settings = await this.getSettings();
      const quota = await this.getOrCreateQuota();
      const cost = QUOTA_COSTS[operation] || 1;

      return quota.quota_used + cost <= settings.quota_limit;
    } catch (error) {
      logger.error('Ошибка при проверке доступности квоты:', error);
      return false;
    }
  }

  /**
   * Регистрация использования квоты
   */
  async registerQuotaUsage(operation) {
    try {
      const quota = await this.getOrCreateQuota();
      const cost = QUOTA_COSTS[operation] || 1;

      quota.quota_used += cost;
      quota.last_request_time = Sequelize.fn('NOW');

      // Обновляем соответствующий счетчик запросов
      switch (operation) {
        case 'SEARCH':
          quota.search_requests += 1;
          break;
        case 'VIDEO_DETAILS':
          quota.video_requests += 1;
          break;
        case 'CHANNEL_DETAILS':
          quota.channel_requests += 1;
          break;
        case 'COMMENTS':
          quota.captions_requests += 1;
          break;
      }

      // Обновляем статус в зависимости от использования квоты
      const usagePercent = (quota.quota_used / quota.quota_limit) * 100;
      if (usagePercent >= 100) {
        quota.status = 'exceeded';
      } else if (usagePercent >= 80) {
        quota.status = 'warning';
      } else {
        quota.status = 'active';
      }

      await quota.save();

      return quota;
    } catch (error) {
      logger.error('Ошибка при регистрации использования квоты:', error);
      throw error;
    }
  }

  /**
   * Увеличение счетчика ошибок
   */
  async incrementErrorCount() {
    try {
      const quota = await this.getOrCreateQuota();
      quota.error_count += 1;
      quota.last_request_time = Sequelize.fn('NOW');
      await quota.save();

      return quota;
    } catch (error) {
      logger.error('Ошибка при увеличении счетчика ошибок:', error);
      throw error;
    }
  }

  /**
   * Получение статистики использования API
   */
  async getApiStats(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const history = await YoutubeApiQuota.findAll({
        where: {
          date: {
            [Op.gte]: startDate.toISOString().split('T')[0]
          }
        },
        order: [['date', 'ASC']]
      });

      const today = new Date().toISOString().split('T')[0];
      const todayStats = history.find(record => record.date === today);

      logger.info('Получена статистика использования API:', {
        days,
        records: history.length,
        todayUsed: todayStats?.quota_used || 0
      });

      const formattedHistory = history.map(record => ({
        date: record.date,
        used: record.quota_used,
        limit: record.quota_limit
      }));

      return {
        history: formattedHistory,
        today: todayStats ? {
          used: todayStats.quota_used,
          limit: todayStats.quota_limit,
          remaining: todayStats.quota_limit - todayStats.quota_used
        } : null
      };
    } catch (error) {
      logger.error('Ошибка получения статистики API:', {
        days,
        error: error.message
      });
      throw error;
    }
  }

  async getQuotaStats(days = 30) {
    try {
      logger.info('Запрос статистики квоты:', { days });

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const quotaRecords = await YoutubeApiQuota.findAll({
        where: {
          date: {
            [Op.gte]: startDate.toISOString().split('T')[0]
          }
        },
        order: [['date', 'ASC']]
      });

      const settings = await this.getSettings();
      const today = new Date().toISOString().split('T')[0];
      const todayQuota = quotaRecords.find(record => record.date === today);

      // Подсчитываем общую статистику
      const totalStats = quotaRecords.reduce((acc, record) => {
        acc.totalUsed += record.quota_used || 0;
        acc.totalSearchRequests += record.search_requests || 0;
        acc.totalVideoRequests += record.video_requests || 0;
        acc.totalChannelRequests += record.channel_requests || 0;
        acc.totalCaptionsRequests += record.captions_requests || 0;
        acc.totalErrors += record.error_count || 0;
        return acc;
      }, {
        totalUsed: 0,
        totalSearchRequests: 0,
        totalVideoRequests: 0,
        totalChannelRequests: 0,
        totalCaptionsRequests: 0,
        totalErrors: 0
      });

      logger.info('Получена статистика использования квоты:', {
        days,
        records: quotaRecords.length,
        todayUsed: todayQuota?.quota_used || 0,
        ...totalStats
      });

      const result = {
        history: quotaRecords.map(record => ({
          date: record.date,
          used: record.quota_used,
          limit: record.quota_limit,
          searchRequests: record.search_requests,
          videoRequests: record.video_requests,
          channelRequests: record.channel_requests,
          captionsRequests: record.captions_requests,
          errorCount: record.error_count,
          status: record.status
        })),
        today: todayQuota ? {
          used: todayQuota.quota_used,
          limit: settings.quota_limit,
          remaining: settings.quota_limit - todayQuota.quota_used,
          status: todayQuota.status
        } : null,
        totals: totalStats
      };

      logger.debug('Детали статистики квоты:', { result });

      return result;
    } catch (error) {
      logger.error('Ошибка получения статистики квоты:', {
        days,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
}

module.exports = new YoutubeQuotaService(); 