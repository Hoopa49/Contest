'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
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
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    })

    await queryInterface.addIndex('analytics_data', ['date'])
    await queryInterface.addIndex('analytics_data', ['category'])
    await queryInterface.addIndex('analytics_data', ['date', 'category'])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('analytics_data')
  }
} 