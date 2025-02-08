'use strict'

const { v4: uuidv4 } = require('uuid')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const analytics = [
      // Статистика пользователей
      {
        id: uuidv4(),
        date: now,
        category: 'users',
        metrics: {
          total: 100,
          active: 50,
          new: 10
        },
        dimensions: {
          platform: 'web',
          country: 'RU'
        },
        metadata: {
          source: 'system'
        },
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        date: yesterday,
        category: 'users',
        metrics: {
          total: 90,
          active: 45,
          new: 5
        },
        dimensions: {
          platform: 'web',
          country: 'RU'
        },
        metadata: {
          source: 'system'
        },
        created_at: yesterday,
        updated_at: yesterday
      },
      
      // Статистика конкурсов
      {
        id: uuidv4(),
        date: now,
        category: 'contests',
        metrics: {
          total: 20,
          active: 10,
          completed: 5,
          participants: 150
        },
        dimensions: {
          type: 'regular',
          platform: 'all'
        },
        metadata: {
          source: 'system'
        },
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        date: yesterday,
        category: 'contests',
        metrics: {
          total: 15,
          active: 8,
          completed: 3,
          participants: 100
        },
        dimensions: {
          type: 'regular',
          platform: 'all'
        },
        metadata: {
          source: 'system'
        },
        created_at: yesterday,
        updated_at: yesterday
      },
      
      // Статистика активности
      {
        id: uuidv4(),
        date: now,
        category: 'activity',
        metrics: {
          views: 1000,
          likes: 200,
          comments: 50,
          shares: 30
        },
        dimensions: {
          platform: 'all'
        },
        metadata: {
          source: 'system'
        },
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        date: yesterday,
        category: 'activity',
        metrics: {
          views: 800,
          likes: 150,
          comments: 40,
          shares: 25
        },
        dimensions: {
          platform: 'all'
        },
        metadata: {
          source: 'system'
        },
        created_at: yesterday,
        updated_at: yesterday
      }
    ]

    await queryInterface.bulkInsert('analytics_data', analytics)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('analytics_data', null, {})
  }
} 