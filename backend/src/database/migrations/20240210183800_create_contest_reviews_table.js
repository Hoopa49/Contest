'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contest_reviews', {
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
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5
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
      likes_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      reports_count: {
        type: Sequelize.INTEGER,
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
    await queryInterface.addIndex('contest_reviews', ['contest_id']);
    await queryInterface.addIndex('contest_reviews', ['user_id']);
    await queryInterface.addIndex('contest_reviews', ['rating']);

    // Создаем таблицу для связи review_likes (many-to-many)
    await queryInterface.createTable('review_likes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      review_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'contest_reviews',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
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

    // Создаем таблицу для связи review_reports (many-to-many)
    await queryInterface.createTable('review_reports', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      review_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'contest_reviews',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
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

    // Создаем уникальные индексы для связующих таблиц
    await queryInterface.addIndex('review_likes', ['review_id', 'user_id'], {
      unique: true
    });
    await queryInterface.addIndex('review_reports', ['review_id', 'user_id'], {
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Удаляем связующие таблицы
    await queryInterface.dropTable('review_likes');
    await queryInterface.dropTable('review_reports');

    // Удаляем индексы основной таблицы
    await queryInterface.removeIndex('contest_reviews', ['contest_id']);
    await queryInterface.removeIndex('contest_reviews', ['user_id']);
    await queryInterface.removeIndex('contest_reviews', ['rating']);
    
    // Удаляем основную таблицу
    await queryInterface.dropTable('contest_reviews');
  }
}; 