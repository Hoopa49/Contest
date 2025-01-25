const { AsyncLocalStorage } = require('async_hooks');
const jwt = require('jsonwebtoken');
const authContext = new AsyncLocalStorage();

// Получаем JWT_SECRET из переменных окружения или используем значение по умолчанию
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authContextMiddleware = (req, res, next) => {
  // Извлекаем информацию о пользователе
  const getUserInfo = (req) => {
    try {
      // Проверяем сначала req.user
      if (req.user) {
        return req.user;
      }

      // Затем проверяем сессию
      if (req.session?.user) {
        return req.session.user;
      }

      // Проверяем JWT токен
      const authHeader = req.headers.authorization;
      if (authHeader) {
        try {
          const token = authHeader.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          return decoded;
        } catch (error) {
          // Просто возвращаем гостя без логирования ошибки
          return {
            id: 'anonymous',
            role: 'guest',
            username: 'Гость'
          };
        }
      }

      // Если ничего не найдено, возвращаем гостя
      return {
        id: 'anonymous',
        role: 'guest',
        username: 'Гость'
      };
    } catch (error) {
      // Логируем только неожиданные ошибки
      logger.error('Неожиданная ошибка при получении информации о пользователе', {
        error: {
          message: error.message
        }
      });
      return {
        id: 'anonymous',
        role: 'guest',
        username: 'Гость'
      };
    }
  };

  const userInfo = getUserInfo(req);
  
  // Сохраняем информацию в AsyncLocalStorage
  authContext.run({ 
    user: userInfo,
    correlationId: req.correlationId,
    requestId: req.id,
    ip: req.ip || req.connection?.remoteAddress || req.headers?.['x-forwarded-for']?.split(',')[0] || 'unknown'
  }, () => {
    // Добавляем функцию обновления пользователя в req
    req.updateUser = (newUserInfo) => {
      const updatedUser = {
        ...userInfo,
        ...newUserInfo
      };
      // Обновляем контекст
      authContext.getStore().user = updatedUser;
    };
    
    next();
  });
};

// Функция для получения текущего пользователя
const getCurrentUser = () => {
  const store = authContext.getStore();
  if (!store) {
    return { 
      id: 'system', 
      role: 'system', 
      email: null,
      username: 'System'
    };
  }
  return store.user;
};

// Функция для получения текущего контекста
const getCurrentContext = () => {
  return authContext.getStore() || {
    user: { 
      id: 'system', 
      role: 'system', 
      email: null,
      username: 'System'
    },
    correlationId: null,
    requestId: null,
    ip: null
  };
};

module.exports = {
  authContext,
  authContextMiddleware,
  getCurrentUser,
  getCurrentContext
};