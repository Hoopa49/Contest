// backend/routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');
const { Video } = require('../models/Connection');

// GET /videos — получить все видео
router.get('/videos', async (req, res) => {
  try {
    const videos = await Video.findAll();
    return res.json(videos);
  } catch (error) {
    console.error('Ошибка при получении видео:', error);
    return res.status(500).json({ error: 'Не удалось получить видео.' });
  }
});

// POST /videos — создать новое видео (только admin)
router.post('/videos', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const { title, url, source } = req.body;
    if (!title || !url || !source) {
      return res.status(400).json({ error: 'Все поля (title, url, source) обязательны.' });
    }

    const newVideo = await Video.create({ title, url, source });
    return res.status(201).json({
      message: 'Видео создано успешно.',
      data: newVideo
    });
  } catch (error) {
    console.error('Ошибка при создании видео:', error);
    return res.status(500).json({ error: 'Не удалось создать видео.' });
  }
});

// PUT /videos/:id — обновить видео (только admin)
router.put('/videos/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, source } = req.body;

    const video = await Video.findByPk(id);
    if (!video) {
      return res.status(404).json({ error: `Видео с id=${id} не найдено.` });
    }

    // Обновляем поля, если они переданы
    video.title = title || video.title;
    video.url = url || video.url;
    video.source = source || video.source;

    await video.save();

    return res.json({
      message: 'Видео обновлено успешно.',
      data: video
    });
  } catch (error) {
    console.error('Ошибка при обновлении видео:', error);
    return res.status(500).json({ error: 'Не удалось обновить видео.' });
  }
});

// DELETE /videos/:id — удалить видео (только admin)
router.delete('/videos/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findByPk(id);
    if (!video) {
      return res.status(404).json({ error: `Видео с id=${id} не найдено.` });
    }

    await video.destroy();
    return res.json({ message: 'Видео удалено успешно.' });
  } catch (error) {
    console.error('Ошибка при удалении видео:', error);
    return res.status(500).json({ error: 'Не удалось удалить видео.' });
  }
});

module.exports = router;
