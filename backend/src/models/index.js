/**
 * Индексный файл моделей
 * Инициализация и экспорт всех моделей приложения
 */

const sequelize = require('../config/database')
const logger = require('../logging')

// Импорт моделей
const User = require('./user.model')
const Contest = require('./contest.model')
const DraftContest = require('./draft_contest.model')
const SystemSettings = require('./system_settings.model')
const SystemSettingsHistory = require('./system_settings_history.model')
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
let models = null

// Инициализируем модели и устанавливаем ассоциации
const initializeModels = async () => {
  if (initialized) {
    return models;
  }

  try {
    // Инициализируем каждую модель
    User.init(sequelize)
    Contest.init(sequelize)
    DraftContest.init(sequelize)
    SystemSettings.init(sequelize)
    SystemSettingsHistory.init(sequelize)
    ContestParticipation.init(sequelize)
    FavoriteContest.init(sequelize)
    Notification.init(sequelize)
    NotificationSettings.init(sequelize)
    ContestComment.init(sequelize)
    ContestReview.init(sequelize)
    ReviewLike.init(sequelize)
    ContestStats.init(sequelize)
    ContestShareStats.init(sequelize)
    YoutubeVideo.init(sequelize)
    YoutubeChannel.init(sequelize)
    YoutubeApiQuota.init(sequelize)
    YoutubeAnalytics.init(sequelize)
    YoutubeSettings.init(sequelize)
    IntegrationStats.init(sequelize)
    IntegrationEvent.init(sequelize)
    IntegrationActivity.init(sequelize)
    AnalyticsData.init(sequelize)

    // Создаем объект моделей
    models = {
      User,
      Contest,
      DraftContest,
      SystemSettings,
      SystemSettingsHistory,
      ContestParticipation,
      FavoriteContest,
      Notification,
      NotificationSettings,
      ContestComment,
      ContestReview,
      ReviewLike,
      ContestStats,
      ContestShareStats,
      YoutubeVideo,
      YoutubeChannel,
      YoutubeApiQuota,
      YoutubeAnalytics,
      YoutubeSettings,
      IntegrationStats,
      IntegrationEvent,
      IntegrationActivity,
      AnalyticsData,
      sequelize
    }

    // Устанавливаем ассоциации между моделями
    Object.values(models).forEach(model => {
      if (model && typeof model.associate === 'function') {
        model.associate(models)
      }
    })

    initialized = true
    logger.info('Модели успешно инициализированы')
    
    return models
  } catch (error) {
    logger.error('Ошибка инициализации моделей:', error)
    throw error
  }
}

// Экспортируем только функцию инициализации
// Модели будут доступны только после вызова initializeModels
module.exports = {
  initializeModels,
  isInitialized: () => initialized
} 