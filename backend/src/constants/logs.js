// Категории логов
const LOG_CATEGORIES = {
  AUTH: 'auth',
  ACCESS: 'access',
  INTEGRATION: 'integration',
  REQUEST: 'request',
  RESPONSE: 'response',
  DATABASE: 'database',
  SYSTEM: 'system'
};

// Сообщения для логов
const LOG_MESSAGES = {
  // Аутентификация
  AUTH: {
    SUCCESS: 'Пользователь аутентифицирован',
    FAILED: 'Ошибка аутентификации',
    LOGOUT: 'Пользователь вышел из системы'
  },
  
  // Доступ
  ACCESS: {
    GRANTED: 'Доступ разрешен',
    DENIED: 'Доступ запрещен',
    ADMIN_GRANTED: 'Доступ к админ-ресурсу разрешен',
    ADMIN_DENIED: 'Доступ к админ-ресурсу запрещен'
  },
  
  // Интеграции
  INTEGRATION: {
    SYNC_START: 'Начало синхронизации',
    SYNC_END: 'Синхронизация завершена',
    ERROR: 'Ошибка интеграции',
    QUOTA_EXCEEDED: 'Превышен лимит запросов API'
  },
  
  // HTTP
  HTTP: {
    REQUEST: 'Входящий HTTP запрос',
    RESPONSE: 'Ответ на HTTP запрос'
  },
  
  // База данных
  DATABASE: {
    QUERY_ERROR: 'Ошибка выполнения запроса к БД',
    MIGRATION_START: 'Начало миграции',
    MIGRATION_END: 'Миграция завершена',
    SEEDING_START: 'Начало заполнения данными',
    SEEDING_END: 'Заполнение данными завершено'
  }
};

// Уровни логирования
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

module.exports = {
  LOG_CATEGORIES,
  LOG_MESSAGES,
  LOG_LEVELS
}; 