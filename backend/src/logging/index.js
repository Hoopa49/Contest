/**
 * Экспорт модуля логирования
 */

const logger = require('./logger');
const { httpLogger, errorLogger } = require('./middleware');
const { LOG_LEVELS, LOG_TYPES } = require('./config');

module.exports = {
  logger,
  httpLogger,
  errorLogger,
  LOG_LEVELS,
  LOG_TYPES
}; 