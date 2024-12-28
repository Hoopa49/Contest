const express = require('express');
const router = express.Router();
const { Video } = require('../models/Connection');

// Получить все видео
router.get('/videos', async (req, res) => {
  try {
    const videos = await Video.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ 
      error: 'Failed to fetch videos',
      details: error.message 
    });
  }
});

// Добавить новое видео
router.post('/videos', async (req, res) => {
  try {
    const { title, link, author } = req.body;
    const video = await Video.create({
      title,
      link,
      author
    });
    res.status(201).json(video);
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ 
      error: 'Failed to create video',
      details: error.message 
    });
  }
});

// Удалить видео
router.delete('/videos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Video.destroy({
      where: { id }
    });
    if (deleted) {
      res.json({ message: 'Video deleted successfully' });
    } else {
      res.status(404).json({ error: 'Video not found' });
    }
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ 
      error: 'Failed to delete video',
      details: error.message 
    });
  }
});

// Обновить видео
router.put('/videos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, link, author } = req.body;
    
    const video = await Video.findByPk(id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    await video.update({
      title,
      link,
      author
    });

    res.json(video);
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ 
      error: 'Failed to update video',
      details: error.message 
    });
  }
});

module.exports = router;