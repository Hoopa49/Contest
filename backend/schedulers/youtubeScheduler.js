const youtubeApi = require("../utils/youtubeApi");
const quotaYoutubeService = require("../services/quotaYoutubeService");
const contentMakerService = require("../services/contentMakerService");
const videoAnalyzer = require("../services/videoAnalyzerService");
const { state, updateProgress } = require('../services/schedulerState');
const { sequelize, Video, SchedulerHistory, SchedulerSettings, ContentMakerYoutube } = require("../models/Connection");
const youtubeSearchService = require("../services/youtubeSearchService");
const websocketService = require("../services/websocketService");

let currentProgress = {
  totalVideos: 0,
  processedVideos: 0,
  foundContests: 0,
  apiRequests: 0,
  quotaUsed: 0,
  status: "idle"
};

let currentRun = null;

const SEARCH_KEYWORDS = [
  "конкурс розыгрыш",
  "giveaway приз",
  "розыгрыш приза",
  "конкурс приз",
  "раздача призов",
];

async function processBatchVideos(videos) {
  try {
    const videoIds = videos.map(v => v.videoId);
    const channelIds = videos.map(v => v.channelId).filter(Boolean);
    
    // Получаем существующие видео и контент-мейкеров одним запросом
    const [existingVideos, existingMakers] = await Promise.all([
      Video.findAll({
        where: { youtubeId: videoIds },
        attributes: ['youtubeId', 'status', 'metadata']
      }),
      ContentMakerYoutube.findAll({
        where: { youtubeId: channelIds },
        attributes: ['youtubeId', 'contestCount']
      })
    ]);

    const existingVideosMap = new Map(existingVideos.map(v => [v.youtubeId, v]));
    const existingMakersMap = new Map(existingMakers.map(m => [m.youtubeId, m]));
    
    // Фильтруем только новые видео
    const newVideoIds = videoIds.filter(id => !existingVideosMap.has(id));
    
    if (newVideoIds.length === 0) {
      return Array.from(existingVideosMap.values());
    }

    // Получаем детали только для новых видео
    const cost = await updateMetrics('videoDetails');
    const videoDetails = await youtubeApi.getBatchVideoDetails(newVideoIds);

    // Подготавливаем данные для пакетного создания
    const newVideos = videoDetails.map(video => ({
      title: video.title,
      description: video.description,
      youtubeId: video.youtubeId,
      channelId: video.metadata?.channelId,
      publicationDate: new Date(video.metadata?.publishedAt),
      link: `https://www.youtube.com/watch?v=${video.youtubeId}`,
      author: video.metadata?.channelTitle || '',
      source: 'youtube',
      metadata: video.metadata,
      status: video.analysis.isContest ? 'contest' : 'pending'
    }));
    const makersToUpdate = new Map();
    
    for (const video of videoDetails) {
      const analysisResult = videoAnalyzer.analyzeVideo(video);
      
      newVideos.push({
        title: video.title,
        link: `https://www.youtube.com/watch?v=${video.youtubeId}`,
        author: video.channelTitle,
        source: "youtube",
        description: video.description,
        youtubeId: video.youtubeId,
        channelId: video.metadata?.channelId,
        status: analysisResult.isContest ? "contest" : "not_contest",
        metadata: { ...video, analysis: analysisResult }
      });

      // Если это конкурс, обновляем статистику контент-мейкера
      if (analysisResult.isContest && video.channelId) {
        const currentCount = makersToUpdate.get(video.channelId) || 0;
        makersToUpdate.set(video.channelId, currentCount + 1);
      }
    }

    // Выполняем все операции с БД в одной транзакции
    await sequelize.transaction(async (t) => {
      // Создаем новые видео
      await Video.bulkCreate(newVideos, { transaction: t });
      
      // Обновляем статистику контент-мейкеров
      for (const [channelId, contestCount] of makersToUpdate) {
        await contentMakerService.findOrCreateMaker({
          youtubeId: channelId,
          title: videoDetails.find(v => v.channelId === channelId)?.channelTitle
        }, t);
        
        await ContentMakerYoutube.increment('contestCount', {
          by: contestCount,
          where: { youtubeId: channelId },
          transaction: t
        });
      }
    });
    
    return [...newVideos, ...existingVideosMap.values()];
  } catch (error) {
    console.error('Ошибка при обработке пакета видео:', error);
    return [];
  }
}

async function stopScheduler() {
  if (currentRun) {
    await currentRun.update({
      endTime: new Date(),
      status: 'stopped',
      totalVideos: currentProgress.totalVideos,
      processedVideos: currentProgress.processedVideos,
      foundContests: currentProgress.foundContests
    });
  }
  
  updateLocalProgress({ status: 'stopped' });
  state.isRunning = false;
}

