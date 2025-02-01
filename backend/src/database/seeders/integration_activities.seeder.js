'use strict'

const { v4: uuidv4 } = require('uuid')
const { logger } = require('../../logging')
const { User, integration_activities: IntegrationActivity } = require('../../models')

async function seedIntegrationActivities() {
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
        status: 'success',
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 час назад
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
        status: 'success',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 часа назад
      },
      {
        id: uuidv4(),
        user_id: testUser.id,
        platform: 'vk',
        action_type: 'update',
        action_data: {
          groups_updated: 10
        },
        status: 'pending',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 часа назад
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
        status: 'error',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 часа назад
      }
    ]

    await IntegrationActivity.bulkCreate(activities)
    logger.info('Тестовые активности созданы:', { count: activities.length })

  } catch (error) {
    logger.error('Ошибка при создании тестовых активностей:', error)
    throw error
  }
}

module.exports = seedIntegrationActivities 