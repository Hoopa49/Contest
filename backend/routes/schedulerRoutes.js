const express = require("express");
const router = express.Router();
const { authenticateToken, isAdmin } = require("./authRoutes");
const { runYouTubeScheduler, stopScheduler } = require("../schedulers/youtubeScheduler");
const { state } = require('../services/schedulerState');
const { SchedulerSettings, SchedulerHistory, User, SchedulerCron } = require('../models/Connection');
const { calculateNextRun, startCronJob } = require('../services/cronService');
const { Video } = require('../models/Connection');
const sequelize = require('sequelize');

// Запуск сборщика
router.post("/start", authenticateToken, isAdmin, async (req, res) => {
    try {
      if (state.isRunning) {
        return res.status(400).json({ error: "Сборщик уже запущен" });
      }

      state.isRunning = true;
      state.currentProgress = {
        totalVideos: 0,
        processedVideos: 0,
        foundContests: 0,
        apiRequests: 0,
        quotaUsed: 0,
        status: "running"
      };

      // Запускаем сборщик асинхронно
      runYouTubeScheduler()
        .then(() => {
          state.isRunning = false;
          state.lastRunTime = new Date();
          state.currentProgress.status = "completed";
        })
        .catch((error) => {
          state.isRunning = false;
          state.currentProgress.status = "error";
          console.error("Ошибка при выполнении сборщика:", error);
        });

      res.json({ message: "Сборщик запущен" });
    } catch (error) {
      state.isRunning = false;
      state.currentProgress.status = "error";
      res.status(500).json({ error: "Ошибка при запуске сборщика" });
    }
  }
);

router.post("/stop", authenticateToken, isAdmin, async (req, res) => {
  try {
    await stopScheduler();
    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка при остановке сборщика:', error);
    res.status(500).json({ error: 'Ошибка при остановке сборщика' });
  }
});

// Получение статуса сборщика
router.get("/status", authenticateToken, isAdmin, (req, res) => {
  res.json({
    isRunning: state.isRunning,
    lastRunTime: state.lastRunTime,
    currentProgress: state.currentProgress
  });
});

// Получение настроек
router.get("/settings", authenticateToken, isAdmin, async (req, res) => {
  try {
    const settings = await SchedulerSettings.findOne();
    if (!settings) {
      return res.status(404).json({ error: 'Настройки не найдены' });
    }
    res.json(settings);
  } catch (error) {
    console.error('Ошибка при получении настроек:', error);
    res.status(500).json({ error: 'Ошибка при получении настроек' });
  }
});

// Сохранение настроек
router.post("/settings", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { 
      maxVideosPerRun,
      maxApiRequestsPerRun,
      minVideoViews,
      keywords,
      titleWeight,
      descriptionWeight,
      tagsWeight,
      minimumTotalScore,
      minDurationMinutes,
      maxDurationMinutes,
      minLikes
    } = req.body;
    
    let settings = await SchedulerSettings.findOne();
    if (settings) {
      await settings.update({
        maxVideosPerRun,
        maxApiRequestsPerRun,
        minVideoViews,
        keywords,
        titleWeight,
        descriptionWeight,
        tagsWeight,
        minimumTotalScore,
        minDurationMinutes,
        maxDurationMinutes,
        minLikes
      });
    } else {
      settings = await SchedulerSettings.create({
        maxVideosPerRun,
        maxApiRequestsPerRun,
        minVideoViews,
        keywords,
        titleWeight,
        descriptionWeight,
        tagsWeight,
        minimumTotalScore,
        minDurationMinutes,
        maxDurationMinutes,
        minLikes
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Ошибка при сохранении настроек:', error);
    res.status(500).json({ 
      error: 'Ошибка при сохранении настроек',
      details: error.message 
    });
  }
});

// Получение истории запусков
router.get("/history", authenticateToken, isAdmin, async (req, res) => {
  try {
    const history = await SchedulerHistory.findAll({
      order: [['startTime', 'DESC']],
      limit: 50
    });
    res.json(history);
  } catch (error) {
    console.error('Ошибка при получении истории:', error);
    res.status(500).json({ error: 'Ошибка при получении истории' });
  }
});

// Получение деталей конкретного запуска
router.get("/history/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const run = await SchedulerHistory.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'initiator',
        attributes: ['email']
      }]
    });
    if (!run) {
      return res.status(404).json({ error: 'Запуск не найден' });
    }
    res.json(run);
  } catch (error) {
    console.error('Ошибка при получении деталей запуска:', error);
    res.status(500).json({ error: 'Ошибка при получении деталей запуска' });
  }
});

