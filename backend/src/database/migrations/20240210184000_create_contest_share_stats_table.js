'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contest_share_stats', {
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
        onDelete: 'CASCADE'
      },
      platform: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isIn: [['VK', 'Telegram', 'WhatsApp', 'Instagram', 'X', 'Facebook']]
        }
      },
      shares_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
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

    // Создаем уникальный индекс для комбинации contest_id и platform
    await queryInterface.addIndex('contest_share_stats', ['contest_id', 'platform'], {
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Удаляем индекс
    await queryInterface.removeIndex('contest_share_stats', ['contest_id', 'platform']);
    
    // Удаляем таблицу
    await queryInterface.dropTable('contest_share_stats');
  }
}; 