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
      message: Joi.string().required(),
      data: Joi.object({
        enabled: Joi.boolean().required(),
        hasApiKey: Joi.boolean().required()
      }).required(),
      timestamp: Joi.date().iso().required()
    })
  },

  // Схема для получения настроек
  getSettings: {
    response: Joi.object({
      success: Joi.boolean().required(),
      message: Joi.string().required(),
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
      }).required(),
      timestamp: Joi.date().iso().required(),
      meta: Joi.object().optional()
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
      message: Joi.string().required(),
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
      }).required(),
      timestamp: Joi.date().iso().required()
    })
  },

  // Обновляем схему для поиска
  search: {
    query: Joi.object({
      ...paginationSchema,
      q: Joi.string().required().min(1),
      order: Joi.string().valid('date', 'rating', 'relevance', 'title', 'viewCount').default('relevance'),
      publishedAfter: Joi.date().iso(),
      publishedBefore: Joi.date().iso()
    }),
    response: Joi.object({
      success: Joi.boolean().required(),
      message: Joi.string().required(),
      data: Joi.object({
        kind: Joi.string(),
        etag: Joi.string(),
        regionCode: Joi.string(),
        pageInfo: Joi.object({
          totalResults: Joi.number().integer(),
          resultsPerPage: Joi.number().integer()
        }),
        items: Joi.array().items(Joi.object({
          kind: Joi.string(),
          etag: Joi.string(),
          id: Joi.alternatives().try(
            Joi.string(),
            Joi.object({
              kind: Joi.string(),
              videoId: Joi.string()
            })
          ),
          snippet: Joi.object({
            publishedAt: Joi.date().iso(),
            publishTime: Joi.date().iso(),
            channelId: Joi.string(),
            title: Joi.string(),
            description: Joi.string().allow(''),
            thumbnails: Joi.object(),
            channelTitle: Joi.string(),
            tags: Joi.array().items(Joi.string()).optional(),
            categoryId: Joi.string().optional(),
            liveBroadcastContent: Joi.string().optional(),
            defaultLanguage: Joi.string().optional(),
            localized: Joi.object({
              title: Joi.string(),
              description: Joi.string()
            }).optional(),
            defaultAudioLanguage: Joi.string().optional()
          }),
          statistics: Joi.object({
            viewCount: Joi.string(),
            likeCount: Joi.string(),
            dislikeCount: Joi.string(),
            favoriteCount: Joi.string(),
            commentCount: Joi.string()
          }).optional()
        })),
        nextPageToken: Joi.string().optional(),
        prevPageToken: Joi.string().optional()
      }).required(),
      timestamp: Joi.date().iso().required()
    })
  },

  getVideoDetails: {
    params: Joi.object({
      videoId: Joi.string().required()
    }),
    response: Joi.object({
      success: Joi.boolean().required(),
      message: Joi.string().required(),
      data: Joi.object(videoSchema).required(),
      timestamp: Joi.date().iso().required()
    })
  },

  getChannelDetails: {
    params: Joi.object({
      channelId: Joi.string().required()
    }),
    response: Joi.object({
      success: Joi.boolean().required(),
      message: Joi.string().required(),
      data: Joi.object(channelSchema).required(),
      timestamp: Joi.date().iso().required()
    })
  },

  getApiStats: {
    response: Joi.object({
      success: Joi.boolean().required(),
      message: Joi.string().required(),
      data: Joi.object({
        history: Joi.array().items(Joi.object({
          date: Joi.string().required(),
          used: Joi.number().integer().required(),
          limit: Joi.number().integer().required(),
          searchRequests: Joi.number().integer(),
          videoRequests: Joi.number().integer(),
          channelRequests: Joi.number().integer(),
          captionsRequests: Joi.number().integer(),
          errorCount: Joi.number().integer(),
          status: Joi.string(),
          lastRequestTime: Joi.date().iso()
        })).required(),
        today: Joi.object({
          used: Joi.number().integer().required(),
          limit: Joi.number().integer().required(),
          remaining: Joi.number().integer().required(),
          searchRequests: Joi.number().integer(),
          videoRequests: Joi.number().integer(),
          channelRequests: Joi.number().integer(),
          captionsRequests: Joi.number().integer(),
          errorCount: Joi.number().integer(),
          status: Joi.string(),
          lastRequestTime: Joi.date().iso()
        }).allow(null).required()
      }).required(),
      timestamp: Joi.date().iso().required()
    })
  },

  getContestAnalytics: {
    query: Joi.object({
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso()
    }),
    response: Joi.object({
      success: Joi.boolean().required(),
      message: Joi.string().required(),
      data: Joi.object({
        totalVideos: Joi.number().integer(),
        totalViews: Joi.number().integer(),
        totalLikes: Joi.number().integer(),
        totalComments: Joi.number().integer(),
        topVideos: Joi.array().items(Joi.object(videoSchema)),
        topChannels: Joi.array().items(Joi.object(channelSchema))
      }).required(),
      timestamp: Joi.date().iso().required()
    })
  },

  startVideoSearch: {
    body: Joi.object({
      max_results: Joi.number().integer().min(1).max(50).default(50),
      region: Joi.string().default('RU'),
      language: Joi.string().default('ru'),
      video_order: Joi.string().valid('date', 'rating', 'relevance', 'title', 'viewCount').default('date'),
      video_duration: Joi.string().valid('any', 'long', 'medium', 'short').default('any'),
      video_definition: Joi.string().valid('any', 'high', 'standard').default('any'),
      video_type: Joi.string().valid('video', 'channel', 'playlist').default('video'),
      min_subscriber_count: Joi.number().integer().min(0).default(1000),
      min_view_count: Joi.number().integer().min(0).default(500),
      min_video_age: Joi.number().integer().min(0).default(0),
      max_video_age: Joi.number().integer().min(0).default(30),
      contest_probability_threshold: Joi.number().min(0).max(1).default(0.7)
    }).required(),
    response: Joi.object({
      success: Joi.boolean().required(),
      message: Joi.string().required(),
      data: Joi.object({
        message: Joi.string().required(),
        status: Joi.string().valid('success').required()
      }).required(),
      timestamp: Joi.date().iso().required()
    })
  },

  getContestVideos: {
    query: Joi.object({
      ...paginationSchema,
      sortBy: Joi.string().valid('date', 'views', 'likes').default('date'),
      order: Joi.string().valid('asc', 'desc').default('desc')
    }),
    response: Joi.object({
      success: Joi.boolean().required(),
      message: Joi.string().required(),
      data: Joi.object({
        videos: Joi.array().items(Joi.object({
          id: Joi.number().integer().required(),
          youtube_id: Joi.string().required(),
          title: Joi.string().required(),
          description: Joi.string().allow(''),
          channel_id: Joi.string().required(),
          channel_title: Joi.string().required(),
          publish_date: Joi.date().required(),
          views_count: Joi.number().integer(),
          likes_count: Joi.number().integer(),
          comments_count: Joi.number().integer(),
          is_contest: Joi.boolean(),
          contest_type: Joi.string().allow(null),
          contest_status: Joi.string().allow(null),
          prize_value: Joi.number().allow(null),
          contest_probability: Joi.number()
        }).unknown(true)).required(),
        total: Joi.number().integer().required(),
        page: Joi.number().integer().required(),
        totalPages: Joi.number().integer().required()
      }).required(),
      timestamp: Joi.date().iso().required(),
      meta: Joi.object().optional()
    })
  },

  getContestChannels: {
    query: Joi.object({
      ...paginationSchema,
      sortBy: Joi.string().valid('subscribers', 'videos', 'views').default('subscribers'),
      order: Joi.string().valid('asc', 'desc').default('desc')
    }),
    response: Joi.object({
      success: Joi.boolean().required(),
      message: Joi.string().required(),
      data: Joi.object({
        channels: Joi.array().items(Joi.object({
          id: Joi.number().integer().required(),
          channel_id: Joi.string().required(),
          title: Joi.string().required(),
          description: Joi.string().allow(''),
          subscriber_count: Joi.number().integer(),
          video_count: Joi.number().integer(),
          view_count: Joi.number().integer(),
          thumbnail_url: Joi.string().allow(null),
          country: Joi.string().allow(null),
          contest_channel: Joi.boolean(),
          contest_videos_count: Joi.number().integer(),
          last_video_date: Joi.date().allow(null),
          last_checked: Joi.date(),
          status: Joi.string()
        }).unknown(true)).required(),
        total: Joi.number().integer().required(),
        page: Joi.number().integer().required(),
        totalPages: Joi.number().integer().required()
      }).required(),
      timestamp: Joi.date().iso().required(),
      meta: Joi.object().optional()
    })
  },

  getStats: {
    response: Joi.object({
      success: Joi.boolean().required(),
      message: Joi.string().required(),
      data: Joi.object({
        totalVideos: Joi.number().integer(),
        totalChannels: Joi.number().integer(),
        totalViews: Joi.number().integer(),
        lastUpdate: Joi.date().iso(),
        quotaUsage: Joi.object({
          used: Joi.number().integer(),
          limit: Joi.number().integer(),
          resetDate: Joi.date().iso()
        })
      }).required(),
      timestamp: Joi.date().iso().required(),
      meta: Joi.object().optional()
    })
  },

  getContestStats: {
    query: Joi.object({
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso()
    }),
    response: Joi.object({
      success: Joi.boolean().required(),
      message: Joi.string().required(),
      data: Joi.object({
        total: Joi.number().integer().required(),
        active: Joi.number().integer().required(),
        channels: Joi.number().integer().required(),
        dailyStats: Joi.array().items(Joi.object({
          date: Joi.string().required(),
          count: Joi.number().integer().required(),
          avgViews: Joi.number().integer().required(),
          avgLikes: Joi.number().integer().required(),
          avgComments: Joi.number().integer().required()
        })).required()
      }).required(),
      timestamp: Joi.date().iso().required()
    })
  }
};

module.exports = youtubeSchemas; 