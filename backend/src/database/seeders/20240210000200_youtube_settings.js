'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const today = new Date().toISOString().split('T')[0]; // Получаем только дату в формате YYYY-MM-DD

    // Создаем настройки YouTube
    await queryInterface.bulkInsert('youtube_settings', [
      {
        enabled: true,
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
        min_subscriber_count: 1000,
        min_view_count: 500,
        min_video_age: 0,
        max_video_age: 30,
        last_sync: now,
        next_sync: new Date(now.getTime() + 30 * 60 * 1000), // через 30 минут
        created_at: now,
        updated_at: now
      }
    ]);

    // Создаем записи квот API
    await queryInterface.bulkInsert('youtube_api_quotas', [
      {
        date: today,
        quota_used: 1000,
        quota_limit: 10000,
        search_requests: 50,
        video_requests: 200,
        channel_requests: 100,
        captions_requests: 0,
        error_count: 0,
        last_request_time: now,
        status: 'active',
        created_at: now,
        updated_at: now
      }
    ]);

    // Создаем тестовые каналы
    await queryInterface.bulkInsert('youtube_channels', [
      {
        channel_id: 'UC1234567890',
        title: 'Contest Channel',
        description: 'Канал с конкурсами и розыгрышами',
        subscriber_count: 50000,
        video_count: 100,
        view_count: 1000000,
        thumbnail_url: 'https://example.com/thumbnail1.jpg',
        country: 'RU',
        contest_channel: true,
        contest_videos_count: 25,
        last_video_date: now,
        last_checked: now,
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        channel_id: 'UC0987654321',
        title: 'Regular Channel',
        description: 'Обычный канал с редкими конкурсами',
        subscriber_count: 25000,
        video_count: 200,
        view_count: 500000,
        thumbnail_url: 'https://example.com/thumbnail2.jpg',
        country: 'RU',
        contest_channel: false,
        contest_videos_count: 5,
        last_video_date: now,
        last_checked: now,
        status: 'active',
        created_at: now,
        updated_at: now
      }
    ]);

    // Создаем тестовые видео
    await queryInterface.bulkInsert('youtube_videos', [
      {
        youtube_id: 'video123',
        title: 'Большой конкурс с призами',
        description: 'Участвуйте в нашем конкурсе и выигрывайте призы!',
        channel_id: 'UC1234567890',
        channel_title: 'Contest Channel',
        publish_date: now,
        views_count: 10000,
        likes_count: 1000,
        comments_count: 500,
        tags: JSON.stringify(['конкурс', 'розыгрыш', 'призы']),
        category_id: '22',
        duration: 'PT15M',
        thumbnail_url: 'https://example.com/video1.jpg',
        is_contest: true,
        contest_type: 'giveaway',
        contest_status: 'active',
        prize_value: 10000,
        contest_probability: 0.8,
        processed: true,
        last_updated: now,
        status: 'processed',
        error_message: null,
        created_at: now,
        updated_at: now
      },
      {
        youtube_id: 'video456',
        title: 'Розыгрыш iPhone 15 Pro',
        description: 'Разыгрываем новый iPhone среди подписчиков!',
        channel_id: 'UC0987654321',
        channel_title: 'Regular Channel',
        publish_date: now,
        views_count: 5000,
        likes_count: 500,
        comments_count: 200,
        tags: JSON.stringify(['конкурс', 'iphone', 'розыгрыш']),
        category_id: '22',
        duration: 'PT10M',
        thumbnail_url: 'https://example.com/video2.jpg',
        is_contest: true,
        contest_type: 'giveaway',
        contest_status: 'active',
        prize_value: 150000,
        contest_probability: 0.6,
        processed: true,
        last_updated: now,
        status: 'processed',
        error_message: null,
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('youtube_videos', null, {});
    await queryInterface.bulkDelete('youtube_channels', null, {});
    await queryInterface.bulkDelete('youtube_api_quotas', null, {});
    await queryInterface.bulkDelete('youtube_settings', null, {});
  }
}; 