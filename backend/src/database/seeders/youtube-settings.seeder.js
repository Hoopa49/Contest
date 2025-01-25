const { youtube_settings: YoutubeSettings } = require('../../models');
const logger = require('../../utils/logger');

async function seedYoutubeSettings() {
  try {
    // Проверяем, существуют ли уже настройки
    const existingSettings = await YoutubeSettings.findOne();
    
    if (existingSettings) {
      log.info('Настройки YouTube уже существуют');
      return;
    }

    // Создаем настройки
    // Примечание: API ключ должен храниться в .env файле, а не в базе данных
    const settings = await YoutubeSettings.create({
      enabled: true,
      quota_limit: 10000,
      search_interval: 120, // 2 часа
      channel_check_interval: 240, // 4 часа
      max_results: 10,
      region: 'RU',
      language: 'ru',
      contest_probability_threshold: 0.7,
      min_contest_videos_for_channel: 10,
      video_order: 'date',
      video_duration: 'any',
      video_definition: 'any',
      video_type: 'video',
      min_subscriber_count: 0,
      min_view_count: 0,
      min_video_age: 0,
      max_video_age: 30
    });

    log.info('Настройки YouTube созданы:', {
      enabled: settings.enabled,
      quotaLimit: settings.quota_limit
    });

  } catch (error) {
    log.error('Ошибка при создании настроек YouTube:', error);
    throw error;
  }
}

// Запускаем сидер, если файл вызван напрямую
if (require.main === module) {
  seedYoutubeSettings()
    .then(() => {
      log.info('Сидер настроек YouTube выполнен успешно');
      process.exit(0);
    })
    .catch(error => {
      log.error('Ошибка выполнения сидера настроек YouTube:', error);
      process.exit(1);
    });
}

module.exports = seedYoutubeSettings; 