// Получение настроек расписания
router.get("/cron", authenticateToken, isAdmin, async (req, res) => {
  try {
    let cronSettings = await SchedulerCron.findOne();
    if (!cronSettings) {
      cronSettings = await SchedulerCron.create({
        enabled: false,
        frequency: 'daily',
        time: '00:00',
        days: []
      });
    }
    res.json(cronSettings);
  } catch (error) {
    console.error('Ошибка при получении настроек расписания:', error);
    res.status(500).json({ error: 'Ошибка при получении настроек расписания' });
  }
});

// Сохранение настроек расписания
router.post("/cron", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { enabled, frequency, time, days } = req.body;
    
    let cronSettings = await SchedulerCron.findOne();
    if (cronSettings) {
      await cronSettings.update({
        enabled,
        frequency,
        time,
        days
      });
    } else {
      cronSettings = await SchedulerCron.create({
        enabled,
        frequency,
        time,
        days
      });
    }
    
    // Перезапускаем cron если включено расписание
    if (enabled) {
      const nextRun = calculateNextRun({ frequency, time, days });
      await cronSettings.update({ nextRun });
      startCronJob(cronSettings);
    }
    
    res.json(cronSettings);
  } catch (error) {
    console.error('Ошибка при сохранении расписания:', error);
    res.status(500).json({ 
      error: 'Ошибка при сохранении расписания',
      details: error.message 
    });
  }
});

// Получение статистики по ключевым словам
router.get("/keywords/stats", authenticateToken, isAdmin, async (req, res) => {
  try {
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
      group: [sequelize.json('metadata.keyword')]
    });

    const formattedStats = keywordsStats.map(stat => {
      const total = parseInt(stat.getDataValue('total'));
      const contests = parseInt(stat.getDataValue('contests'));
      return {
        keyword: stat.getDataValue('keyword'),
        count: contests,
        efficiency: total ? Math.round((contests / total) * 100) : 0
      };
    });

    res.json(formattedStats);
  } catch (error) {
    console.error('Ошибка при получении статистики ключевых слов:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении статистики ключевых слов',
      details: error.message 
    });
  }
});

// Сброс настроек
router.post("/settings/reset", authenticateToken, isAdmin, async (req, res) => {
  try {
    // Удаляем все текущие настройки
    await SchedulerSettings.destroy({ where: {} });
    
    // Создаем настройки по умолчанию
    const defaultSettings = await SchedulerSettings.create({
      maxVideosPerRun: 200,
      maxApiRequestsPerRun: 1000,
      minVideoViews: 1000,
      keywords: ["конкурс розыгрыш", "giveaway приз", "розыгрыш приза"],
      titleWeight: 1.0,
      descriptionWeight: 0.7,
      tagsWeight: 0.3,
      minimumTotalScore: 0.5,
      minDurationMinutes: 0,
      maxDurationMinutes: 0,
      minLikes: 0
    });
    
    res.json(defaultSettings);
  } catch (error) {
    console.error('Ошибка при сбросе настроек:', error);
    res.status(500).json({ 
      error: 'Ошибка при сбросе настроек',
      details: error.message 
    });
  }
});

module.exports = router;
