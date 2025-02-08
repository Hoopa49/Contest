const express = require('express');
const router = express.Router();
const { initialize: initializeYoutubeController } = require('../controllers/youtube.controller');
const logger = require('../../../logging/logger');
const { ApiError, catchAsync, errorHandler } = require('../../../utils/errors');
const ApiValidator = require('../../../middleware/api-validator.middleware');
const youtubeSchemas = require('../schemas/youtube.schema');

let controller = null;

// Функция инициализации контроллера
const initializeController = async () => {
  try {
    if (controller) {
      logger.debug('Контроллер YouTube уже инициализирован');
      return controller;
    }

    logger.debug('Начало инициализации контроллера YouTube');
    controller = await initializeYoutubeController();
    
    if (!controller) {
      throw new ApiError('Контроллер не был инициализирован корректно', 500, 'CONTROLLER_NOT_INITIALIZED');
    }
    
    logger.info('Контроллер YouTube успешно инициализирован');
    return controller;
  } catch (error) {
    controller = null;
    
    const errorMetadata = {
      message: error?.message || 'Неизвестная ошибка',
      stack: error?.stack || 'No stack trace',
      type: error?.constructor?.name || 'Unknown',
      code: error?.code || 'UNKNOWN_ERROR'
    };
    
    logger.error('Ошибка при инициализации контроллера YouTube:', {
      metadata: { error: errorMetadata }
    });
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      'Ошибка при инициализации контроллера YouTube',
      500,
      'CONTROLLER_INITIALIZATION_ERROR'
    );
  }
};

// Middleware для проверки инициализации контроллера
const ensureController = catchAsync(async (req, res, next) => {
  if (!controller) {
    logger.debug('Контроллер не инициализирован, начинаем инициализацию');
    await initializeController();
  }
  
  if (!controller) {
    throw new ApiError('Не удалось инициализировать контроллер', 500, 'CONTROLLER_INITIALIZATION_FAILED');
  }
  
  next();
});

// Функция для создания обработчика маршрута
const createRouteHandler = (methodName) => {
  return catchAsync(async (req, res) => {
    logger.debug(`Вызов метода ${methodName}`, {
      metadata: {
        path: req.path,
        method: req.method,
        query: req.query
      }
    });

    if (!controller) {
      throw new ApiError('Контроллер не инициализирован', 500, 'CONTROLLER_NOT_INITIALIZED');
    }

    const method = controller[methodName];
    if (typeof method !== 'function') {
      throw new ApiError(`Метод ${methodName} не найден в контроллере`, 500, 'METHOD_NOT_FOUND');
    }

    await method.call(controller, req, res);
  });
};

// Применяем middleware для всех маршрутов
router.use(ensureController);

// Определяем маршруты для админ-панели с валидацией
router.get(
  '/status',
  ApiValidator.validate(youtubeSchemas.getIntegrationStatus),
  createRouteHandler('getIntegrationStatus')
);

router.get(
  '/admin/integrations/youtube/status',
  ApiValidator.validate(youtubeSchemas.getIntegrationStatus),
  createRouteHandler('getIntegrationStatus')
);

router.post(
  '/admin/integrations/youtube/toggle',
  ApiValidator.validate(youtubeSchemas.toggleIntegration),
  createRouteHandler('toggleIntegration')
);

router.get(
  '/admin/integrations/youtube/settings',
  ApiValidator.validate(youtubeSchemas.getSettings),
  createRouteHandler('getSettings')
);

router.put(
  '/admin/integrations/youtube/settings',
  ApiValidator.validate(youtubeSchemas.updateSettings),
  createRouteHandler('updateSettings')
);

// Определяем остальные маршруты с валидацией
router.get(
  '/search',
  ApiValidator.validate(youtubeSchemas.search),
  createRouteHandler('searchVideos')
);

router.get(
  '/videos/:videoId',
  ApiValidator.validate(youtubeSchemas.getVideoDetails),
  createRouteHandler('getVideoDetails')
);

router.get(
  '/channels/:channelId',
  ApiValidator.validate(youtubeSchemas.getChannelDetails),
  createRouteHandler('getChannelDetails')
);

router.get(
  '/api-stats',
  ApiValidator.validate(youtubeSchemas.getApiStats),
  createRouteHandler('getApiStats')
);

router.get(
  '/contest-analytics',
  ApiValidator.validate(youtubeSchemas.getContestAnalytics),
  createRouteHandler('getContestAnalytics')
);

router.post(
  '/search/start',
  ApiValidator.validate(youtubeSchemas.startVideoSearch),
  createRouteHandler('startVideoSearch')
);

router.get(
  '/contest-videos',
  ApiValidator.validate(youtubeSchemas.getContestVideos),
  createRouteHandler('getContestVideos')
);

router.get(
  '/contest-channels',
  ApiValidator.validate(youtubeSchemas.getContestChannels),
  createRouteHandler('getContestChannels')
);

router.get(
  '/stats',
  ApiValidator.validate(youtubeSchemas.getStats),
  createRouteHandler('getStats')
);

// Применяем обработчик ошибок
router.use(errorHandler);

module.exports = router; 