const { v4: uuidv4 } = require('uuid')
const { integration_events: IntegrationEvent, integration_activities: IntegrationActivity, User } = require('../../models')
const logger = require('../../utils/logger')

async function seedIntegrations() {
  try {
    log.info('Начало заполнения тестовых данных интеграций')

    // Получаем тестового пользователя
    const testUser = await User.findOne({
      where: { email: 'admin@mail.ru' }
    })

    if (!testUser) {
      throw new Error('Тестовый пользователь не найден')
    }

    // Создаем тестовые события
    const events = [
      {
        id: uuidv4(),
        platform: 'youtube',
        type: 'success',
        title: 'Синхронизация YouTube',
        message: 'Успешно синхронизировано 10 новых видео',
        data: {
          videos_count: 10,
          channels_count: 2
        }
      },
      {
        id: uuidv4(),
        platform: 'instagram',
        type: 'error',
        title: 'Ошибка Instagram API',
        message: 'Не удалось получить данные: превышен лимит запросов',
        data: {
          error_code: 429,
          retry_after: 3600
        }
      },
      {
        id: uuidv4(),
        platform: 'vk',
        type: 'info',
        title: 'Обновление VK',
        message: 'Запущено обновление групп ВКонтакте',
        data: {
          groups_count: 5
        }
      },
      {
        id: uuidv4(),
        platform: 'telegram',
        type: 'warning',
        title: 'Предупреждение Telegram',
        message: 'Достигнут 80% лимит API запросов',
        data: {
          current_usage: 80,
          limit: 100
        }
      }
    ]

    await IntegrationEvent.bulkCreate(events)
    log.info('Тестовые события созданы:', { count: events.length })

    // Создаем тестовые активности
    const activities = [
      {
        id: uuidv4(),
        user_id: testUser.id,
        platform: 'youtube',
        action_type: 'sync',
        action_data: {
          videos_processed: 15,
          channels_updated: 3
        },
        status: 'success'
      },
      {
        id: uuidv4(),
        user_id: testUser.id,
        platform: 'instagram',
        action_type: 'search',
        action_data: {
          query: 'конкурс',
          results: 25
        },
        status: 'success'
      },
      {
        id: uuidv4(),
        user_id: testUser.id,
        platform: 'vk',
        action_type: 'update',
        action_data: {
          groups_updated: 10
        },
        status: 'pending'
      },
      {
        id: uuidv4(),
        user_id: testUser.id,
        platform: 'telegram',
        action_type: 'check',
        action_data: {
          channels_checked: 5,
          posts_found: 12
        },
        status: 'error'
      }
    ]

    await IntegrationActivity.bulkCreate(activities)
    log.info('Тестовые активности созданы:', { count: activities.length })

    log.info('Заполнение тестовых данных интеграций завершено')
  } catch (error) {
    log.error('Ошибка при заполнении тестовых данных интеграций:', error)
    throw error
  }
}

// Запускаем сидер если файл вызван напрямую
if (require.main === module) {
  seedIntegrations()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = seedIntegrations 