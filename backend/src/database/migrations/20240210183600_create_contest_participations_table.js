'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contest_participations', {
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
        }
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
      },
      submission_url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      submission_data: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      rejection_reason: {
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
    await queryInterface.addIndex('contest_participations', ['contest_id']);
    await queryInterface.addIndex('contest_participations', ['user_id']);
    await queryInterface.addIndex('contest_participations', ['status']);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем индексы
    await queryInterface.removeIndex('contest_participations', ['contest_id']);
    await queryInterface.removeIndex('contest_participations', ['user_id']);
    await queryInterface.removeIndex('contest_participations', ['status']);

    // Удаляем ENUM тип
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_contest_participations_status;');
    
    // Удаляем таблицу
    await queryInterface.dropTable('contest_participations');
  }
}; 