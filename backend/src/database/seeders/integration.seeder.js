const { v4: uuidv4 } = require('uuid')
const { logger } = require('../../logging')
const { User, integration_events: IntegrationEvent } = require('../../models')

async function seedIntegrations() {
  try {
    // Получаем тестового пользователя или создаем нового
    const [testUser] = await User.findOrCreate({
      where: { email: 'test@example.com' },
      defaults: {
        id: uuidv4(),
        username: 'test_user',
        password_hash: 'password123',
        role: 'user'
      }
    })

    // Создаем тестовые события
    const events = [
      {
        id: uuidv4(),
        platform: 'youtube',
        type: 'success',
        title: 'Синхронизация YouTube',
        message: 'Успешно обработано 15 видео и обновлено 3 канала',
        data: {
          videos_processed: 15,
          channels_updated: 3
        }
      },
      {
        id: uuidv4(),
        platform: 'instagram',
        type: 'success',
        title: 'Поиск в Instagram',
        message: 'Найдено 25 результатов по запросу "конкурс"',
        data: {
          query: 'конкурс',
          results: 25
        }
      },
      {
        id: uuidv4(),
        platform: 'vk',
        type: 'warning',
        title: 'Обновление ВКонтакте',
        message: 'Обновлено 10 групп, процесс продолжается',
        data: {
          groups_updated: 10
        }
      },
      {
        id: uuidv4(),
        platform: 'telegram',
        type: 'error',
        title: 'Проверка Telegram',
        message: 'Ошибка при проверке каналов',
        data: {
          channels_checked: 5,
          posts_found: 12
        }
      }
    ]

    await IntegrationEvent.bulkCreate(events)
    logger.info('Тестовые события созданы:', { count: events.length })

  } catch (error) {
    logger.error('Ошибка при создании тестовых событий:', {
      error: error.message,
      stack: error.stack,
      details: error.errors ? error.errors.map(e => ({
        message: e.message,
        type: e.type,
        path: e.path,
        value: e.value
      })) : null
    })
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