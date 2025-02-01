'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('integration_activities', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      platform: {
        type: Sequelize.STRING,
        allowNull: false
      },
      action_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      action_data: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      status: {
        type: Sequelize.ENUM('success', 'error', 'pending'),
        allowNull: false,
        defaultValue: 'pending'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })

    // Добавляем индексы
    await queryInterface.addIndex('integration_activities', ['platform'])
    await queryInterface.addIndex('integration_activities', ['created_at'])
    await queryInterface.addIndex('integration_activities', ['user_id'])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('integration_activities')
  }
} 