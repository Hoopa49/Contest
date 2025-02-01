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
  const { logger } = require('./logging');
  logger.warn('Системное предупреждение', { 
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
const corsOptions = require('./config/cors')
const { basicLimiter, authLimiter, apiLimiter } = require('./config/rate-limit')
const { errorHandler } = require('./middleware/error-handler')
const setupCronJobs = require('./config/cron')
const routes = require('./routes')
const path = require('path')
const swagger = require('./config/swagger')
const { 
  correlationMiddleware, 
  requestLoggerMiddleware, 
  errorLoggerMiddleware 
} = require('./logging/middleware');
const { authContextMiddleware } = require('./logging/auth-context');
const { logger } = require('./logging')
const morgan = require('morgan')
const { initializeModels } = require('./models')
const services = require('./services')

// Получаем JWT_SECRET из переменных окружения или используем значение по умолчанию
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Инициализируем приложение
const app = express()

// Инициализируем модели и сервисы
const initApp = async () => {
  try {
    const models = await initializeModels()
    await services.init(models)
    logger.info('Application initialized successfully')
  } catch (error) {
    logger.error('Error initializing application:', error)
    process.exit(1)
  }
}

// Добавляем базовые middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(helmet());
app.use(cookieParser());

// Добавляем middleware для логирования
app.use(correlationMiddleware);     // Сначала устанавливаем correlationId

// Аутентификация должна быть до логирования
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
      // Игнорируем ошибки верификации токена
      if (e.name !== 'JsonWebTokenError') {
        logger.error('Ошибка верификации JWT', {
          error: e,
          token: '***'
        });
      }
    }
  }
  next();
});

app.use(authContextMiddleware);     // Затем контекст аутентификации
app.use(requestLoggerMiddleware);   // И только потом логирование запросов

// Serve static files from public directory
app.use('/images', express.static(path.join(__dirname, '../public/images')))

// Логирование HTTP запросов
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }))

// Настройка Swagger
swagger.setup(app);

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block')
  // Временно отключаем некоторые заголовки безопасности
  // res.setHeader('X-Frame-Options', 'DENY')
  // res.setHeader('X-Content-Type-Options', 'nosniff')
  // res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  // res.setHeader('Content-Security-Policy', "frame-ancestors 'none'")
  res.setHeader('Referrer-Policy', 'no-referrer')
  next()
})

// Routes
app.use('/api', routes)

// Обработка ошибок должна быть последней
app.use(errorLoggerMiddleware);

// Error handling
app.use(errorHandler)

// Инициализация cron задач
setupCronJobs()

// Start server
const PORT = process.env.PORT || 3000

// Инициализируем приложение и запускаем сервер
initApp().then(() => {
  app.listen(PORT, () => {
    logger.info('Сервер запущен', { 
      metadata: {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        node_version: process.version
      }
    })
    
    logger.info('API документация доступна', {
      metadata: {
        url: `http://localhost:${PORT}/api-docs`
      }
    })
  })
})

// Обработка необработанных ошибок
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Необработанное отклонение промиса', {
    metadata: {
      reason: reason instanceof Error ? {
        message: reason.message,
        stack: reason.stack,
        name: reason.name
      } : reason,
      promise: promise
    }
  })
})

process.on('uncaughtException', (error) => {
  logger.error('Необработанное исключение', {
    metadata: {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    }
  })
  // Даем время на запись лога перед выходом
  setTimeout(() => {
    process.exit(1)
  }, 1000)
})

module.exports = app