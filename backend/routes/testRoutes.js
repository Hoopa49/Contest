// routes/testRoutes.js

const express = require('express');
const router = express.Router();

// Допустим, у нас будет простой маршрут GET /test
router.get('/test', (req, res) => {
  // Отправим JSON-ответ
  res.json({ message: 'Hello from test route!' });
});

module.exports = router;
