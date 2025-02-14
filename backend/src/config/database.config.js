require('dotenv').config()

if (!process.env.POSTGRES_DB || !process.env.POSTGRES_USER || !process.env.POSTGRES_PASSWORD || !process.env.POSTGRES_HOST || !process.env.POSTGRES_PORT) {
  throw new Error('Необходимые переменные окружения для подключения к базе данных не установлены')
}

/**
 * Конфигурация базы данных
 * Настройки подключения к PostgreSQL для разных окружений
 */

const baseConfig = {
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  dialect: 'postgres',
  logging: false,
  define: {
    timestamps: true,
    underscored: true
  }
}

module.exports = {
  development: {
    ...baseConfig,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  test: {
    ...baseConfig
  },
  production: {
    ...baseConfig,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    }
  }
} 