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

// Инициализация моделей
const models = {
  User,
  Contest,
  DraftContest,
  Settings,
  Log,
  ContestParticipation,
  FavoriteContest,
  Notification,
  NotificationSettings,
  ContestComment,
  ContestReview,
  ReviewLike,
  ContestStats,
  ContestShareStats,
  youtube_video: YoutubeVideo,
  youtube_channel: YoutubeChannel,
  youtube_api_quota: YoutubeApiQuota,
  youtube_analytics: YoutubeAnalytics,
  youtube_settings: YoutubeSettings,
  integration_stats: IntegrationStats,
  integration_events: IntegrationEvent,
  integration_activities: IntegrationActivity
}

// Инициализируем каждую модель
Object.values(models).forEach(model => {
  if (model && typeof model.init === 'function') {
    model.init(sequelize)
  }
})

// Устанавливаем ассоциации после того, как все модели инициализированы
Object.values(models).forEach(model => {
  if (model && typeof model.associate === 'function') {
    model.associate(models)
  }
})

module.exports = {
  ...models,
  sequelize
} 