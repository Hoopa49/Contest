const { initializeModels } = require('../../../models');
const { logger } = require('../../../logging');
const { apiLogger, apiErrorLogger, logApiRequest, logApiResponse, logApiError } = require('../../../logging/youtube-api.logger');
const { Op, Sequelize } = require('sequelize');
const { ApiError } = require('../../../utils/errors');

// Стоимость операций в единицах квоты
const QUOTA_COSTS = {
  SEARCH: 100,           // search.list стоит 100 единиц
  VIDEO_DETAILS: 1,      // videos.list стоит 1 единицу за каждое видео
  CHANNEL_DETAILS: 1,    // channels.list стоит 1 единицу
  CAPTIONS: 50,         // captions.list стоит 50 единиц
  PLAYLIST_ITEMS: 1,    // playlistItems.list стоит 1 единицу
  PLAYLISTS: 1,         // playlists.list стоит 1 единицу
  SUBSCRIPTIONS: 1,     // subscriptions.list стоит 1 единицу
  VIDEO_CATEGORIES: 1   // videoCategories.list стоит 1 единицу
};

class YoutubeQuotaService {
  constructor() {
    this.settings = null;
    this.models = null;
  }

  /**
   * Загрузка настроек
   */
  async loadSettings() {
    try {
      if (!this.models) {
        this.models = await initializeModels();
      }

      let settings = await this.models.YoutubeSettings.findOne();
      if (!settings) {
        settings = await this.models.YoutubeSettings.create({
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
      throw new ApiError('Ошибка при загрузке настроек YouTube API', 500, error);
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
      if (!this.models) {
        this.models = await initializeModels();
      }

      const settings = await this.getSettings();
      const today = new Date().toISOString().split('T')[0];

      // Ищем запись квоты на сегодня
      let quota = await this.models.YoutubeApiQuota.findOne({
        where: { date: today },
        attributes: [
          'id', 'date', 'quota_used', 'quota_limit',
          'search_requests', 'video_requests', 'channel_requests',
          'captions_requests', 'error_count', 'status',
          'last_request_time', 'created_at', 'updated_at'
        ]
      });

      if (quota) {
        logger.info('Найдена существующая запись квоты:', {
          date: today,
          used: quota.quota_used,
          limit: settings.quota_limit,
          search_requests: quota.search_requests,
          video_requests: quota.video_requests,
          channel_requests: quota.channel_requests,
          captions_requests: quota.captions_requests,
          error_count: quota.error_count,
          status: quota.status
        });
        return quota;
      }

      try {
        // Создаем новую запись квоты
        quota = await this.models.YoutubeApiQuota.create({
          date: today,
          quota_used: 0,
          quota_limit: settings.quota_limit,
          search_requests: 0,
          video_requests: 0,
          channel_requests: 0,
          captions_requests: 0,
          error_count: 0,
          status: 'active',
          last_request_time: new Date()
        });

        logger.info('Создана новая запись квоты:', {
          date: today,
          limit: settings.quota_limit,
          status: quota.status
        });

        return quota;
      } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
          // Если запись была создана другим процессом
          quota = await this.models.YoutubeApiQuota.findOne({
            where: { date: today },
            attributes: [
              'id', 'date', 'quota_used', 'quota_limit',
              'search_requests', 'video_requests', 'channel_requests',
              'captions_requests', 'error_count', 'status',
              'last_request_time', 'created_at', 'updated_at'
            ]
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

      const isAvailable = quota.quota_used + cost <= settings.quota_limit;
      
      // Логируем проверку доступности квоты
      logApiRequest('CHECK_QUOTA', {
        operation,
        cost,
        currentUsage: quota.quota_used,
        limit: settings.quota_limit,
        isAvailable,
        searchParams: {
          operation_type: operation,
          cost_per_operation: cost,
          current_usage: quota.quota_used,
          daily_limit: settings.quota_limit,
          remaining_quota: settings.quota_limit - quota.quota_used,
          usage_percent: ((quota.quota_used / settings.quota_limit) * 100).toFixed(2)
        }
      });

      return isAvailable;
    } catch (error) {
      logApiError('CHECK_QUOTA_ERROR', error, { 
        operation,
        quotaInfo: {
          operation_type: operation,
          current_usage: quota?.quota_used,
          daily_limit: settings?.quota_limit
        }
      });
      return false;
    }
  }

  /**
   * Регистрация использования квоты
   * @param {string} operation - Тип операции (SEARCH, VIDEO_DETAILS и т.д.)
   * @param {number} [count=1] - Количество элементов в запросе (например, количество видео в videos.list)
   */
  async registerQuotaUsage(operation, count = 1) {
    try {
      const startTime = Date.now();
      const quota = await this.getOrCreateQuota();
      const costPerItem = QUOTA_COSTS[operation] || 1;
      const totalCost = costPerItem * count;

      // Логируем использование API с подробностями
      logApiResponse(operation, null, {
        costPerItem,
        count,
        totalCost,
        currentUsage: quota.quota_used,
        newUsage: quota.quota_used + totalCost,
        operation,
        executionTime: Date.now() - startTime,
        quota_details: {
          operation_type: operation,
          items_count: count,
          cost_per_item: costPerItem,
          total_cost: totalCost,
          previous_usage: quota.quota_used,
          new_usage: quota.quota_used + totalCost,
          daily_limit: quota.quota_limit,
          remaining_quota: quota.quota_limit - (quota.quota_used + totalCost),
          usage_percent: (((quota.quota_used + totalCost) / quota.quota_limit) * 100).toFixed(2)
        },
        request_stats: {
          search_requests: quota.search_requests,
          video_requests: quota.video_requests,
          channel_requests: quota.channel_requests,
          error_count: quota.error_count
        }
      });

      // Увеличиваем использованную квоту на общую стоимость операции
      quota.quota_used += totalCost;
      quota.last_request_time = new Date();

      // Обновляем соответствующий счетчик запросов
      switch (operation) {
        case 'SEARCH':
          quota.search_requests += 1;
          logger.info('Зарегистрирован поисковый запрос:', {
            operation_details: {
              type: 'SEARCH',
              cost: totalCost,
              current_total: quota.quota_used,
              search_requests_count: quota.search_requests
            }
          });
          break;
        case 'VIDEO_DETAILS':
          quota.video_requests += count;
          logger.info('Зарегистрирован запрос деталей видео:', {
            operation_details: {
              type: 'VIDEO_DETAILS',
              items_count: count,
              cost: totalCost,
              current_total: quota.quota_used,
              video_requests_count: quota.video_requests
            }
          });
          break;
        case 'CHANNEL_DETAILS':
          quota.channel_requests += count;
          logger.info('Зарегистрирован запрос деталей канала:', {
            operation_details: {
              type: 'CHANNEL_DETAILS',
              items_count: count,
              cost: totalCost,
              current_total: quota.quota_used,
              channel_requests_count: quota.channel_requests
            }
          });
          break;
      }

      // Обновляем статус в зависимости от использования квоты
      const usagePercent = (quota.quota_used / quota.quota_limit) * 100;
      if (usagePercent >= 100) {
        quota.status = 'exceeded';
        logApiError('QUOTA_EXCEEDED', new Error('Превышен лимит квоты YouTube API'), {
          quotaInfo: {
            used: quota.quota_used,
            limit: quota.quota_limit,
            percent: usagePercent.toFixed(2)
          },
          requestDetails: {
            operation,
            count,
            costPerItem,
            totalCost
          }
        });
      } else if (usagePercent >= 80) {
        quota.status = 'warning';
        apiLogger.warn('Приближается к лимиту квоты YouTube API', {
          quota_status: {
            used: quota.quota_used,
            limit: quota.quota_limit,
            percent: usagePercent.toFixed(2),
            remaining: quota.quota_limit - quota.quota_used
          }
        });
      } else {
        quota.status = 'active';
      }

      await quota.save();
      return quota;
    } catch (error) {
      logApiError('QUOTA_UPDATE_ERROR', error, {
        operation,
        count,
        quotaInfo: {
          operation_type: operation,
          items_count: count,
          cost_per_item: QUOTA_COSTS[operation],
          attempted_cost: QUOTA_COSTS[operation] * count
        }
      });
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

      const history = await this.models.YoutubeApiQuota.findAll({
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
        limit: record.quota_limit,
        searchRequests: record.search_requests,
        videoRequests: record.video_requests,
        channelRequests: record.channel_requests,
        captionsRequests: record.captions_requests,
        errorCount: record.error_count,
        status: record.status,
        lastRequestTime: record.last_request_time
      }));

      return {
        history: formattedHistory,
        today: todayStats ? {
          used: todayStats.quota_used,
          limit: todayStats.quota_limit,
          remaining: todayStats.quota_limit - todayStats.quota_used,
          searchRequests: todayStats.search_requests,
          videoRequests: todayStats.video_requests,
          channelRequests: todayStats.channel_requests,
          captionsRequests: todayStats.captions_requests,
          errorCount: todayStats.error_count,
          status: todayStats.status,
          lastRequestTime: todayStats.last_request_time
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

      const quotaRecords = await this.models.YoutubeApiQuota.findAll({
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

// Создаем экземпляр сервиса
const quotaService = new YoutubeQuotaService();

// Экспортируем класс и экземпляр
module.exports = {
  YoutubeQuotaService,
  quotaService
}; 