'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('youtube_settings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      quota_limit: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10000
      },
      search_interval: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30
      },
      channel_check_interval: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 60
      },
      max_results: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 50
      },
      region: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'RU'
      },
      language: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'ru'
      },
      contest_probability_threshold: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0.7
      },
      min_contest_videos_for_channel: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3
      },
      video_order: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'date'
      },
      video_duration: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'any'
      },
      video_definition: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'any'
      },
      video_type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'video'
      },
      min_subscriber_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      min_view_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      min_video_age: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      max_video_age: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30
      },
      last_sync: {
        type: Sequelize.DATE,
        allowNull: true
      },
      next_sync: {
        type: Sequelize.DATE,
        allowNull: true
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
    await queryInterface.addIndex('youtube_settings', ['enabled']);
    await queryInterface.addIndex('youtube_settings', ['last_sync']);
    await queryInterface.addIndex('youtube_settings', ['next_sync']);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем индексы
    await queryInterface.removeIndex('youtube_settings', ['enabled']);
    await queryInterface.removeIndex('youtube_settings', ['last_sync']);
    await queryInterface.removeIndex('youtube_settings', ['next_sync']);
    
    // Удаляем таблицу
    await queryInterface.dropTable('youtube_settings');
  }
}; 