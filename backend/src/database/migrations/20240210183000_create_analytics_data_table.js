'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('analytics_data', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false
      },
      metrics: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      dimensions: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      metadata: {
        type: Sequelize.JSONB,
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
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Создаем индексы
    await queryInterface.addIndex('analytics_data', ['category']);
    await queryInterface.addIndex('analytics_data', ['date']);
    await queryInterface.addIndex('analytics_data', ['date', 'category']);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем индексы
    await queryInterface.removeIndex('analytics_data', ['category']);
    await queryInterface.removeIndex('analytics_data', ['date']);
    await queryInterface.removeIndex('analytics_data', ['date', 'category']);
    
    // Удаляем таблицу
    await queryInterface.dropTable('analytics_data');
  }
}; 