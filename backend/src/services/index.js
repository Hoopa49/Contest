/**
 * Индексный файл сервисов
 * Инициализация и экспорт всех сервисов приложения
 */

const logger = require('../logging')
const userService = require('./user.service')
const integrationService = require('./integration.service')
const notificationService = require('./notification.service')
const contestService = require('../modules/contest/services/contest.service')
const contestStatsService = require('./contest_stats.service')
const settingsService = require('./settings.service')
const analyticsService = require('./analytics.service')

// Объект с сервисами
const services = {
  userService,
  integrationService,
  notificationService,
  contestService,
  contestStatsService,
  settingsService,
  analyticsService
}

let initialized = false

// Инициализация всех сервисов
const init = async (models) => {
  if (initialized) {
    return services
  }

  try {

    // Инициализируем каждый сервис
    for (const [name, service] of Object.entries(services)) {
      if (service && typeof service.init === 'function') {
        await service.init(models)
      }
    }

    initialized = true

    return services
  } catch (error) {
    logger.error('Error initializing services:', {
      error: error.message,
      stack: error.stack
    })
    throw error
  }
}

module.exports = {
  ...services,
  init,
  isInitialized: () => initialized
} 