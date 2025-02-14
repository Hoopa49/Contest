'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    // Создаем аналитические данные
    await queryInterface.bulkInsert('analytics_data', [
      {
        id: uuidv4(),
        date: now,
        category: 'daily_stats',
        metrics: JSON.stringify({
          users_total: 1000,
          users_new: 50,
          users_active: 750,
          contests_total: 500,
          contests_new: 25,
          contests_active: 300,
          contests_completed: 175,
          participations_total: 5000,
          participations_new: 250,
          comments_total: 1500,
          reviews_total: 300,
          shares_total: 800
        }),
        dimensions: JSON.stringify({
          contests_by_platform: {
            youtube: 400,
            instagram: 100
          },
          conversion_rates: {
            participation: 0.15,
            completion: 0.35
          }
        }),
        metadata: JSON.stringify({
          data_source: 'system',
          version: '1.0.0'
        }),
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        date: yesterday,
        category: 'platform_stats',
        metrics: JSON.stringify({
          youtube_api_calls: 10000,
          youtube_quota_used: 5000,
          youtube_videos_processed: 1000,
          youtube_channels_analyzed: 200,
          telegram_messages_sent: 5000,
          telegram_notifications_delivered: 4800,
          telegram_user_interactions: 1500
        }),
        dimensions: JSON.stringify({
          api_usage_by_type: {
            search: 4000,
            video: 3000,
            channel: 3000
          },
          notification_status: {
            delivered: 4800,
            failed: 200
          }
        }),
        metadata: JSON.stringify({
          data_source: 'integrations',
          version: '1.0.0'
        }),
        created_at: yesterday,
        updated_at: yesterday
      },
      {
        id: uuidv4(),
        date: twoDaysAgo,
        category: 'user_activity',
        metrics: JSON.stringify({
          total_sessions: 10000,
          unique_users: 2000,
          mobile_users: 6000,
          desktop_users: 3000,
          tablet_users: 1000
        }),
        dimensions: JSON.stringify({
          peak_hours: {
            '09:00': 500,
            '15:00': 750,
            '20:00': 1000
          },
          regions: {
            'Moscow': 2000,
            'St. Petersburg': 1500,
            'Novosibirsk': 500
          },
          devices: {
            mobile: 6000,
            desktop: 3000,
            tablet: 1000
          }
        }),
        metadata: JSON.stringify({
          data_source: 'analytics',
          version: '1.0.0'
        }),
        created_at: twoDaysAgo,
        updated_at: twoDaysAgo
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('analytics_data', null, {});
  }
}; 