/**
 * Константы для логирования
 */

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
    SUCCESS: 'Успешная аутентификация',
    FAILED: 'Ошибка аутентификации',
    MISSING_TOKEN: 'Отсутствует токен авторизации',
    INVALID_TOKEN: 'Неверный формат токена',
    USER_NOT_FOUND: 'Пользователь не найден',
    TOKEN_EXPIRED: 'Токен истек',
    TOKEN_INVALID: 'Недействительный токен'
  },
  
  // Доступ
  ACCESS: {
    GRANTED: 'Доступ разрешен',
    DENIED: 'Доступ запрещен',
    ADMIN_GRANTED: 'Доступ администратора предоставлен',
    ADMIN_DENIED: 'Доступ администратора запрещен',
    USER_GRANTED: 'Доступ пользователя предоставлен',
    USER_DENIED: 'Доступ пользователя запрещен'
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
  },
  
  // Система
  SYSTEM: {
    STARTUP: 'Система запущена',
    SHUTDOWN: 'Система остановлена',
    ERROR: 'Системная ошибка',
    WARNING: 'Системное предупреждение'
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