'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('draft_contests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      platform_type: {
        type: Sequelize.ENUM('youtube', 'instagram', 'telegram', 'vk'),
        allowNull: true
      },
      draft_status: {
        type: Sequelize.ENUM('in_progress', 'completed', 'cancelled'),
        defaultValue: 'in_progress',
        allowNull: false
      },
      platform_data: {
        type: Sequelize.JSONB,
        defaultValue: {},
        allowNull: false
      },
      prizes_data: {
        type: Sequelize.JSONB,
        defaultValue: [],
        allowNull: false
      },
      rules_data: {
        type: Sequelize.JSONB,
        defaultValue: [],
        allowNull: false
      },
      requirements_data: {
        type: Sequelize.JSONB,
        defaultValue: [],
        allowNull: false
      },
      current_step: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      completion_percentage: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
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

    // Создаем индексы для оптимизации поиска
    await queryInterface.addIndex('draft_contests', ['user_id']);
    await queryInterface.addIndex('draft_contests', ['draft_status']);
    await queryInterface.addIndex('draft_contests', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем индексы
    await queryInterface.removeIndex('draft_contests', ['user_id']);
    await queryInterface.removeIndex('draft_contests', ['draft_status']);
    await queryInterface.removeIndex('draft_contests', ['created_at']);

    // Удаляем ENUM типы
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_draft_contests_platform_type;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_draft_contests_draft_status;');
    
    // Удаляем таблицу
    await queryInterface.dropTable('draft_contests');
  }
}; 