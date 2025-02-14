'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const userId = '7de6451f-7b71-4e4f-a03d-3605267d4fd5';
    const now = new Date();

    // Создаем события интеграций
    await queryInterface.bulkInsert('integration_events', [
      {
        id: uuidv4(),
        platform: 'youtube',
        type: 'info',
        title: 'Синхронизация YouTube',
        message: 'Успешно обработано 15 видео и обновлено 3 канала',
        data: JSON.stringify({
          videos_processed: 15,
          channels_updated: 3
        }),
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        platform: 'youtube',
        type: 'error',
        title: 'Ошибка API',
        message: 'Превышен лимит квоты API',
        data: JSON.stringify({
          quota_type: 'search',
          remaining: 0
        }),
        created_at: now,
        updated_at: now
      }
    ]);

    // Создаем активности интеграций
    await queryInterface.bulkInsert('integration_activities', [
      {
        id: uuidv4(),
        user_id: userId,
        platform: 'youtube',
        action_type: 'search',
        action_data: JSON.stringify({
          query: 'конкурс',
          results: 25
        }),
        status: 'success',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        user_id: userId,
        platform: 'youtube',
        action_type: 'update',
        action_data: JSON.stringify({
          videos_updated: 10,
          channels_updated: 2
        }),
        status: 'success',
        created_at: now,
        updated_at: now
      }
    ]);

    // Создаем статистику интеграций
    await queryInterface.bulkInsert('integration_stats', [
      {
        platform: 'youtube',
        enabled: true,
        last_sync: now,
        contests_found: 150,
        error_count: 5,
        requests_count: 1000,
        successful_requests: 980,
        failed_requests: 20,
        created_at: now,
        updated_at: now
      },
      {
        platform: 'telegram',
        enabled: false,
        last_sync: null,
        contests_found: 0,
        error_count: 0,
        requests_count: 0,
        successful_requests: 0,
        failed_requests: 0,
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('integration_stats', null, {});
    await queryInterface.bulkDelete('integration_activities', null, {});
    await queryInterface.bulkDelete('integration_events', null, {});
  }
}; 