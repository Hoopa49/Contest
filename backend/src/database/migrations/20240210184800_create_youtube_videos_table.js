'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('youtube_videos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      youtube_id: {
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
      channel_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'youtube_channels',
          key: 'channel_id'
        }
      },
      channel_title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      publish_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      views_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      likes_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      comments_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      tags: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      category_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      duration: {
        type: Sequelize.STRING,
        allowNull: true
      },
      thumbnail_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_contest: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      contest_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contest_status: {
        type: Sequelize.ENUM('active', 'ended', 'cancelled'),
        allowNull: true
      },
      prize_value: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      contest_probability: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      processed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      last_updated: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'processed', 'error'),
        defaultValue: 'pending'
      },
      error_message: {
        type: Sequelize.TEXT,
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
    await queryInterface.addIndex('youtube_videos', ['youtube_id'], {
      unique: true
    });
    await queryInterface.addIndex('youtube_videos', ['channel_id']);
    await queryInterface.addIndex('youtube_videos', ['publish_date']);
    await queryInterface.addIndex('youtube_videos', ['is_contest']);
    await queryInterface.addIndex('youtube_videos', ['contest_status']);
    await queryInterface.addIndex('youtube_videos', ['status']);
    await queryInterface.addIndex('youtube_videos', ['processed']);
    await queryInterface.addIndex('youtube_videos', ['last_updated']);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем индексы
    await queryInterface.removeIndex('youtube_videos', ['youtube_id']);
    await queryInterface.removeIndex('youtube_videos', ['channel_id']);
    await queryInterface.removeIndex('youtube_videos', ['publish_date']);
    await queryInterface.removeIndex('youtube_videos', ['is_contest']);
    await queryInterface.removeIndex('youtube_videos', ['contest_status']);
    await queryInterface.removeIndex('youtube_videos', ['status']);
    await queryInterface.removeIndex('youtube_videos', ['processed']);
    await queryInterface.removeIndex('youtube_videos', ['last_updated']);

    // Удаляем ENUM типы
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_youtube_videos_contest_status;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_youtube_videos_status;');
    
    // Удаляем таблицу
    await queryInterface.dropTable('youtube_videos');
  }
}; 