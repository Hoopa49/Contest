/**
 * Application Entry Point
 * Точка входа в приложение
 */

// Игнорируем предупреждение о устаревшем punycode
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && 
      warning.message.includes('punycode')) {
    return;
  }
  const systemLogger = require('./logging/system-logger');
  systemLogger.warn('Системное предупреждение', { 
    metadata: {
      name: warning.name,
      message: warning.message,
      stack: warning.stack
    }
  });
});

const express = require('express')
const cors = require('cors')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const jwt = require('jsonwebtoken')
const rateLimit = require('express-rate-limit')
const corsOptions = require('./config/cors')
const { createRateLimiter } = require('./config/rate-limit')
const { errorHandler } = require('./middleware/error-handler')
const setupCronJobs = require('./config/cron')
const routes = require('./routes')
const path = require('path')
const swagger = require('./config/swagger')
const { 
  correlationMiddleware, 
  httpLoggerMiddleware, 
  errorLoggerMiddleware 
} = require('./middleware/http-logger.middleware');
const { authContextMiddleware } = require('./logging/auth-context');
const systemLogger = require('./logging/system-logger')
const { logger } = require('./logging')
const morgan = require('morgan')
const { initializeModels } = require('./models')
const services = require('./services')
const redisWrapper = require('./config/redis')

// Получаем JWT_SECRET из переменных окружения или используем значение по умолчанию
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Инициализируем приложение
const app = express()

// Инициализация приложения
const initApp = async () => {
  try {
    // Инициализируем Redis
    systemLogger.info('Инициализация Redis...')
    await redisWrapper.initialize()
    
    // Инициализируем rate limiter
    systemLogger.info('Инициализация rate limiter...')
    const limiterConfig = await createRateLimiter()
    
    // Инициализируем модели
    systemLogger.info('Инициализация моделей...')
    const models = await initializeModels()
    
    // Инициализируем сервисы
    systemLogger.info('Инициализация сервисов...')
    await services.init(models)

    // Базовые middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors(corsOptions));
    app.use(helmet());
    app.use(cookieParser());
    app.use(compression());

    // Middleware для логирования и безопасности
    app.use(correlationMiddleware);     // 1. Добавляем correlation ID
    app.use(authContextMiddleware);     // 2. Добавляем контекст аутентификации
    app.use(httpLoggerMiddleware);      // 3. Логируем HTTP запросы/ответы

    // Аутентификация
    app.use(async (req, res, next) => {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        try {
          const token = authHeader.substring(7);
          const decoded = jwt.verify(token, JWT_SECRET);
          if (decoded) {
            req.user = {
              id: decoded.id || decoded.userId || decoded.sub,
              role: decoded.role || 'user',
              email: decoded.email,
              username: decoded.username || decoded.first_name || decoded.name
            };
          }
        } catch (e) {
          if (e.name !== 'JsonWebTokenError') {
            systemLogger.error('Ошибка верификации JWT', {
              error: e,
              token: '[REDACTED]'
            });
          }
        }
      }
      next();
    });

    // Статические файлы
    app.use('/images', express.static(path.join(__dirname, '../public/images')));

    // Swagger документация
    swagger.setup(app);

    // Заголовки безопасности
    app.use((req, res, next) => {
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'no-referrer');
      next();
    });

    // API маршруты
    app.use('/api', routes);

    // Обработка ошибок
    app.use(errorLoggerMiddleware);
    app.use(errorHandler);

    // Инициализация cron задач
    setupCronJobs();

    systemLogger.info('Приложение успешно инициализировано');
    return app;
  } catch (error) {
    systemLogger.error('Ошибка при инициализации приложения:', {
      error: {
        message: error.message,
        stack: error.stack
      }
    });
    process.exit(1);
  }
}

// Экспортируем функцию инициализации
module.exports = initApp