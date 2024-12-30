const youtubeApi = require("../utils/youtubeApi");
const { Video } = require("../models/Connection");
const videoAnalyzer = require('./videoAnalyzerService');

class VideoService {
  async addVideoFromUrl(initialVideoData) {
    try {
      const videoId = youtubeApi.extractVideoId(initialVideoData.link);
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }
  
      // Проверяем, существует ли видео в БД
      let video = await Video.findOne({
        where: { youtubeId: videoId },
      });
  
      if (video) {
        return video;
      }
  
      // Получаем полную информацию о видео
      const videoInfo = await youtubeApi.getVideoDetails(videoId);
      const analysisResult = videoAnalyzer.analyzeVideo(videoInfo);
  
      // Объединяем все данные
      const videoData = {
        ...initialVideoData,
        youtubeId: videoId,
        status: analysisResult.isContest ? 'contest' : 'not_contest',
        metadata: {
          ...videoInfo,
          analysis: analysisResult
        }
      };
  
      // Создаем запись в БД
      video = await Video.create(videoData);
      return video;
    } catch (error) {
      console.error("Error adding video:", error);
      throw error;
    }
  }

  async findVideoByYoutubeId(youtubeId) {
    try {
      const video = await Video.findOne({
        where: {
          youtubeId: youtubeId
        }
      });
      return video;
    } catch (error) {
      console.error('Ошибка при поиске видео:', error);
      return null;
    }
  }
}

// Создаем и экспортируем экземпляр сервиса
const videoService = new VideoService();
module.exports = videoService;
