'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const userId = '7de6451f-7b71-4e4f-a03d-3605267d4fd5';
    const now = new Date();

    // Создаем черновики конкурсов
    await queryInterface.bulkInsert('draft_contests', [
      {
        id: uuidv4(),
        user_id: userId,
        title: 'Черновик большого конкурса',
        description: 'Предварительное описание конкурса',
        platform_type: 'youtube',
        draft_status: 'in_progress',
        platform_data: JSON.stringify({
          channel_id: null,
          video_id: null,
          search_query: 'macbook pro конкурс розыгрыш'
        }),
        prizes_data: JSON.stringify([{
          name: 'MacBook Pro',
          value: 200000,
          quantity: 1,
          description: 'MacBook Pro 14" M3 Pro'
        }]),
        rules_data: JSON.stringify([
          'Подпишитесь на канал',
          'Поставьте лайк',
          'Оставьте комментарий'
        ]),
        requirements_data: JSON.stringify([
          {
            type: 'subscription',
            required: true
          },
          {
            type: 'like',
            required: true
          },
          {
            type: 'comment',
            required: true
          }
        ]),
        current_step: 2,
        completion_percentage: 40,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        user_id: userId,
        title: 'Черновик еженедельного конкурса',
        description: 'Шаблон для еженедельных конкурсов',
        platform_type: 'youtube',
        draft_status: 'in_progress',
        platform_data: JSON.stringify({
          channel_id: null,
          video_id: null,
          search_query: 'еженедельный конкурс розыгрыш'
        }),
        prizes_data: JSON.stringify([{
          name: 'Приз недели',
          value: 50000,
          quantity: 3,
          description: 'Еженедельный приз'
        }]),
        rules_data: JSON.stringify([
          'Подпишитесь на канал',
          'Поставьте лайк',
          'Сделайте репост',
          'Оставьте комментарий'
        ]),
        requirements_data: JSON.stringify([
          {
            type: 'subscription',
            required: true
          },
          {
            type: 'like',
            required: true
          },
          {
            type: 'share',
            required: true
          },
          {
            type: 'comment',
            required: true
          }
        ]),
        current_step: 3,
        completion_percentage: 60,
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('draft_contests', null, {});
  }
}; 