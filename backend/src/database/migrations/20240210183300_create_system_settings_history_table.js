'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('system_settings_history', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      settings_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'system_settings',
          key: 'id'
        }
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false
      },
      settings: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      changes: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    // Создаем индексы для оптимизации поиска
    await queryInterface.addIndex('system_settings_history', ['settings_id']);
    await queryInterface.addIndex('system_settings_history', ['category']);
    await queryInterface.addIndex('system_settings_history', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем индексы
    await queryInterface.removeIndex('system_settings_history', ['settings_id']);
    await queryInterface.removeIndex('system_settings_history', ['category']);
    await queryInterface.removeIndex('system_settings_history', ['created_at']);
    
    // Удаляем таблицу
    await queryInterface.dropTable('system_settings_history');
  }
}; 