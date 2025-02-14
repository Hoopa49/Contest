'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('youtube_channels', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      channel_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      subscriber_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      video_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      view_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      thumbnail_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contest_channel: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      contest_videos_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      last_video_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_checked: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'blocked'),
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
    await queryInterface.addIndex('youtube_channels', ['channel_id'], {
      unique: true
    });
    await queryInterface.addIndex('youtube_channels', ['contest_channel']);
    await queryInterface.addIndex('youtube_channels', ['status']);
    await queryInterface.addIndex('youtube_channels', ['last_video_date']);
    await queryInterface.addIndex('youtube_channels', ['last_checked']);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем индексы
    await queryInterface.removeIndex('youtube_channels', ['channel_id']);
    await queryInterface.removeIndex('youtube_channels', ['contest_channel']);
    await queryInterface.removeIndex('youtube_channels', ['status']);
    await queryInterface.removeIndex('youtube_channels', ['last_video_date']);
    await queryInterface.removeIndex('youtube_channels', ['last_checked']);

    // Удаляем ENUM тип
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_youtube_channels_status;');
    
    // Удаляем таблицу
    await queryInterface.dropTable('youtube_channels');
  }
}; 