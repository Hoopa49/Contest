const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST || 'postgres', // изменено на postgres
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    define: {
      timestamps: true,
      freezeTableName: true
    },
    retry: {
      max: 5, // максимальное количество попыток
      timeout: 3000 // таймаут между попытками в миллисекундах
    }
  }
);

// Проверка подключения
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const User = require('./User')(sequelize, DataTypes);
const Video = require('./Video')(sequelize, DataTypes);
const Contest = require('./Contest')(sequelize, DataTypes);

// Определяем связи
Video.hasMany(Contest, { 
  foreignKey: 'videoId',
  constraints: false
});
Contest.belongsTo(Video, { 
  foreignKey: 'videoId',
  constraints: false
});

// Проверяем подключение
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = {
  sequelize,
  User,
  Video,
  Contest
};