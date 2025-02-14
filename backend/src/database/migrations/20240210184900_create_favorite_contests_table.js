'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('favorite_contests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      contest_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'contests',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    await queryInterface.addIndex('favorite_contests', ['contest_id', 'user_id'], {
      unique: true,
      name: 'favorite_contests_contest_user_unique'
    });
    await queryInterface.addIndex('favorite_contests', ['contest_id'], {
      name: 'favorite_contests_contest_id_idx'
    });
    await queryInterface.addIndex('favorite_contests', ['user_id'], {
      name: 'favorite_contests_user_id_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    // Удаляем индексы
    await queryInterface.removeIndex('favorite_contests', 'favorite_contests_contest_user_unique');
    await queryInterface.removeIndex('favorite_contests', 'favorite_contests_contest_id_idx');
    await queryInterface.removeIndex('favorite_contests', 'favorite_contests_user_id_idx');
    
    // Удаляем таблицу
    await queryInterface.dropTable('favorite_contests');
  }
}; 