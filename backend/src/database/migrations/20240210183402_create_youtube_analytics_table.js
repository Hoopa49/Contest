'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('youtube_analytics', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      contests_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      views_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      participants_count: {
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
      contest_types: {
        type: Sequelize.JSONB,
        defaultValue: []
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
    }, {
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['date']
        }
      ]
    });

    // Добавляем комментарий к таблице
    await queryInterface.sequelize.query(
      `COMMENT ON TABLE youtube_analytics IS 'Таблица для хранения аналитических данных по YouTube конкурсам'`
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('youtube_analytics');
  }
}; 