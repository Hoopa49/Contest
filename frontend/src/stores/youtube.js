import { defineStore } from 'pinia'
import { youtubeService } from '@/services/youtube.service'

export const useYoutubeStore = defineStore('youtube', {
  state: () => ({
    videos: [],
    channels: [],
    apiStats: {
      today: {
        quota: {
          used: 0,
          limit: 10000,
          percent: 0
        },
        search: 0,
        video: 0,
        channel: 0,
        captions: 0,
        error_count: 0,
        status: 'active',
        last_request: null
      },
      history: []
    },
    contestStats: null,
    searchResults: [],
    searchTotal: 0,
    nextPageToken: null,
    recentSearches: [],
    excludedChannels: [],
    settings: null,
    isLoading: false,
    error: null
  }),

  getters: {
    getVideoById: (state) => (id) => {
      return state.videos.find(video => video.video_id === id)
    },
    getChannelById: (state) => (id) => {
      return state.channels.find(channel => channel.channel_id === id)
    },
    contestVideosCount: (state) => {
      return state.videos.filter(video => video.is_contest).length
    },
    contestChannelsCount: (state) => {
      return state.channels.filter(channel => channel.contest_count > 0).length
    },
    hasSearchResults: (state) => state.searchResults.length > 0,
    hasNextPage: (state) => !!state.nextPageToken,
    getRecentSearches: (state) => state.recentSearches,
    getExcludedChannels: (state) => state.excludedChannels
  },

  actions: {
    async searchVideos(params) {
      this.loading = true
      this.error = null
      
      try {
        const result = await youtubeService.searchVideos(params)
        
        this.searchResults = result.videos
        this.searchTotal = result.total
        this.nextPageToken = result.nextPageToken
        
        // Сохраняем поисковый запрос в историю
        if (params.query && !this.recentSearches.includes(params.query)) {
          this.recentSearches.unshift(params.query)
          // Ограничиваем историю 10 последними запросами
          if (this.recentSearches.length > 10) {
            this.recentSearches.pop()
          }
        }
        
        return result
      } catch (error) {
        this.error = error.message || 'Ошибка при поиске видео'
        throw error
      } finally {
        this.loading = false
      }
    },

    async runSearch(params) {
      try {
        this.isLoading = true
        const searchParams = {
          max_results: params.maxResults,
          region: params.region,
          language: params.language,
          video_order: params.videoOrder,
          video_duration: params.videoDuration,
          video_definition: params.videoDefinition,
          video_type: params.videoType,
          min_subscriber_count: params.minSubscriberCount,
          min_view_count: params.minViewCount,
          min_video_age: params.minVideoAge,
          max_video_age: params.maxVideoAge,
          contest_probability_threshold: params.contestProbabilityThreshold
        }
        const response = await youtubeService.startVideoSearch(searchParams)
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async getVideoDetails(videoId) {
      try {
        this.isLoading = true
        const response = await youtubeService.getVideoDetails(videoId)
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async getChannelDetails(channelId) {
      try {
        this.isLoading = true
        const response = await youtubeService.getChannelDetails(channelId)
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async getContestVideos(params) {
      try {
        this.isLoading = true;
        this.error = null;
        const response = await youtubeService.getContestVideos(params);
        
        if (!response || !response.data) {
          console.warn('Получен пустой ответ от сервера');
          return { videos: [], total: 0, page: 1, totalPages: 1 };
        }
        
        // Проверяем структуру данных
        const { videos = [], total = 0, page = 1, totalPages = 1 } = response.data;
        
        // Сохраняем только массив видео в state
        this.videos = videos.map(video => ({
          ...video,
          thumbnail_url: video.thumbnail_url || '',
          title: video.title || '',
          channel_title: video.channel_title || '',
          contest_status: video.contest_status || 'unknown',
          contest_type: video.contest_type || 'Не определен'
        }));
        
        return {
          videos: this.videos,
          total,
          page: parseInt(page),
          totalPages: parseInt(totalPages)
        };
      } catch (error) {
        console.error('Ошибка при загрузке видео:', error);
        this.error = error?.response?.data?.message || error.message || 'Неизвестная ошибка';
        return { videos: [], total: 0, page: 1, totalPages: 1 };
      } finally {
        this.isLoading = false;
      }
    },

    async getContestChannels(params) {
      try {
        this.isLoading = true
        this.error = null
        const response = await youtubeService.getContestChannels(params)
        
        if (!response || !response.data) {
          console.warn('Получен пустой ответ от сервера')
          return { channels: [], total: 0, page: 1, totalPages: 1 }
        }
        
        // Проверяем структуру данных
        const { channels = [], total = 0, page = 1, totalPages = 1 } = response.data
        
        // Сохраняем только массив каналов в state
        this.channels = channels.map(channel => ({
          ...channel,
          contest_videos_count: channel.contest_videos_count || 0,
          total_videos: channel.total_videos || 0,
          subscriber_count: channel.subscriber_count || 0,
          thumbnail_url: channel.thumbnail_url || ''
        }))
        
        return { channels: this.channels, total, page, totalPages }
      } catch (error) {
        console.error('Ошибка при загрузке каналов:', error)
        this.error = error?.response?.data?.message || error.message || 'Неизвестная ошибка'
        return { channels: [], total: 0, page: 1, totalPages: 1 }
      } finally {
        this.isLoading = false
      }
    },

    async getApiStats() {
      try {
        const response = await youtubeService.getApiStats()
        if (response && response.data) {
          this.apiStats = {
            today: {
              quota: {
                used: response.data.today?.used || 0,
                limit: response.data.today?.limit || 10000,
                percent: response.data.today?.used ? (response.data.today.used / response.data.today.limit) * 100 : 0
              },
              search: response.data.today?.searchRequests || 0,
              video: response.data.today?.videoRequests || 0,
              channel: response.data.today?.channelRequests || 0,
              captions: response.data.today?.captionsRequests || 0,
              error_count: response.data.today?.errorCount || 0,
              status: response.data.today?.status || 'active',
              last_request: response.data.today?.lastRequest || null
            },
            history: Array.isArray(response.data.history) 
              ? response.data.history.map(day => ({
                  date: day.date,
                  quota: {
                    used: day.used || 0,
                    limit: day.limit || 10000,
                    percent: day.used ? (day.used / day.limit) * 100 : 0
                  },
                  search: day.searchRequests || 0,
                  video: day.videoRequests || 0,
                  channel: day.channelRequests || 0,
                  captions: day.captionsRequests || 0,
                  error_count: day.errorCount || 0
                }))
              : []
          }
          console.log('Обновленная статистика API:', this.apiStats)
        }
        return response
      } catch (error) {
        console.error('Ошибка при получении статистики API:', error)
        this.apiStats = {
          today: {
            quota: {
              used: 0,
              limit: 10000,
              percent: 0
            },
            search: 0,
            video: 0,
            channel: 0,
            captions: 0,
            error_count: 0,
            status: 'active',
            last_request: null
          },
          history: []
        }
        throw error
      }
    },

    async getContestStats() {
      try {
        this.isLoading = true;
        this.error = null;
        
        console.log('Запрос статистики конкурсов');
        const response = await youtubeService.getContestStats();
        
        if (!response || !response.data) {
          console.warn('Получен пустой ответ от сервера');
          this.contestStats = null;
          return null;
        }
        
        console.log('Получены данные статистики:', response.data);
        this.contestStats = response.data;
        return this.contestStats;
      } catch (error) {
        console.error('Ошибка при получении статистики конкурсов:', error);
        this.error = error?.response?.data?.message || error.message || 'Неизвестная ошибка';
        this.contestStats = null;
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async getSettings() {
      try {
        this.isLoading = true
        const response = await youtubeService.getSettings()
        console.log('Store: получены настройки от сервера:', response)
        
        if (response && response.data) {
          this.settings = {
            quotaLimit: parseInt(response.data.quota_limit),
            searchInterval: parseInt(response.data.search_interval),
            channelCheckInterval: parseInt(response.data.channel_check_interval),
            maxResults: parseInt(response.data.max_results),
            region: response.data.region,
            language: response.data.language,
            contestProbabilityThreshold: parseFloat(response.data.contest_probability_threshold),
            minContestVideosForChannel: parseInt(response.data.min_contest_videos_for_channel),
            videoOrder: response.data.video_order,
            videoDuration: response.data.video_duration,
            videoDefinition: response.data.video_definition,
            videoType: response.data.video_type,
            minSubscriberCount: parseInt(response.data.min_subscriber_count),
            minViewCount: parseInt(response.data.min_view_count),
            minVideoAge: parseInt(response.data.min_video_age),
            maxVideoAge: parseInt(response.data.max_video_age)
          }
          console.log('Store: настройки после преобразования:', this.settings)
        }
        return response
      } catch (error) {
        console.error('Store: ошибка при получении настроек:', error)
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateSettings(settings) {
      this.isLoading = true
      try {
        console.log('Store: настройки до отправки:', settings)
        const response = await youtubeService.updateSettings(settings)
        if (response.success) {
          // Преобразуем названия полей обратно в camelCase
          this.settings = {
            quotaLimit: parseInt(response.data.quota_limit),
            searchInterval: parseInt(response.data.search_interval),
            channelCheckInterval: parseInt(response.data.channel_check_interval),
            maxResults: parseInt(response.data.max_results),
            region: response.data.region,
            language: response.data.language,
            contestProbabilityThreshold: parseFloat(response.data.contest_probability_threshold),
            minContestVideosForChannel: parseInt(response.data.min_contest_videos_for_channel),
            videoOrder: response.data.video_order,
            videoDuration: response.data.video_duration,
            videoDefinition: response.data.video_definition,
            videoType: response.data.video_type,
            minSubscriberCount: parseInt(response.data.min_subscriber_count),
            minViewCount: parseInt(response.data.min_view_count),
            minVideoAge: parseInt(response.data.min_video_age),
            maxVideoAge: parseInt(response.data.max_video_age)
          }
          console.log('Store: обновленные настройки:', this.settings)
          return response
        }
        throw new Error(response.message || 'Failed to update settings')
      } catch (error) {
        console.error('Error updating settings:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async getIntegrationStatus() {
      try {
        this.isLoading = true
        const response = await youtubeService.getIntegrationStatus()
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async toggleIntegration(enabled) {
      try {
        this.isLoading = true
        const response = await youtubeService.toggleIntegration(enabled)
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.isLoading = false
      }
    },

    resetState() {
      this.videos = []
      this.channels = []
      this.apiStats = {
        today: {
          quota: {
            used: 0,
            limit: 10000,
            percent: 0
          },
          search: 0,
          video: 0,
          channel: 0,
          captions: 0,
          error_count: 0,
          status: 'active',
          last_request: null
        },
        history: []
      }
      this.contestStats = null
      this.searchResults = []
      this.searchTotal = 0
      this.nextPageToken = null
      this.recentSearches = []
      this.excludedChannels = []
      this.settings = null
      this.isLoading = false
      this.error = null
    },

    addExcludedChannel(channelTitle) {
      if (channelTitle && !this.excludedChannels.includes(channelTitle)) {
        this.excludedChannels.push(channelTitle)
      }
    },

    removeExcludedChannel(channelTitle) {
      const index = this.excludedChannels.indexOf(channelTitle)
      if (index !== -1) {
        this.excludedChannels.splice(index, 1)
      }
    },

    clearExcludedChannels() {
      this.excludedChannels = []
    },

    clearSearchResults() {
      this.searchResults = []
      this.searchTotal = 0
      this.nextPageToken = null
    }
  }
}) 