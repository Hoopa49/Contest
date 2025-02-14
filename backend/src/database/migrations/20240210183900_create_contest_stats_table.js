'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contest_stats', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      contest_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'contests',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      views_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      participants_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      favorites_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      rating: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      activity_data: {
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
    });

    // Создаем индексы для оптимизации поиска
    await queryInterface.addIndex('contest_stats', ['contest_id']);
    await queryInterface.addIndex('contest_stats', ['rating']);
    await queryInterface.addIndex('contest_stats', ['views_count']);
    await queryInterface.addIndex('contest_stats', ['participants_count']);
    await queryInterface.addIndex('contest_stats', ['favorites_count']);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем индексы
    await queryInterface.removeIndex('contest_stats', ['contest_id']);
    await queryInterface.removeIndex('contest_stats', ['rating']);
    await queryInterface.removeIndex('contest_stats', ['views_count']);
    await queryInterface.removeIndex('contest_stats', ['participants_count']);
    await queryInterface.removeIndex('contest_stats', ['favorites_count']);
    
    // Удаляем таблицу
    await queryInterface.dropTable('contest_stats');
  }
}; 