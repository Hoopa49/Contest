'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notification_settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      channels: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {
          email: {
            enabled: true,
            address: '',
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
        }
      },
      types: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {
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
        }
      },
      schedule: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {
          quietHours: {
            enabled: false,
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
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Создаем уникальный индекс для user_id
    await queryInterface.addIndex('notification_settings', ['user_id'], {
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Удаляем индекс
    await queryInterface.removeIndex('notification_settings', ['user_id']);
    
    // Удаляем таблицу
    await queryInterface.dropTable('notification_settings');
  }
}; 