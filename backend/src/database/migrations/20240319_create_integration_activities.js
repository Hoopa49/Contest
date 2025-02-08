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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        validate: {
          isDate: true,
          notInFuture(value) {
            if (value > new Date()) {
              throw new Error('Дата не может быть в будущем')
            }
          }
        }
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        validate: {
          isDate: true,
          notInFuture(value) {
            if (value > new Date()) {
              throw new Error('Дата не может быть в будущем')
            }
          }
        }
      }
    })

    // Добавляем индексы
    await queryInterface.addIndex('integration_activities', ['platform'])
    await queryInterface.addIndex('integration_activities', ['created_at'])
    await queryInterface.addIndex('integration_activities', ['user_id'])

    // Добавляем триггер для проверки дат
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION check_dates_not_in_future()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.created_at > CURRENT_TIMESTAMP THEN
          NEW.created_at := CURRENT_TIMESTAMP;
        END IF;
        IF NEW.updated_at > CURRENT_TIMESTAMP THEN
          NEW.updated_at := CURRENT_TIMESTAMP;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS ensure_dates_not_in_future ON integration_activities;
      
      CREATE TRIGGER ensure_dates_not_in_future
      BEFORE INSERT OR UPDATE ON integration_activities
      FOR EACH ROW
      EXECUTE FUNCTION check_dates_not_in_future();
    `)
  },

  down: async (queryInterface, Sequelize) => {
    // Удаляем триггер и функцию
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS ensure_dates_not_in_future ON integration_activities;
      DROP FUNCTION IF EXISTS check_dates_not_in_future();
    `)
    
    // Удаляем таблицу
    await queryInterface.dropTable('integration_activities')
  }
} 