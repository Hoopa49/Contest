// backend/index.js
const express = require('express');
const app = express();
const testRoutes = require('./routes/testRoutes');
// Подключаем роут к приложению
// Теперь по пути http://localhost:3000/test вы получите JSON-ответ
app.use('/', testRoutes);

const PORT = 3000; // порт, на котором запустим сервер

// Базовый роут
app.get('/', (req, res) => {
  res.send('Hello World from Express!');
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
