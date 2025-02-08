const Joi = require('joi');

// Общие схемы для повторного использования
const paginationSchema = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
};

const videoSchema = {
  id: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().allow(''),
  publishedAt: Joi.date().iso(),
  thumbnails: Joi.object(),
  channelId: Joi.string(),
  channelTitle: Joi.string(),
  viewCount: Joi.number().integer(),
  likeCount: Joi.number().integer(),
  commentCount: Joi.number().integer()
};

const channelSchema = {
  id: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().allow(''),
  publishedAt: Joi.date().iso(),
  thumbnails: Joi.object(),
  subscriberCount: Joi.number().integer(),
  videoCount: Joi.number().integer(),
  viewCount: Joi.number().integer()
};

/**
 * Схемы валидации для YouTube API
 */
const youtubeSchemas = {
  // Схема для получения статуса интеграции
  getIntegrationStatus: {
    response: Joi.object({
      success: Joi.boolean().required(),
      data: Joi.object({
        initialized: Joi.boolean().required(),
        enabled: Joi.boolean().required(),
        quotaLimit: Joi.number().integer().min(0).required(),
        quotaUsed: Joi.number().integer().min(0).required(),
        lastSync: Joi.date().allow(null),
        status: Joi.string().valid('ready', 'not_initialized').required(),
        errors: Joi.array().items(
          Joi.object({
            component: Joi.string().required(),
            message: Joi.string().required()
          })
        ).allow(null)
      }).required()
    })
  },

  // Схема для переключения статуса интеграции
  toggleIntegration: {
    request: Joi.object({
      body: Joi.object({
        enabled: Joi.boolean().required()
      }).required(),
      query: Joi.object().empty(),
      params: Joi.object().empty()
    }),
    response: Joi.object({
      success: Joi.boolean().required(),
      data: Joi.object({
        enabled: Joi.boolean().required(),
        hasApiKey: Joi.boolean().required()
      }).required()
    })
  },

  // Схема для получения настроек
  getSettings: {
    response: Joi.object({
      success: Joi.boolean().required(),
      data: Joi.object({
        id: Joi.number().integer().required(),
        enabled: Joi.boolean().required(),
        api_key: Joi.string().allow(null),
        quota_limit: Joi.number().integer().min(0).required(),
        search_interval: Joi.number().integer().min(0).required(),
        channel_check_interval: Joi.number().integer().min(0).required(),
        max_results: Joi.number().integer().min(1).max(50).required(),
        region: Joi.string().required(),
        language: Joi.string().required(),
        contest_probability_threshold: Joi.number().min(0).max(1).required(),
        min_contest_videos_for_channel: Joi.number().integer().min(0).required(),
        video_order: Joi.string().required(),
        video_duration: Joi.string().required(),
        video_definition: Joi.string().required(),
        video_type: Joi.string().required(),
        min_subscriber_count: Joi.number().integer().min(0).required(),
        min_view_count: Joi.number().integer().min(0).required(),
        min_video_age: Joi.number().integer().min(0).required(),
        max_video_age: Joi.number().integer().min(0).required(),
        last_sync: Joi.date().allow(null),
        next_sync: Joi.date().allow(null),
        created_at: Joi.date().required(),
        updated_at: Joi.date().required()
      }).required()
    })
  },

  // Схема для обновления настроек
  updateSettings: {
    request: Joi.object({
      body: Joi.object({
        enabled: Joi.boolean(),
        quota_limit: Joi.number().integer().min(0),
        search_interval: Joi.number().integer().min(0),
        channel_check_interval: Joi.number().integer().min(0),
        max_results: Joi.number().integer().min(1).max(50),
        region: Joi.string(),
        language: Joi.string(),
        contest_probability_threshold: Joi.number().min(0).max(1),
        min_contest_videos_for_channel: Joi.number().integer().min(0),
        video_order: Joi.string(),
        video_duration: Joi.string(),
        video_definition: Joi.string(),
        video_type: Joi.string(),
        min_subscriber_count: Joi.number().integer().min(0),
        min_view_count: Joi.number().integer().min(0),
        min_video_age: Joi.number().integer().min(0),
        max_video_age: Joi.number().integer().min(0)
      }).min(1).required(),
      query: Joi.object().empty(),
      params: Joi.object().empty()
    }),
    response: Joi.object({
      success: Joi.boolean().required(),
      data: Joi.object({
        id: Joi.number().integer().required(),
        enabled: Joi.boolean().required(),
        api_key: Joi.string().allow(null),
        quota_limit: Joi.number().integer().min(0).required(),
        search_interval: Joi.number().integer().min(0).required(),
        channel_check_interval: Joi.number().integer().min(0).required(),
        max_results: Joi.number().integer().min(1).max(50).required(),
        region: Joi.string().required(),
        language: Joi.string().required(),
        contest_probability_threshold: Joi.number().min(0).max(1).required(),
        min_contest_videos_for_channel: Joi.number().integer().min(0).required(),
        video_order: Joi.string().required(),
        video_duration: Joi.string().required(),
        video_definition: Joi.string().required(),
        video_type: Joi.string().required(),
        min_subscriber_count: Joi.number().integer().min(0).required(),
        min_view_count: Joi.number().integer().min(0).required(),
        min_video_age: Joi.number().integer().min(0).required(),
        max_video_age: Joi.number().integer().min(0).required(),
        last_sync: Joi.date().allow(null),
        next_sync: Joi.date().allow(null),
        created_at: Joi.date().required(),
        updated_at: Joi.date().required()
      }).required()
    })
  },

  // Новые схемы
  search: {
    query: Joi.object({
      ...paginationSchema,
      q: Joi.string().required().min(1),
      order: Joi.string().valid('date', 'rating', 'relevance', 'title', 'viewCount').default('relevance'),
      publishedAfter: Joi.date().iso(),
      publishedBefore: Joi.date().iso()
    }),
    response: {
      200: Joi.object({
        items: Joi.array().items(Joi.object(videoSchema)),
        totalResults: Joi.number().integer(),
        nextPageToken: Joi.string().allow(null)
      })
    }
  },

  getVideoDetails: {
    params: Joi.object({
      videoId: Joi.string().required()
    }),
    response: {
      200: Joi.object(videoSchema)
    }
  },

  getChannelDetails: {
    params: Joi.object({
      channelId: Joi.string().required()
    }),
    response: {
      200: Joi.object(channelSchema)
    }
  },

  getApiStats: {
    response: {
      200: Joi.object({
        quotaUsed: Joi.number().integer().required(),
        quotaLimit: Joi.number().integer().required(),
        resetDate: Joi.date().iso().required()
      })
    }
  },

  getContestAnalytics: {
    query: Joi.object({
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso()
    }),
    response: {
      200: Joi.object({
        totalVideos: Joi.number().integer(),
        totalViews: Joi.number().integer(),
        totalLikes: Joi.number().integer(),
        totalComments: Joi.number().integer(),
        topVideos: Joi.array().items(Joi.object(videoSchema)),
        topChannels: Joi.array().items(Joi.object(channelSchema))
      })
    }
  },

  startVideoSearch: {
    body: Joi.object({
      query: Joi.string().required().min(1),
      maxResults: Joi.number().integer().min(1).max(50),
      publishedAfter: Joi.date().iso(),
      publishedBefore: Joi.date().iso()
    }),
    response: {
      200: Joi.object({
        taskId: Joi.string().required(),
        status: Joi.string().valid('started', 'processing').required()
      })
    }
  },

  getContestVideos: {
    query: Joi.object({
      ...paginationSchema,
      sortBy: Joi.string().valid('date', 'views', 'likes').default('date'),
      order: Joi.string().valid('asc', 'desc').default('desc')
    }),
    response: {
      200: Joi.object({
        items: Joi.array().items(Joi.object(videoSchema)),
        total: Joi.number().integer(),
        page: Joi.number().integer(),
        limit: Joi.number().integer()
      })
    }
  },

  getContestChannels: {
    query: Joi.object({
      ...paginationSchema,
      sortBy: Joi.string().valid('subscribers', 'videos', 'views').default('subscribers'),
      order: Joi.string().valid('asc', 'desc').default('desc')
    }),
    response: {
      200: Joi.object({
        items: Joi.array().items(Joi.object(channelSchema)),
        total: Joi.number().integer(),
        page: Joi.number().integer(),
        limit: Joi.number().integer()
      })
    }
  },

  getStats: {
    response: {
      200: Joi.object({
        totalVideos: Joi.number().integer(),
        totalChannels: Joi.number().integer(),
        totalViews: Joi.number().integer(),
        lastUpdate: Joi.date().iso(),
        quotaUsage: Joi.object({
          used: Joi.number().integer(),
          limit: Joi.number().integer(),
          resetDate: Joi.date().iso()
        })
      })
    }
  }
};

module.exports = youtubeSchemas; 