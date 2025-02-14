'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('integration_events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      platform: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('success', 'error', 'warning', 'info'),
        allowNull: false,
        defaultValue: 'info'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      data: {
        type: Sequelize.JSONB,
        defaultValue: {}
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
    await queryInterface.addIndex('integration_events', ['platform']);
    await queryInterface.addIndex('integration_events', ['type']);
    await queryInterface.addIndex('integration_events', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем индексы
    await queryInterface.removeIndex('integration_events', ['platform']);
    await queryInterface.removeIndex('integration_events', ['type']);
    await queryInterface.removeIndex('integration_events', ['created_at']);

    // Удаляем ENUM тип
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_integration_events_type;');
    
    // Удаляем таблицу
    await queryInterface.dropTable('integration_events');
  }
}; 