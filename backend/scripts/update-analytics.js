/**
 * Скрипт для обновления аналитики
 */

const path = require('path')
const { Sequelize } = require('sequelize')
const { Umzug, SequelizeStorage } = require('umzug')
const config = require('../src/config/database.config')
const logger = require('../src/logging')

// Используем конфигурацию для development окружения
const dbConfig = config.development

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    define: dbConfig.define,
    pool: dbConfig.pool
  }
)

const migrator = new Umzug({
  migrations: {
    glob: path.join(__dirname, '../src/database/migrations/*.js'),
    resolve: ({ name, path, context }) => {
      const migration = require(path)
      return {
        name,
        up: async () => migration.up(context, Sequelize),
        down: async () => migration.down(context, Sequelize)
      }
    }
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console
})

const seeder = new Umzug({
  migrations: {
    glob: path.join(__dirname, '../src/database/seeders/*.js'),
    resolve: ({ name, path, context }) => {
      const seeder = require(path)
      return {
        name,
        up: async () => seeder.up(context, Sequelize),
        down: async () => seeder.down(context, Sequelize)
      }
    }
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize, tableName: 'SequelizeSeeds' }),
  logger: console
})

async function main() {
  try {
    // Проверяем подключение к базе данных
    logger.info('Testing database connection...')
    await sequelize.authenticate()
    logger.info('Database connection has been established successfully')

    // Применяем миграции
    logger.info('Applying migrations...')
    await migrator.up()
    logger.info('Migrations applied successfully')

    // Применяем сиды
    logger.info('Applying seeds...')
    await seeder.up()
    logger.info('Seeds applied successfully')

    await sequelize.close()
    process.exit(0)
  } catch (error) {
    logger.error('Error updating analytics:', error)
    await sequelize.close()
    process.exit(1)
  }
}

main() 