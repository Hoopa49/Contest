// routes/contestRoutes.js
const express = require('express');
const router = express.Router();
const checkRole = require('../middleware/checkRole');
const authMiddleware = require('../middleware/authMiddleware');
const { Contest, Video } = require('../models/Connection'); // из models/index.js

// POST /contest
router.post('/contest', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const { title, prize, startDate, endDate, conditions, videoId } = req.body;

    // Проверяем обязательные поля
    if (!title || !prize || !startDate || !endDate || !videoId) {
      return res.status(400).json({ error: 'title, prize, startDate, endDate, videoId are required' });
    }

    // Можно проверить, существует ли Video с таким videoId
    const video = await Video.findByPk(videoId);
    if (!video) {
      return res.status(404).json({ error: `Video with id=${videoId} not found` });
    }

    // Создаём запись Contest
    const contest = await Contest.create({
      title,
      prize,
      startDate,
      endDate,
      conditions: conditions || null,
      videoId  // foreignKey
    });

    // Возвращаем результат
    return res.status(201).json({
      message: 'Contest created successfully!',
      data: contest
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Something went wrong while creating the contest.'
    });
  }
});

// Пример GET /contest — возвращает все конкурсы
router.get('/contest', async (req, res) => {
  try {
    const contests = await Contest.findAll({
      include: [
        {
          model: Video,
          as: 'video'
        }
      ]
    });
    return res.json(contests);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
