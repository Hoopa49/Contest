'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contests', {
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
        }
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      rules_data: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      prizes_data: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      requirements_data: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      platform_type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      platform_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      source_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contest_status: {
        type: Sequelize.ENUM('draft', 'active', 'completed', 'cancelled'),
        defaultValue: 'draft'
      },
      allow_comments: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      allow_reviews: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      allow_rating: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      image: {
        type: Sequelize.STRING,
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
    await queryInterface.addIndex('contests', ['user_id']);
    await queryInterface.addIndex('contests', ['platform_type']);
    await queryInterface.addIndex('contests', ['platform_id']);
    await queryInterface.addIndex('contests', ['contest_status']);
    await queryInterface.addIndex('contests', ['start_date']);
    await queryInterface.addIndex('contests', ['end_date']);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем индексы
    await queryInterface.removeIndex('contests', ['user_id']);
    await queryInterface.removeIndex('contests', ['platform_type']);
    await queryInterface.removeIndex('contests', ['platform_id']);
    await queryInterface.removeIndex('contests', ['contest_status']);
    await queryInterface.removeIndex('contests', ['start_date']);
    await queryInterface.removeIndex('contests', ['end_date']);

    // Удаляем ENUM тип
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_contests_contest_status;');
    
    // Удаляем таблицу
    await queryInterface.dropTable('contests');
  }
}; 