// backend/routes/contestRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');
const { Contest, Video } = require('../models/Connection');

// GET /contest — получить все конкурсы
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
  } catch (error) {
    console.error('Ошибка при получении конкурсов:', error);
    return res.status(500).json({ error: 'Не удалось получить конкурсы.' });
  }
});

// POST /contest — создать новый конкурс (только admin)
router.post('/contest', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const { title, prize, startDate, endDate, conditions, videoId } = req.body;

    if (!title || !prize || !startDate || !endDate || !videoId) {
      return res.status(400).json({ error: 'title, prize, startDate, endDate, videoId are required' });
    }

    const video = await Video.findByPk(videoId);
    if (!video) {
      return res.status(404).json({ error: `Video with id=${videoId} not found` });
    }

    const contest = await Contest.create({
      title,
      prize,
      startDate,
      endDate,
      conditions: conditions || null,
      videoId
    });

    return res.status(201).json({
      message: 'Contest created successfully!',
      data: contest
    });
  } catch (error) {
    console.error('Ошибка при создании конкурса:', error);
    return res.status(500).json({ error: 'Не удалось создать конкурс.' });
  }
});

// PUT /contest/:id — обновить конкурс (только admin)
router.put('/contest/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, prize, startDate, endDate, conditions, videoId } = req.body;

    const contest = await Contest.findByPk(id);
    if (!contest) {
      return res.status(404).json({ error: `Contest with id=${id} not found` });
    }

    // Если videoId изменяется, проверяем существование нового видео
    if (videoId && videoId !== contest.videoId) {
      const video = await Video.findByPk(videoId);
      if (!video) {
        return res.status(404).json({ error: `Video with id=${videoId} not found` });
      }
      contest.videoId = videoId;
    }

    contest.title = title || contest.title;
    contest.prize = prize || contest.prize;
    contest.startDate = startDate || contest.startDate;
    contest.endDate = endDate || contest.endDate;
    contest.conditions = conditions || contest.conditions;

    await contest.save();

    return res.json({
      message: 'Contest updated successfully!',
      data: contest
    });
  } catch (error) {
    console.error('Ошибка при обновлении конкурса:', error);
    return res.status(500).json({ error: 'Не удалось обновить конкурс.' });
  }
});

// DELETE /contest/:id — удалить конкурс (только admin)
router.delete('/contest/:id', authMiddleware, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await Contest.findByPk(id);
    if (!contest) {
      return res.status(404).json({ error: `Contest with id=${id} not found` });
    }

    await contest.destroy();
    return res.json({ message: 'Contest deleted successfully!' });
  } catch (error) {
    console.error('Ошибка при удалении конкурса:', error);
    return res.status(500).json({ error: 'Не удалось удалить конкурс.' });
  }
});

module.exports = router;
