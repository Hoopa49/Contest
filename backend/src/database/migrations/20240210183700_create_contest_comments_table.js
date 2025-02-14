'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contest_comments', {
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
      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'contest_comments',
          key: 'id'
        }
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      is_edited: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
    await queryInterface.addIndex('contest_comments', ['contest_id']);
    await queryInterface.addIndex('contest_comments', ['user_id']);
    await queryInterface.addIndex('contest_comments', ['parent_id']);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем индексы
    await queryInterface.removeIndex('contest_comments', ['contest_id']);
    await queryInterface.removeIndex('contest_comments', ['user_id']);
    await queryInterface.removeIndex('contest_comments', ['parent_id']);
    
    // Удаляем таблицу
    await queryInterface.dropTable('contest_comments');
  }
}; 