const { google } = require('googleapis');
const quotaYoutubeService = require('../services/quotaYoutubeService');

class YouTubeAPI {
  constructor() {
    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error('YOUTUBE_API_KEY не установлен в переменных окружения');
    }

    this.youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });
  }

  async getVideoDetails(videoId) {
    try {
      await quotaYoutubeService.checkQuota('videoDetails');
      const response = await this.youtube.videos.list({
        part: ['snippet', 'contentDetails', 'statistics'],
        id: videoId
      });

      if (!response?.data?.items?.[0]) {
        throw new Error(`Video ${videoId} not found or API error`);
      }

      const video = response.data.items[0];
      return {
        title: video.snippet.title,
        description: video.snippet.description,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        duration: video.contentDetails.duration,
        viewCount: video.statistics.viewCount,
        likeCount: video.statistics.likeCount,
        commentCount: video.statistics.commentCount,
        categoryId: video.snippet.categoryId,
        channelId: video.snippet.channelId,
        channelTitle: video.snippet.channelTitle,
        thumbnails: video.snippet.thumbnails
      };
    } catch (error) {
      console.error('Error getting video details:', error);
      throw error;
    }
  }

  extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  async searchVideos(query, maxResults = 5, publishedAfter, pageToken = '') {
    try {
      await quotaYoutubeService.checkQuota('search');
      const response = await this.youtube.search.list({
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: maxResults,
        publishedAfter: publishedAfter,
        pageToken: pageToken,
        order: 'date' // Сортировка по дате публикаци
      });
  
        return {
        videos: response.data.items.map(item => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          publishedAt: item.snippet.publishedAt,
          channelTitle: item.snippet.channelTitle,
          thumbnails: item.snippet.thumbnails
        })),
        nextPageToken: response.data.nextPageToken
      };  
    } catch (error) {
      console.error('Ошибка поиска видео:', error);
      return { videos: [], nextPageToken: null };
    }
  }

  async getBatchVideoDetails(videoIds) {
    try {
      await quotaYoutubeService.checkQuota('videoDetails');
      const response = await this.youtube.videos.list({
        part: ['snippet', 'contentDetails', 'statistics'],
        id: videoIds.join(','),
        maxResults: 50
      });

      if (!response?.data?.items) {
        return [];
      }

      return response.data.items.map(video => ({
        title: video.snippet.title,
        description: video.snippet.description,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        duration: video.contentDetails.duration,
        viewCount: video.statistics.viewCount,
        likeCount: video.statistics.likeCount,
        commentCount: video.statistics.commentCount,
        categoryId: video.snippet.categoryId,
        channelId: video.snippet.channelId,
        channelTitle: video.snippet.channelTitle,
        thumbnails: video.snippet.thumbnails,
        youtubeId: video.id
      }));
    } catch (error) {
      console.error('Error getting batch video details:', error);
      return [];
    }
  }
}

const youtubeApi = new YouTubeAPI();
module.exports = youtubeApi;