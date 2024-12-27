// backend/index.js
const express = require('express');
const app = express();
const PORT = 3000;

// 1) Подключаем sequelize
const sequelize = require('./config/db');

// 2) Подключаем модель
const Video = require('./models/Video');

// Мы, кстати, можем и другие модели так же подключать (Contest, User, и т.д.)
app.use(express.json());
// Подключаем ваши роуты
const testRoutes = require('./routes/testRoutes');
app.use('/', testRoutes);

// Функция для старта сервера и синхронизации БД
async function startServer() {
  try {
    // 3) Делаем sync: создает таблицы, если их нет
    //    force: true - пересоздавать таблицы при каждом запуске (для разработчика ок),
    //    но в продакшне надо быть осторожным.
    await sequelize.sync({ force: false }); 
    console.log('Database synced!');

    // 4) Запускаем сервер
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to sync DB:', err);
  }
}

startServer();
