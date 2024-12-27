// backend/index.js
const express = require('express');
const app = express();

const PORT = 3000; // порт, на котором запустим сервер

// Базовый роут
app.get('/', (req, res) => {
  res.send('Hello World from Express!');
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
