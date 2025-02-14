'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const userId = '7de6451f-7b71-4e4f-a03d-3605267d4fd5';
    const now = new Date();

    // Создаем конкурсы
    const contests = [
      {
        id: uuidv4(),
        user_id: userId,
        title: 'Большой конкурс с призами',
        description: 'Участвуйте в нашем конкурсе и выигрывайте призы!',
        rules_data: JSON.stringify([
          'Подпишитесь на канал',
          'Поставьте лайк',
          'Оставьте комментарий'
        ]),
        prizes_data: JSON.stringify([
          {
            name: 'iPhone 15 Pro',
            value: 150000,
            quantity: 1,
            description: 'Новейший iPhone 15 Pro'
          }
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
        start_date: now,
        end_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        platform_type: 'youtube',
        platform_id: 'video123',
        source_url: 'https://youtube.com/watch?v=video123',
        contest_status: 'active',
        allow_comments: true,
        allow_reviews: true,
        allow_rating: true,
        image: 'https://example.com/contest1.jpg',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        user_id: userId,
        title: 'Розыгрыш игровой консоли',
        description: 'Разыгрываем PlayStation 5 среди подписчиков!',
        rules_data: JSON.stringify([
          'Подпишитесь',
          'Поставьте лайк',
          'Сделайте репост',
          'Оставьте комментарий'
        ]),
        prizes_data: JSON.stringify([
          {
            name: 'PlayStation 5',
            value: 80000,
            quantity: 1,
            description: 'PlayStation 5 Digital Edition'
          }
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
        start_date: now,
        end_date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        platform_type: 'youtube',
        platform_id: 'video456',
        source_url: 'https://youtube.com/watch?v=video456',
        contest_status: 'active',
        allow_comments: true,
        allow_reviews: true,
        allow_rating: true,
        image: 'https://example.com/contest2.jpg',
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('contests', contests);

    // Создаем статистику конкурсов
    await queryInterface.bulkInsert('contest_stats', contests.map(contest => ({
      id: uuidv4(),
      contest_id: contest.id,
      views_count: 1000,
      participants_count: 100,
      favorites_count: 50,
      rating: 4.5,
      activity_data: JSON.stringify({
        likes: 200,
        comments: 150,
        shares: 50
      }),
      created_at: now,
      updated_at: now
    })));

    // Создаем статистику репостов
    const platforms = ['VK', 'Telegram', 'WhatsApp'];
    const shareStats = contests.flatMap(contest => 
      platforms.map(platform => ({
        contest_id: contest.id,
        platform: platform,
        shares_count: Math.floor(Math.random() * 50),
        created_at: now,
        updated_at: now
      }))
    );
    await queryInterface.bulkInsert('contest_share_stats', shareStats);

    // Создаем участия в конкурсах
    await queryInterface.bulkInsert('contest_participations', contests.map(contest => ({
      id: uuidv4(),
      contest_id: contest.id,
      user_id: userId,
      status: 'pending',
      submission_url: 'https://youtube.com/comment123',
      submission_data: JSON.stringify({
        comment_id: 'comment123',
        comment_text: 'Хочу участвовать!',
        requirements_met: true
      }),
      created_at: now,
      updated_at: now
    })));

    // Создаем комментарии к конкурсам
    await queryInterface.bulkInsert('contest_comments', contests.map(contest => ({
      id: uuidv4(),
      contest_id: contest.id,
      user_id: userId,
      parent_id: null,
      content: 'Отличный конкурс! Обязательно участвую!',
      is_edited: false,
      created_at: now,
      updated_at: now
    })));

    // Создаем обзоры конкурсов
    await queryInterface.bulkInsert('contest_reviews', contests.map(contest => ({
      id: uuidv4(),
      contest_id: contest.id,
      user_id: userId,
      rating: 5,
      content: 'Отличный конкурс, все честно и прозрачно. Плюсы: хороший приз, простые условия, честное проведение. Минусы: большая конкуренция.',
      is_edited: false,
      likes_count: 0,
      reports_count: 0,
      created_at: now,
      updated_at: now
    })));

    // Создаем избранные конкурсы
    await queryInterface.bulkInsert('favorite_contests', contests.map(contest => ({
      user_id: userId,
      contest_id: contest.id,
      created_at: now,
      updated_at: now
    })));
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('contest_share_stats', null, {});
    await queryInterface.bulkDelete('favorite_contests', null, {});
    await queryInterface.bulkDelete('contest_reviews', null, {});
    await queryInterface.bulkDelete('contest_comments', null, {});
    await queryInterface.bulkDelete('contest_participations', null, {});
    await queryInterface.bulkDelete('contest_stats', null, {});
    await queryInterface.bulkDelete('contests', null, {});
  }
}; 