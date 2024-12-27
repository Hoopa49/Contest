// backend/index.js

require('dotenv').config(); // если используете .env
const express = require('express');
const cors = require('cors');
const app = express();

// Импортируем Sequelize из config/db
const sequelize = require('./config/db');

// Импортируем модели (и ассоциации) из models/connection.js
// (где прописано Video.hasMany(Contest), Contest.belongsTo(Video), и т.д.)
const { Video, Contest } = require('./models/Connection');

// Порт, на котором будет запускаться приложение
const PORT = 3000;

// Разрешаем запросы с других доменов
app.use(cors({
  origin: 'http://localhost:5173',  // адрес вашего фронтенда
  credentials: true                 // если планируете передавать куки/сессии
}));

// Подключаем middleware для распознавания JSON
app.use(express.json());

// Подключаем роуты
const testRoutes = require('./routes/testRoutes');
app.use('/', testRoutes);

const contestRoutes = require('./routes/contestRoutes');
app.use('/', contestRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);

// Функция запуска приложения
async function startServer() {
  try {
    // ВАЖНО: Один раз синхронизируем БД
    // alter: true попытается обновить структуру таблиц без потери данных,
    // force: true — полностью пересоздаст таблицы (сотрёт данные).
    // Обычно в dev можно использовать alter: true, в продакшене — миграции.
    await sequelize.sync({ alter: true });
    console.log('Database synced!');

    // Стартуем сервер
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('Failed to sync DB:', err);
  }
}

// Вызываем функцию старта
startServer();
