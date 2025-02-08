const BaseLogger = require('./base-logger');
const { LOG_TYPES, LOG_LEVELS } = require('./config');

class SystemLogger extends BaseLogger {
  constructor() {
    super(LOG_TYPES.SYSTEM, { level: LOG_LEVELS.INFO });
  }

  // Логирование системных событий
  logSystemEvent(message, metadata = {}) {
    this.info(message, {
      ...metadata,
      timestamp: new Date().toISOString()
    });
  }

  // Логирование критических системных ошибок
  logSystemError(error, metadata = {}) {
    this.error('Системная ошибка', {
      error: {
        message: error.message,
        stack: error.stack
      },
      ...metadata,
      timestamp: new Date().toISOString()
    });
  }
}

// Создаем единственный экземпляр
const systemLogger = new SystemLogger();

module.exports = systemLogger; 