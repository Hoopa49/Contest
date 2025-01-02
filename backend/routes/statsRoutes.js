const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('./authRoutes');
const { SchedulerHistory, Video, Contest } = require('../models/Connection');
const { Op } = require('sequelize');
const sequelize = require('sequelize');

router.get('/scheduler/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Получаем общую статистику
    const totalRuns = await SchedulerHistory.count();
    const successfulRuns = await SchedulerHistory.count({
      where: { status: 'completed' }
    });
    const totalVideos = await Video.count();
    const totalContests = await Contest.count();

    // Получаем статистику по ключевым словам
    const keywordsStats = await Video.findAll({
      attributes: [
        [sequelize.json('metadata.keyword'), 'keyword'],
        [sequelize.fn('COUNT', '*'), 'total'],
        [
          sequelize.fn('SUM', 
            sequelize.literal("CASE WHEN status = 'contest' THEN 1 ELSE 0 END")
          ), 
          'contests'
        ]
      ],
      where: {
        'metadata.keyword': {
          [Op.ne]: null
        }
      },
      group: [sequelize.json('metadata.keyword')]
    });

    res.json({
      totalRuns,
      successfulRuns,
      totalVideos,
      totalContests,
      keywordsStats: keywordsStats.map(stat => ({
        keyword: stat.get('keyword'),
        total: parseInt(stat.get('total')),
        contests: parseInt(stat.get('contests')),
        efficiency: Math.round((parseInt(stat.get('contests')) / parseInt(stat.get('total'))) * 100)
      }))
    });
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    res.status(500).json({ error: 'Ошибка при получении статистики' });
  }
});

module.exports = router; 