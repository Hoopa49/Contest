'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
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
      type: {
        type: Sequelize.ENUM('system', 'contest', 'platform', 'security'),
        allowNull: false,
        defaultValue: 'system'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      data: {
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
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Создаем индексы для оптимизации поиска
    await queryInterface.addIndex('notifications', ['user_id']);
    await queryInterface.addIndex('notifications', ['type']);
    await queryInterface.addIndex('notifications', ['read']);
    await queryInterface.addIndex('notifications', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем индексы
    await queryInterface.removeIndex('notifications', ['user_id']);
    await queryInterface.removeIndex('notifications', ['type']);
    await queryInterface.removeIndex('notifications', ['read']);
    await queryInterface.removeIndex('notifications', ['created_at']);

    // Удаляем ENUM тип
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_notifications_type;');
    
    // Удаляем таблицу
    await queryInterface.dropTable('notifications');
  }
}; 