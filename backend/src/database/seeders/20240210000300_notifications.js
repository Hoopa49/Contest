'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const userId = '7de6451f-7b71-4e4f-a03d-3605267d4fd5';
    const now = new Date();

    // Создаем настройки уведомлений
    await queryInterface.bulkInsert('notification_settings', [
      {
        id: uuidv4(),
        user_id: userId,
        channels: JSON.stringify({
          email: {
            enabled: true,
            address: 'user@example.com',
            frequency: 'instant'
          },
          push: {
            enabled: true,
            desktop: true,
            mobile: true
          },
          telegram: {
            enabled: false,
            username: ''
          }
        }),
        types: JSON.stringify({
          system: {
            enabled: true,
            channels: ['push'],
            importance: 'normal'
          },
          contest: {
            enabled: true,
            channels: ['email', 'push'],
            importance: 'high'
          },
          platform: {
            enabled: true,
            channels: ['push'],
            importance: 'low'
          },
          security: {
            enabled: true,
            channels: ['email', 'push', 'telegram'],
            importance: 'critical'
          }
        }),
        schedule: JSON.stringify({
          quietHours: {
            enabled: true,
            start: '23:00',
            end: '07:00'
          },
          days: {
            mon: true,
            tue: true,
            wed: true,
            thu: true,
            fri: true,
            sat: true,
            sun: true
          }
        }),
        created_at: now,
        updated_at: now
      }
    ]);

    // Создаем тестовые уведомления
    await queryInterface.bulkInsert('notifications', [
      {
        id: uuidv4(),
        user_id: userId,
        type: 'contest',
        title: 'Обновление конкурса',
        message: 'Конкурс "Большой конкурс с призами" был обновлен',
        data: JSON.stringify({
          contest_id: 'video123',
          changes: ['prize_value', 'end_date']
        }),
        read: false,
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        id: uuidv4(),
        user_id: userId,
        type: 'contest',
        title: 'Новый конкурс',
        message: 'Найден новый конкурс: "Розыгрыш iPhone 15 Pro"',
        data: JSON.stringify({
          contest_id: 'video456',
          prize_value: 150000
        }),
        read: false,
        created_at: now,
        updated_at: now,
        deleted_at: null
      },
      {
        id: uuidv4(),
        user_id: userId,
        type: 'system',
        title: 'Обновление системы',
        message: 'Система была успешно обновлена до версии 1.0.0',
        data: JSON.stringify({
          version: '1.0.0',
          changes: ['Улучшен поиск конкурсов', 'Добавлены новые фильтры']
        }),
        read: true,
        created_at: now,
        updated_at: now,
        deleted_at: null
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('notifications', null, {});
    await queryInterface.bulkDelete('notification_settings', null, {});
  }
}; 