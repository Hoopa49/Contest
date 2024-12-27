// routes/testRoutes.js
const express = require('express');
const router = express.Router();
const Video = require('../models/Video'); // наша модель

// Важно подключить middleware для JSON
// (обычно делается в index.js: app.use(express.json()))

// Пример POST /video
router.post('/video', async (req, res) => {
  try {
    const { title, url, source, transcript } = req.body;
    if (!title || !url || !source) {
      return res.status(400).json({ error: 'title and url are required' });
    }

    // Создаём запись
    const newVideo = await Video.create({
      title,
      url,
      source,
      transcript: transcript || null // transcript может быть необязательным
    });
    // Возвращаем результат
    return res.status(201).json({ message: 'Video created', data: newVideo });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

// Пример GET /video — получить все
router.get('/video', async (req, res) => {
  try {
    const videos = await Video.findAll();
    return res.json(videos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
