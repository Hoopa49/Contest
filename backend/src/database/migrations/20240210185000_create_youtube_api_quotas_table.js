'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('youtube_api_quotas', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        unique: true
      },
      quota_used: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      quota_limit: {
        type: Sequelize.INTEGER,
        defaultValue: 10000
      },
      search_requests: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      video_requests: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      channel_requests: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      captions_requests: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      error_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      last_request_time: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'warning', 'exceeded'),
        defaultValue: 'active'
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
    await queryInterface.addIndex('youtube_api_quotas', ['date'], {
      unique: true
    });
    await queryInterface.addIndex('youtube_api_quotas', ['status']);
    await queryInterface.addIndex('youtube_api_quotas', ['last_request_time']);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем индексы
    await queryInterface.removeIndex('youtube_api_quotas', ['date']);
    await queryInterface.removeIndex('youtube_api_quotas', ['status']);
    await queryInterface.removeIndex('youtube_api_quotas', ['last_request_time']);

    // Удаляем ENUM тип
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_youtube_api_quotas_status;');
    
    // Удаляем таблицу
    await queryInterface.dropTable('youtube_api_quotas');
  }
}; 