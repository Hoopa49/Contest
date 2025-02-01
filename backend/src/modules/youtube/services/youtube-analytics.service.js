const { Op, fn, col, literal } = require('sequelize');
const { logger } = require('../../../logging');
const { youtube_video: YoutubeVideo, youtube_channel: YoutubeChannel, youtube_analytics: YoutubeAnalytics } = require('../../../models');

class YoutubeAnalyticsService {
  /**
   * Агрегация статистики за день
   * @param {Date} date - дата для агрегации
   */
  async aggregateStats(date = new Date()) {
    try {
      // Нормализуем дату до начала дня
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Получаем или создаем запись статистики за указанную дату
      const [analytics, created] = await YoutubeAnalytics.findOrCreate({
        where: {
          date: startOfDay
        },
        defaults: {
          contests_count: 0,
          views_count: 0,
          participants_count: 0,
          likes_count: 0,
          comments_count: 0,
          contest_types: []
        }
      });

      // Получаем статистику по конкурсам за день
      const contestStats = await YoutubeVideo.findAll({
        where: {
          is_contest: true,
          channel_id: { [Op.ne]: null },
          publish_date: {
            [Op.between]: [startOfDay, endOfDay]
          }
        },
        attributes: [
          [fn('COUNT', col('id')), 'contests_count'],
          [fn('SUM', col('views_count')), 'views_count'],
          [fn('SUM', col('likes_count')), 'likes_count'],
          [fn('SUM', col('comments_count')), 'comments_count'],
          ['contest_type', 'type']
        ],
        group: ['contest_type']
      });

      // Подсчитываем общую статистику
      const totals = {
        contests_count: 0,
        views_count: 0,
        likes_count: 0,
        comments_count: 0
      };

      // Форматируем статистику по типам конкурсов
      const contestTypes = contestStats.map(stat => {
        const data = stat.get({ plain: true });
        
        // Суммируем общую статистику
        totals.contests_count += parseInt(data.contests_count) || 0;
        totals.views_count += parseInt(data.views_count) || 0;
        totals.likes_count += parseInt(data.likes_count) || 0;
        totals.comments_count += parseInt(data.comments_count) || 0;

        return {
          name: data.type || 'Другое',
          count: parseInt(data.contests_count) || 0,
          percentage: 0 // Процент рассчитаем после подсчета общего количества
        };
      });

      // Рассчитываем процент для каждого типа
      contestTypes.forEach(type => {
        type.percentage = totals.contests_count > 0 
          ? Math.round((type.count / totals.contests_count) * 100)
          : 0;
      });

      // Примерное количество участников (например, 10% от комментариев)
      const participants_count = Math.round(totals.comments_count * 0.1);

      // Обновляем статистику
      await analytics.update({
        ...totals,
        participants_count,
        contest_types: contestTypes
      });

      return analytics;
    } catch (error) {
      logger.error('Ошибка при агрегации статистики YouTube:', error);
      throw error;
    }
  }

  /**
   * Получение статистики за период
   * @param {number} days - количество дней
   */
  async getStats(days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 86400000));

      // Сначала агрегируем статистику за последние дни
      const aggregationPromises = [];
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate.getTime() + (i * 86400000));
        aggregationPromises.push(this.aggregateStats(date));
      }
      await Promise.all(aggregationPromises);

      // Получаем статистику за период
      const stats = await YoutubeAnalytics.findAll({
        where: {
          date: {
            [Op.between]: [startDate, endDate]
          }
        },
        order: [['date', 'ASC']]
      });

      // Получаем общую статистику
      const totals = await YoutubeVideo.findOne({
        where: { 
          is_contest: true,
          channel_id: { [Op.ne]: null }
        },
        attributes: [
          [fn('COUNT', col('id')), 'total_contests'],
          [fn('COUNT', literal("CASE WHEN contest_status = 'active' THEN 1 END")), 'active_contests'],
          [fn('COALESCE', fn('AVG', col('prize_value')), 0), 'avg_prize_value']
        ]
      });

      // Получаем количество каналов с конкурсами
      const channelsCount = await YoutubeChannel.count({
        where: { 
          contest_channel: true,
          channel_id: { [Op.ne]: null }
        }
      });

      // Форматируем данные для фронтенда
      return {
        total_contests: parseInt(totals.get('total_contests')) || 0,
        active_contests: parseInt(totals.get('active_contests')) || 0,
        channels_count: channelsCount,
        avg_prize_value: Math.round(parseFloat(totals.get('avg_prize_value'))) || 0,
        contest_types: stats[stats.length - 1]?.contest_types || [],
        daily_stats: stats.map(day => ({
          date: day.date,
          contests: day.contests_count || 0,
          views: day.views_count || 0,
          participants: day.participants_count || 0,
          likes: day.likes_count || 0,
          comments: day.comments_count || 0
        }))
      };
    } catch (error) {
      logger.error('Ошибка при получении статистики YouTube:', error);
      throw error;
    }
  }

  async updateQuotaStats(used, error = null) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const stats = await this.getQuotaStats();
      
      if (!stats.history) stats.history = [];
      
      const todayStats = stats.history.find(item => item.date === today);
      
      if (todayStats) {
        todayStats.used += used;
        if (error) todayStats.errors++;
      } else {
        stats.history.push({
          date: today,
          used,
          errors: error ? 1 : 0
        });
      }
      
      stats.totals.totalUsed += used;
      if (error) stats.totals.totalErrors++;
      
      await this.saveQuotaStats(stats);
      
      logger.trace('Обновлена статистика квоты YouTube API:', {
        date: today,
        used,
        error: error?.message,
        totalUsed: stats.totals.totalUsed,
        totalErrors: stats.totals.totalErrors
      });
    } catch (error) {
      logger.error('Ошибка при обновлении статистики квоты:', {
        error: error.message
      });
    }
  }

  async getAnalytics(days = 7) {
    try {
      const stats = await this.getQuotaStats();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const recentHistory = stats.history.filter(item => 
        new Date(item.date) >= cutoffDate
      );
      
      logger.trace('Получена аналитика YouTube API:', {
        days,
        totalUsed: stats.totals.totalUsed,
        totalErrors: stats.totals.totalErrors,
        recentHistory: recentHistory.length
      });
      
      return {
        totals: stats.totals,
        history: recentHistory
      };
    } catch (error) {
      logger.error('Ошибка при получении аналитики:', {
        error: error.message,
        days
      });
      throw error;
    }
  }
}

// Создаем и экспортируем экземпляр сервиса
const youtubeAnalyticsService = new YoutubeAnalyticsService();
module.exports = youtubeAnalyticsService; 