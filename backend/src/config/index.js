/**
 * Application Configuration
 * Основная конфигурация приложения
 */

require('dotenv').config()
const cors = require('cors');
const corsOptions = require('./cors');

module.exports = {
  app: {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  
  database: {
    name: process.env.DB_NAME || 'contest_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: '1h',
    refreshExpiresIn: '7d',
    cookieMaxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },

  logging: {
    level: process.env.LOG_LEVEL || 'debug'
  },

  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY,
    quotaLimit: parseInt(process.env.YOUTUBE_QUOTA_LIMIT) || 10000,
    searchInterval: parseInt(process.env.YOUTUBE_SEARCH_INTERVAL) || 3600000, // 1 час в миллисекундах
    channelCheckInterval: parseInt(process.env.YOUTUBE_CHANNEL_CHECK_INTERVAL) || 21600000, // 6 часов в миллисекундах
    maxResults: parseInt(process.env.YOUTUBE_MAX_RESULTS) || 50,
    region: process.env.YOUTUBE_REGION || 'RU',
    language: process.env.YOUTUBE_LANGUAGE || 'ru',
    contestProbabilityThreshold: parseFloat(process.env.YOUTUBE_CONTEST_PROBABILITY_THRESHOLD) || 0.5,
    minContestVideosForChannel: parseInt(process.env.YOUTUBE_MIN_CONTEST_VIDEOS_FOR_CHANNEL) || 5
  }
} 