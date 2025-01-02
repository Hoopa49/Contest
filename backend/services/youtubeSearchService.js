const { Video, SearchCache } = require("../models/Connection");
const youtubeApi = require("../utils/youtubeApi");
const quotaYoutubeService = require('./quotaYoutubeService');
const { Op } = require('sequelize');

class YouTubeSearchService {
  constructor() {
    this.processedVideoIds = new Set();
    this.CACHE_TTL = 24 * 60 * 60 * 1000; // 24 часа
  }

  async searchVideos(keyword, publishedAfter, maxResults) {
    const deduplicatedKeyword = this._deduplicateKeywords(keyword);
    const cacheKey = `${deduplicatedKeyword}_${publishedAfter}`;
    
    // Проверяем кэш в БД
    const cachedResult = await SearchCache.findOne({
      where: { cacheKey }
    });

    if (cachedResult && (Date.now() - new Date(cachedResult.timestamp).getTime()) < this.CACHE_TTL) {
      return this._filterDuplicates(cachedResult.videos);
    }

    // Если кэш устарел, удаляем его
    if (cachedResult) {
      await cachedResult.destroy();
    }

    // Учитываем квоту перед поиском
    await quotaYoutubeService.checkQuota('search');
    
    // Выполняем поиск
    const { videos, nextPageToken } = await youtubeApi.searchVideos(
      deduplicatedKeyword,
      maxResults,
      publishedAfter
    );

    // Сохраняем в кэш БД
    await SearchCache.create({
      cacheKey,
      videos,
      timestamp: new Date()
    });

    return this._filterDuplicates(videos);
  }

  async clearCache() {
    try {
      await SearchCache.destroy({ where: {} });
    } catch (error) {
      console.error('Ошибка при очистке кэша:', error);
    }
  }

  // Добавим метод для очистки старого кэша
  async cleanupOldCache() {
    const expiryDate = new Date(Date.now() - this.CACHE_TTL);
    await SearchCache.destroy({
      where: {
        timestamp: {
          [Op.lt]: expiryDate
        }
      }
    });
  }

  _deduplicateKeywords(keyword) {
    const words = keyword.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    return Array.from(uniqueWords).join(' ');
  }

  _filterDuplicates(videos) {
    const uniqueVideos = videos.filter(video => !this.processedVideoIds.has(video.videoId));
    uniqueVideos.forEach(video => this.processedVideoIds.add(video.videoId));
    return uniqueVideos;
  }
}

module.exports = new YouTubeSearchService(); 