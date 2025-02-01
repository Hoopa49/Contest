/**
 * Индексный файл моделей
 * Инициализация и экспорт всех моделей приложения
 */

const sequelize = require('../config/database')
const { logger } = require('../logging')

// Импорт моделей
const User = require('./user.model')
const Contest = require('./contest.model')
const DraftContest = require('./draft_contest.model')
const Settings = require('./settings.model')
const SystemSettings = require('./system_settings.model')
const Log = require('./log.model')
const ContestParticipation = require('./contest_participation.model')
const FavoriteContest = require('./favorite_contest.model')
const Notification = require('./notification.model')
const NotificationSettings = require('./notification_settings.model')
const ContestComment = require('./contest_comment.model')
const ContestReview = require('./contest_review.model')
const ReviewLike = require('./review_like.model')
const ContestStats = require('./contest_stats')
const ContestShareStats = require('./contest_share_stats.model')
const YoutubeVideo = require('./youtube_video.model')
const YoutubeChannel = require('./youtube_channel.model')
const YoutubeApiQuota = require('./youtube_api_quota.model')
const YoutubeAnalytics = require('./youtube_analytics.model')
const YoutubeSettings = require('./youtube_settings.model')
const IntegrationStats = require('./integration_stats.model')
const IntegrationEvent = require('./integration_events.model')
const IntegrationActivity = require('./integration_activities.model')
const AnalyticsData = require('./analytics_data.model')

let initialized = false

// Инициализируем модели и устанавливаем ассоциации
const initializeModels = async () => {
  if (initialized) {
    return {
      User, Contest, DraftContest, Settings, SystemSettings, Log,
      ContestParticipation, FavoriteContest, Notification, NotificationSettings,
      ContestComment, ContestReview, ReviewLike, ContestStats, ContestShareStats,
      YoutubeVideo, YoutubeChannel, YoutubeApiQuota, YoutubeAnalytics,
      YoutubeSettings, IntegrationStats, IntegrationEvent, IntegrationActivity,
      AnalyticsData
    }
  }

  try {
    // Инициализируем каждую модель
    [
      User, Contest, DraftContest, Settings, SystemSettings, Log,
      ContestParticipation, FavoriteContest, Notification, NotificationSettings,
      ContestComment, ContestReview, ReviewLike, ContestStats, ContestShareStats,
      YoutubeVideo, YoutubeChannel, YoutubeApiQuota, YoutubeAnalytics,
      YoutubeSettings, IntegrationStats, IntegrationEvent, IntegrationActivity,
      AnalyticsData
    ].forEach(model => {
      if (model && typeof model.init === 'function') {
        model.init(sequelize)
        logger.debug(`Model ${model.name} initialized`)
      }
    })

    // Устанавливаем ассоциации после того, как все модели инициализированы
    const models = {
      User, Contest, DraftContest, Settings, SystemSettings, Log,
      ContestParticipation, FavoriteContest, Notification, NotificationSettings,
      ContestComment, ContestReview, ReviewLike, ContestStats, ContestShareStats,
      YoutubeVideo, YoutubeChannel, YoutubeApiQuota, YoutubeAnalytics,
      YoutubeSettings, IntegrationStats, IntegrationEvent, IntegrationActivity,
      AnalyticsData
    }

    Object.values(models).forEach(model => {
      if (model && typeof model.associate === 'function') {
        model.associate(models)
        logger.debug(`Associations set for model ${model.name}`)
      }
    })

    initialized = true
    logger.info('Models initialized successfully', {
      modelCount: Object.keys(models).length,
      modelNames: Object.keys(models).join(', ')
    })

    return models
  } catch (error) {
    logger.error('Error initializing models:', {
      error: error.message,
      stack: error.stack
    })
    throw error
  }
}

// Экспортируем модели и функцию инициализации
module.exports = {
  User, Contest, DraftContest, Settings, SystemSettings, Log,
  ContestParticipation, FavoriteContest, Notification, NotificationSettings,
  ContestComment, ContestReview, ReviewLike, ContestStats, ContestShareStats,
  YoutubeVideo, YoutubeChannel, YoutubeApiQuota, YoutubeAnalytics,
  YoutubeSettings, IntegrationStats, IntegrationEvent, IntegrationActivity,
  AnalyticsData,
  sequelize,
  initializeModels,
  isInitialized: () => initialized
} 