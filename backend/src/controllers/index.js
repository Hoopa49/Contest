/**
 * Индексный файл контроллеров
 * Инициализация и экспорт всех контроллеров приложения
 */

const { logger } = require('../logging')
const authController = require('./auth.controller')
const userController = require('./user.controller')
const contestController = require('./contest.controller')
const adminController = require('./admin.controller')
const integrationController = require('./integration.controller')
const notificationController = require('./notification.controller')
const settingsController = require('./settings.controller')

// Объект с контроллерами
const controllers = {
  authController,
  userController,
  contestController,
  adminController,
  integrationController,
  notificationController,
  settingsController
}

let initialized = false

// Инициализация всех контроллеров
const init = async (services) => {
  if (initialized) {
    return controllers
  }

  try {
    logger.info('Initializing controllers...')

    // Инициализируем каждый контроллер
    for (const [name, controller] of Object.entries(controllers)) {
      if (controller && typeof controller.init === 'function') {
        await controller.init(services)
        logger.debug(`Controller ${name} initialized`)
      }
    }

    initialized = true
    logger.info('Controllers initialized successfully:', {
      controllerCount: Object.keys(controllers).length,
      controllerNames: Object.keys(controllers)
    })

    return controllers
  } catch (error) {
    logger.error('Error initializing controllers:', {
      error: error.message,
      stack: error.stack
    })
    throw error
  }
}

module.exports = {
  ...controllers,
  init,
  isInitialized: () => initialized
} 