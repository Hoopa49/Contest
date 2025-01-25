/**
 * Database Configuration
 * Конфигурация подключения к базе данных
 */

require('dotenv').config()
const { Sequelize } = require('sequelize')
const { logger } = require('../logging')

const config = {
  database: process.env.POSTGRES_DB || 'contest_db',
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  dialect: 'postgres',
  // Полностью отключаем вывод SQL запросов
  logging: false,
  // Добавляем глобальные настройки для моделей
  define: {
    // Используем snake_case вместо camelCase для полей
    underscored: true,
    // Добавляем поля created_at и updated_at
    timestamps: true,
    // Не добавляем поля deletedAt
    paranoid: false,
    // Используем один и тот же формат имени таблиц
    freezeTableName: true,
    // Используем нижний регистр для имен таблиц
    tableName: undefined
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
}

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
)

// Проверяем подключение
sequelize
  .authenticate()
  .then(() => {
    logger.info('Подключение к базе данных установлено', {
      metadata: {
        database: config.database,
        host: config.host,
        port: config.port,
        username: config.username
      }
    })
  })
  .catch(err => {
    logger.error('Не удалось подключиться к базе данных', {
      metadata: {
        error: {
          message: err.message,
          stack: err.stack
        },
        config: {
          database: config.database,
          host: config.host,
          port: config.port,
          username: config.username
        }
      }
    })
  })

module.exports = sequelize 