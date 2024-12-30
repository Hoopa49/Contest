const { google } = require('googleapis');

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
      const response = await this.youtube.videos.list({
        part: ['snippet', 'contentDetails', 'statistics'],
        id: videoId,
        key: process.env.YOUTUBE_API_KEY
      });
  
      // Проверяем наличие ответа и items
      if (!response?.data?.items?.[0]) {
        throw new Error(`Video ${videoId} not found or API error`);
      }
  
      const video = response.data.items[0];
      let comments = [];
      
      try {
        const commentsResponse = await this.youtube.commentThreads.list({
          part: ['snippet'],
          videoId: videoId,
          maxResults: 100,
        });

        if (commentsResponse?.data?.items) {
          comments = commentsResponse.data.items.map(item => ({
            text: item.snippet.topLevelComment.snippet.textDisplay,
            authorDisplayName: item.snippet.topLevelComment.snippet.authorDisplayName,
            publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
            likeCount: item.snippet.topLevelComment.snippet.likeCount
          }));
        }
      } catch (error) {
        console.log(`Комментарии недоступны для видео ${videoId}: ${error.message}`);
      }
  
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
        comments: comments,
        channelId: video.snippet.channelId,
        channelTitle: video.snippet.channelTitle,
        thumbnails: video.snippet.thumbnails
      };
    } catch (error) {
      console.error('YouTube API Error:', error.message);
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
}

const youtubeApi = new YouTubeAPI();
module.exports = youtubeApi;