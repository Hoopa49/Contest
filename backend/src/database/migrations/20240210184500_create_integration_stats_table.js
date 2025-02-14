'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('integration_stats', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      platform: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      last_sync: {
        type: Sequelize.DATE,
        allowNull: true
      },
      contests_found: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      error_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      requests_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      successful_requests: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      failed_requests: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    await queryInterface.addIndex('integration_stats', ['platform'], {
      unique: true
    });
    await queryInterface.addIndex('integration_stats', ['enabled']);
    await queryInterface.addIndex('integration_stats', ['last_sync']);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем индексы
    await queryInterface.removeIndex('integration_stats', ['platform']);
    await queryInterface.removeIndex('integration_stats', ['enabled']);
    await queryInterface.removeIndex('integration_stats', ['last_sync']);
    
    // Удаляем таблицу
    await queryInterface.dropTable('integration_stats');
  }
}; 