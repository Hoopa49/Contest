const express = require('express');
const router = express.Router();
const { Contest, Video } = require('../models/Connection');

// GET /contests - получить все конкурсы с информацией о видео
router.get('/contests', async (req, res) => {
  try {
    const contests = await Contest.findAll({
      include: [{
        model: Video,
        attributes: ['title', 'link', 'author']
      }],
      order: [['startDate', 'DESC']]
    });
    res.json(contests);
  } catch (error) {
    console.error('Error fetching contests:', error);
    res.status(500).json({ error: 'Failed to fetch contests' });
  }
});

module.exports = router;