'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      telegram_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      auth_provider: {
        type: Sequelize.ENUM('local', 'google', 'vk', 'telegram'),
        allowNull: false,
        defaultValue: 'local'
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: true
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      username: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      is_blocked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true
      },
      rating: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0
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
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['telegram_id']);
    await queryInterface.addIndex('users', ['username']);
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['is_active']);
    await queryInterface.addIndex('users', ['is_blocked']);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем индексы
    await queryInterface.removeIndex('users', ['email']);
    await queryInterface.removeIndex('users', ['telegram_id']);
    await queryInterface.removeIndex('users', ['username']);
    await queryInterface.removeIndex('users', ['role']);
    await queryInterface.removeIndex('users', ['is_active']);
    await queryInterface.removeIndex('users', ['is_blocked']);

    // Удаляем ENUM типы
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_users_auth_provider;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_users_role;');
    
    // Удаляем таблицу
    await queryInterface.dropTable('users');
  }
}; 