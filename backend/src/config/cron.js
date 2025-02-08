const cron = require('node-cron');
const logger = require('../logging');

// Запускаем cron задачи
const setupCronJobs = () => {
  logger.info('Cron задачи настроены успешно', {
    metadata: {
      tasks: [],
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = setupCronJobs; 