// Заменим существующую функцию updateMetrics
const updateMetrics = async (operation) => {
  try {
    // Проверяем и обновляем квоту
    const cost = await quotaYoutubeService.checkQuota(operation);
    
    // Обновляем локальные метрики
    currentProgress.apiRequests++;
    currentProgress.quotaUsed += cost;
    
    // Отправляем обновление через WebSocket
    updateLocalProgress(currentProgress);
    
    return cost;
  } catch (error) {
    console.error('Ошибка при обновлении метрик:', error);
    if (error.message.includes('Достигнут дневной лимит квоты')) {
      await stopScheduler();
    }
    throw error;
  }
};

// Обновляем существующую функцию searchVideos
async function searchVideos(keyword, publishedAfter) {
  try {
    await updateMetrics('search');
    const videos = await youtubeSearchService.searchVideos(
      keyword,
      publishedAfter,
      50 // максимальное количество результатов за один запрос
    );
    
    // Обновляем общее количество найденных видео
    if (videos.length) {
      currentProgress.totalVideos += videos.length;
      updateLocalProgress(currentProgress);
    }
    
    return videos;
  } catch (error) {
    console.error('Ошибка при поиске видео:', error);
    throw error;
  }
}

async function runYouTubeScheduler() {
  // Очищаем кэш перед новым запуском
  youtubeSearchService.clearCache();
  
  // Сбрасываем все счетчики
  currentProgress = {
    totalVideos: 0,
    processedVideos: 0,
    foundContests: 0,
    apiRequests: 0,
    quotaUsed: 0,
    status: 'running'
  };
  
  updateLocalProgress(currentProgress);
  
  try {
    const settings = await SchedulerSettings.findOne();
    if (!settings) {
      throw new Error('Настройки сборщика не найдены');
    }

    currentRun = await SchedulerHistory.create({
      startTime: new Date(),
      status: 'running',
      totalVideos: 0,
      processedVideos: 0,
      foundContests: 0,
      apiRequests: 0,
      quotaUsed: 0,
      settings: JSON.stringify(settings)
    });

    const { maxVideosPerKeyword, searchDepthDays, batchSize, keywords } = settings;
    const publishedAfter = new Date(
      Date.now() - searchDepthDays * 24 * 60 * 60 * 1000
    );

    for (const keyword of keywords) {
      console.log(`Поиск видео по ключевым словам: ${keyword}`);
      let totalProcessed = 0;

      while (totalProcessed < maxVideosPerKeyword && state.isRunning) {
        const videos = await youtubeSearchService.searchVideos(
          keyword,
          publishedAfter,
          Math.min(50, maxVideosPerKeyword - totalProcessed)
        );

        if (!videos.length) {
          console.log(`Больше нет видео для ключевых слов: ${keyword}`);
          break;
        }

        updateLocalProgress({
          totalVideos: currentProgress.totalVideos + videos.length
        });

        // Обрабатываем видео пакетами
        for (let i = 0; i < videos.length; i += batchSize) {
          const batch = videos.slice(i, i + batchSize);
          const results = await processBatchVideos(batch);
          
          totalProcessed += batch.length;
          
          updateLocalProgress({
            processedVideos: currentProgress.processedVideos + batch.length,
            foundContests: currentProgress.foundContests + results.filter(r => r.isContest).length
          });

          if (!state.isRunning) {
            await stopScheduler();
            return;
          }

          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // Обновляем статус при завершении
    await currentRun.update({
      endTime: new Date(),
      status: 'completed',
      totalVideos: currentProgress.totalVideos,
      processedVideos: currentProgress.processedVideos,
      foundContests: currentProgress.foundContests,
      apiRequests: currentProgress.apiRequests,
      quotaUsed: currentProgress.quotaUsed
    });

    updateLocalProgress({ status: 'completed' });
  } catch (error) {
    console.error("Ошибка в YouTube scheduler:", error);
    if (currentRun) {
      await currentRun.update({
        endTime: new Date(),
        status: 'error',
        error: error.message,
        totalVideos: currentProgress.totalVideos || 0,
        processedVideos: currentProgress.processedVideos || 0,
        foundContests: currentProgress.foundContests || 0,
        apiRequests: currentProgress.apiRequests || 0,
        quotaUsed: currentProgress.quotaUsed || 0
      });
    }
    throw error;
  }
}

// Определяем функцию updateLocalProgress
const updateLocalProgress = (progress) => {
  currentProgress = { ...currentProgress, ...progress };
  // Используем updateProgress из schedulerState
  updateProgress(currentProgress);
};

const videoFilter = (video, settings) => {
  const duration = parseDuration(video.duration);
  const minDurationSec = settings.minDurationMinutes * 60;
  const maxDurationSec = settings.maxDurationMinutes * 60;
  
  return (
    (!minDurationSec || duration >= minDurationSec) &&
    (!maxDurationSec || duration <= maxDurationSec) &&
    (!settings.minLikes || video.statistics.likeCount >= settings.minLikes)
  );
};

module.exports = {
  runYouTubeScheduler,
  stopScheduler,
  currentProgress,
  updateLocalProgress,
  processBatchVideos,
  searchVideos
};