const cron = require('node-cron');
const { SchedulerCron } = require('../models/Connection');
const { runYouTubeScheduler } = require('../schedulers/youtubeScheduler');
const { state } = require('./schedulerState');

function calculateNextRun(schedule) {
  const now = new Date();
  let nextRun = new Date();
  nextRun.setSeconds(0, 0);

  switch (schedule.frequency) {
    case 'hourly':
      nextRun.setHours(nextRun.getHours() + 1, 0, 0, 0);
      break;
      
    case 'daily':
      const [hours] = schedule.time.split(':');
      nextRun.setHours(parseInt(hours), 0, 0, 0);
      if (now >= nextRun) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
      break;
      
    case 'weekly':
      const [weeklyHours] = schedule.time.split(':');
      const days = schedule.days.sort((a, b) => a - b);
      if (days.length === 0) return null;
      
      nextRun.setHours(parseInt(weeklyHours), 0, 0, 0);
      const currentDay = now.getDay();
      const nextDay = days.find(d => d > currentDay) || days[0];
      const daysToAdd = nextDay > currentDay ? 
        nextDay - currentDay : 
        7 - currentDay + nextDay;
      
      nextRun.setDate(nextRun.getDate() + daysToAdd);
      if (daysToAdd === 0 && now >= nextRun) {
        nextRun.setDate(nextRun.getDate() + 7);
      }
      break;
  }

  const utcNextRun = new Date(Date.UTC(
    nextRun.getFullYear(),
    nextRun.getMonth(),
    nextRun.getDate(),
    nextRun.getHours(),
    nextRun.getMinutes(),
    0,
    0
  ));

  return utcNextRun;
}

// Преобразование настроек в cron-выражение
function scheduleToCron(schedule) {
  switch (schedule.frequency) {
    case 'hourly':
      return '0 * * * *';
    case 'daily':
      const [hours] = schedule.time.split(':');
      return `0 ${hours} * * *`;
    case 'weekly':
      const [weeklyHours] = schedule.time.split(':');
      if (!schedule.days || schedule.days.length === 0) {
        return `0 ${weeklyHours} * * 0`;
      }
      const days = schedule.days.join(',');
      return `0 ${weeklyHours} * * ${days}`;
    default:
      throw new Error('Неподдерживаемая частота запуска');
  }
}

let cronJob = null;

async function initScheduler() {
  const settings = await SchedulerCron.findOne();
  if (settings?.enabled) {
    startCronJob(settings);
  }
}

function startCronJob(settings) {
  if (cronJob) {
    cronJob.stop();
  }

  const cronExpression = scheduleToCron(settings);
  cronJob = cron.schedule(cronExpression, async () => {
    // Проверяем не запущен ли уже сборщик
    if (state.isRunning) {
      console.log('Пропуск запланированного запуска: сборщик уже работает');
      return;
    }

    console.log('Запуск сборщика по расписанию...');
    try {
      state.isRunning = true;
      await runYouTubeScheduler();
    } catch (error) {
      console.error('Ошибка при запуске по расписанию:', error);
    } finally {
      state.isRunning = false;
    }
  });
}

module.exports = {
  calculateNextRun,
  initScheduler,
  startCronJob
}; 