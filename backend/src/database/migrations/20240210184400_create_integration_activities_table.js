'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('integration_activities', {
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
      platform: {
        type: Sequelize.STRING,
        allowNull: false
      },
      action_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      action_data: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      status: {
        type: Sequelize.ENUM('success', 'error', 'pending'),
        allowNull: false,
        defaultValue: 'pending'
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
    await queryInterface.addIndex('integration_activities', ['user_id']);
    await queryInterface.addIndex('integration_activities', ['platform']);
    await queryInterface.addIndex('integration_activities', ['action_type']);
    await queryInterface.addIndex('integration_activities', ['status']);
    await queryInterface.addIndex('integration_activities', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем индексы
    await queryInterface.removeIndex('integration_activities', ['user_id']);
    await queryInterface.removeIndex('integration_activities', ['platform']);
    await queryInterface.removeIndex('integration_activities', ['action_type']);
    await queryInterface.removeIndex('integration_activities', ['status']);
    await queryInterface.removeIndex('integration_activities', ['created_at']);

    // Удаляем ENUM тип
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_integration_activities_status;');
    
    // Удаляем таблицу
    await queryInterface.dropTable('integration_activities');
  }
}; 