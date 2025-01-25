const cron = require('node-cron');
const { logger } = require('../logging');

// Запускаем задачу очистки логов каждый день в 00:00
const setupCronJobs = () => {
  // Очистка логов каждый день в полночь
  cron.schedule('0 0 * * *', () => {
    logger.info('Запуск запланированной очистки логов', {
      metadata: {
        schedule: '0 0 * * *',
        task: 'clean_logs',
        timestamp: new Date().toISOString()
      }
    });
  });

  logger.info('Cron задачи настроены успешно', {
    metadata: {
      tasks: ['clean_logs'],
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = setupCronJobs; 