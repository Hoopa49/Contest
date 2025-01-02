require('dotenv').config();

// Проверяем и форматируем переменные окружения
const dbConfig = {
  username: process.env.POSTGRES_USER?.toString(),
  password: process.env.POSTGRES_PASSWORD?.toString(),
  database: process.env.POSTGRES_DB?.toString(),
  host: process.env.POSTGRES_HOST || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  dialect: 'postgres'
};

// Валидация конфигурации
for (const [key, value] of Object.entries(dbConfig)) {
  if (!value && key !== 'port') {
    throw new Error(`Database config error: ${key} is required`);
  }
}

const { Sequelize } = require('sequelize');

// Создаем инстанс Sequelize с явным приведением типов
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      useUTC: false,
      // Добавляем настройки для принудительного использования IPv4
      host: dbConfig.host
    },
    timezone: '+03:00',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Улучшенная функция проверки подключения
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    return true;
  } catch (error) {
    console.error('Unable to connect to database:', error);
    throw error;
  }
}

// Экспортируем конфигурацию для sequelize-cli
module.exports = {
  development: dbConfig,
  test: dbConfig,
  production: dbConfig,
  sequelize,
  testConnection
}; 