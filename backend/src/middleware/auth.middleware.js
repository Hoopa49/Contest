/**
 * Middleware для проверки аутентификации и авторизации
 */

const jwt = require('jsonwebtoken')
const { ValidationError } = require('../utils/errors')
const config = require('../config')
const { userService } = require('../services')
const { logger } = require('../logging')
const { LOG_MESSAGES } = require('../constants/logs')
const { redisClient } = require('../config/redis')

// Локальный кэш для случаев, когда Redis недоступен
const localAuthCache = new Map();

/**
 * Проверка первой аутентификации пользователя
 */
const checkFirstAuth = async (userId) => {
  const today = new Date().toISOString().split('T')[0];
  const authKey = `auth:${userId}:${today}`;

  try {
    if (redisClient?.isReady) {
      // Используем Redis если доступен
      const isFirstAuth = await redisClient.get(authKey) === null;
      if (isFirstAuth) {
        await redisClient.setex(authKey, 24 * 60 * 60, '1');
      }
      return isFirstAuth;
    } else {
      // Fallback на локальный кэш
      const cacheKey = `${userId}:${today}`;
      const isFirstAuth = !localAuthCache.has(cacheKey);
      if (isFirstAuth) {
        localAuthCache.set(cacheKey, true);
        // Очищаем старые записи
        for (const key of localAuthCache.keys()) {
          if (!key.includes(today)) {
            localAuthCache.delete(key);
          }
        }
      }
      return isFirstAuth;
    }
  } catch (error) {
    logger.warn('Ошибка при проверке первой аутентификации', { error: error.message });
    return false;
  }
};

/**
 * Проверка аутентификации пользователя
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Получаем токен из заголовка
    const authHeader = req.headers.authorization
    
    if (!authHeader) {
      logger.warn(LOG_MESSAGES.AUTH.MISSING_TOKEN)
      return res.status(401).json({
        success: false,
        message: 'Отсутствует токен авторизации'
      })
    }

    // Проверяем формат токена
    const [bearer, token] = authHeader.split(' ')
    if (bearer !== 'Bearer' || !token) {
      logger.warn(LOG_MESSAGES.AUTH.INVALID_TOKEN)
      return res.status(401).json({
        success: false,
        message: 'Неверный формат токена'
      })
    }

    // Верифицируем токен
    const decoded = jwt.verify(token, config.jwt.accessSecret)
    
    // Получаем userId из токена
    const userId = decoded.userId
    
    if (!userId) {
      logger.warn(LOG_MESSAGES.AUTH.INVALID_TOKEN)
      return res.status(401).json({
        success: false,
        message: 'Некорректный токен'
      })
    }
    
    // Получаем пользователя из базы данных
    const user = await userService.findById(userId)
    
    if (!user) {
      logger.warn(LOG_MESSAGES.AUTH.USER_NOT_FOUND)
      return res.status(401).json({
        success: false,
        message: 'Пользователь не найден'
      })
    }

    // Добавляем пользователя в request
    req.user = {
      ...user.toJSON(),
      userId: user.id
    }
    
    // Обновляем контекст пользователя
    if (req.updateUser) {
      req.updateUser({
        id: user.id,
        role: user.role,
        email: user.email,
        username: user.username || user.first_name || user.name || user.email
      });
    }
    
    // Проверяем первую аутентификацию
    const isFirstAuth = await checkFirstAuth(userId);
    if (isFirstAuth) {
      logger.debug(LOG_MESSAGES.AUTH.SUCCESS);
    }
    
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Токен истек',
        code: 'TOKEN_EXPIRED'
      })
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Недействительный токен',
        code: 'INVALID_TOKEN'
      })
    }
    
    logger.error(LOG_MESSAGES.AUTH.FAILED, {
      error: error.message,
      name: error.name
    })
    
    next(error)
  }
}

/**
 * Проверка прав администратора
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    logger.warn(LOG_MESSAGES.ACCESS.ADMIN_DENIED, {
      reason: 'No user'
    })
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.user.role !== 'admin') {
    logger.warn(LOG_MESSAGES.ACCESS.ADMIN_DENIED, {
      reason: 'Not admin'
    })
    return res.status(403).json({ error: 'Forbidden' })
  }

  // Обновляем контекст пользователя
  if (req.updateUser) {
    req.updateUser({
      id: req.user.id,
      role: req.user.role,
      email: req.user.email,
      username: req.user.username || req.user.first_name || req.user.name || req.user.email
    });
  }

  // Логируем доступ только к критичным эндпоинтам
  const criticalEndpoints = [
    '/api/admin/settings',
    '/api/admin/users',
    '/api/admin/roles',
    '/api/admin/permissions',
    '/api/admin/youtube/quota'
  ];
  
  if (criticalEndpoints.includes(req.originalUrl)) {
    logger.debug(LOG_MESSAGES.ACCESS.ADMIN_GRANTED, {
      resource: req.originalUrl
    });
  }
  
  next()
}

module.exports = {
  authMiddleware,
  adminMiddleware
} 