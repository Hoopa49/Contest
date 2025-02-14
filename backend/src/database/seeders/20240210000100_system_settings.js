'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const userId = '7de6451f-7b71-4e4f-a03d-3605267d4fd5';
    const now = new Date();

    // Создаем настройки и сохраняем ID
    const settingsId = uuidv4();
    await queryInterface.bulkInsert('system_settings', [
      {
        id: settingsId,
        category: 'system',
        settings: JSON.stringify({
          app: {
            name: 'Contest Aggregator',
            description: 'Агрегатор конкурсов из разных платформ',
            version: '1.0.0',
            maintenance_mode: false
          },
          email: {
            smtp_host: 'smtp.example.com',
            smtp_port: 587,
            smtp_secure: true,
            smtp_user: 'noreply@example.com',
            smtp_pass: 'your_password',
            from_email: 'noreply@example.com',
            from_name: 'Contest Aggregator'
          },
          notifications: {
            enabled: true,
            channels: {
              email: true,
              push: true,
              telegram: false
            }
          },
          security: {
            max_login_attempts: 5,
            lockout_duration: 15,
            password_expiry: 90,
            session_timeout: 30,
            require_2fa: false
          },
          integrations: {
            youtube: {
              enabled: true,
              api_key: process.env.YOUTUBE_API_KEY || 'your_youtube_api_key',
              quota_limit: 10000,
              search_interval: 30
            },
            telegram: {
              enabled: false,
              bot_token: '',
              webhook_url: ''
            }
          }
        }),
        description: 'Основные настройки системы',
        is_active: true,
        updated_by: userId,
        created_at: now,
        updated_at: now
      }
    ]);

    // Создаем запись в истории изменений с правильным settings_id
    await queryInterface.bulkInsert('system_settings_history', [
      {
        id: uuidv4(),
        settings_id: settingsId,
        category: 'system',
        settings: JSON.stringify({
          app: {
            name: 'Contest Aggregator',
            description: 'Агрегатор конкурсов из разных платформ',
            version: '1.0.0',
            maintenance_mode: false
          },
          email: {
            smtp_host: 'smtp.example.com',
            smtp_port: 587,
            smtp_secure: true,
            smtp_user: 'noreply@example.com',
            smtp_pass: 'your_password',
            from_email: 'noreply@example.com',
            from_name: 'Contest Aggregator'
          },
          notifications: {
            enabled: true,
            channels: {
              email: true,
              push: true,
              telegram: false
            }
          },
          security: {
            max_login_attempts: 5,
            lockout_duration: 15,
            password_expiry: 90,
            session_timeout: 30,
            require_2fa: false
          },
          integrations: {
            youtube: {
              enabled: true,
              api_key: process.env.YOUTUBE_API_KEY || 'your_youtube_api_key',
              quota_limit: 10000,
              search_interval: 30
            },
            telegram: {
              enabled: false,
              bot_token: '',
              webhook_url: ''
            }
          }
        }),
        changes: JSON.stringify({
          type: 'initial',
          description: 'Начальные настройки системы'
        }),
        updated_by: userId,
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('system_settings_history', null, {});
    await queryInterface.bulkDelete('system_settings', null, {});
  }
}; 