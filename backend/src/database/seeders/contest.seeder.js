/**
 * Сид для создания тестовых конкурсов
 */

const { Contest, User, DraftContest } = require('../../models')
const { v4: uuidv4 } = require('uuid')

async function seedTestContests() {
  try {
    // Получаем тестового пользователя
    const testUser = await User.findOne({
      where: { email: 'test@example.com' }
    })

    if (!testUser) {
      console.log('Тестовый пользователь не найден')
      return
    }

    // Создаем черновик конкурса
    const draftContest = await DraftContest.create({
      user_id: testUser.id,
      title: 'Тестовый черновик конкурса',
      description: 'Описание тестового черновика',
      platform_type: 'youtube',
      draft_status: 'in_progress',
      platform_data: {},
      prizes_data: [],
      rules_data: [],
      requirements_data: [],
      current_step: 1,
      completion_percentage: 0
    })

    // Массив тестовых конкурсов
    const testContests = [
      {
        user_id: testUser.id,
        draft_id: draftContest.id,
        title: 'Конкурс на YouTube',
        description: 'Розыгрыш призов среди подписчиков',
        platform_type: 'youtube',
        contest_status: 'active',
        platform_id: 'YT_' + uuidv4(),
        source_url: 'https://youtube.com/contest1',
        start_date: new Date(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // через неделю
        prizes_data: [
          { type: 'money', value: 1000, description: 'Денежный приз' },
          { type: 'item', value: 'iPhone', description: 'Смартфон' }
        ],
        rules_data: [
          'Подписаться на канал',
          'Поставить лайк',
          'Написать комментарий'
        ],
        requirements_data: [
          { type: 'age', value: 18, description: 'Возраст от 18 лет' },
          { type: 'location', value: 'RU', description: 'Только для России' }
        ],
        prize_value: 1000.00,
        tags_list: ['youtube', 'розыгрыш', 'призы']
      },
      {
        user_id: testUser.id,
        draft_id: draftContest.id,
        title: 'Конкурс в Instagram',
        description: 'Фотоконкурс для подписчиков',
        platform_type: 'instagram',
        contest_status: 'active',
        platform_id: 'IG_' + uuidv4(),
        source_url: 'https://instagram.com/contest1',
        start_date: new Date(),
        end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // через 2 недели
        prizes_data: [
          { type: 'item', value: 'Camera', description: 'Фотокамера' }
        ],
        rules_data: [
          'Подписаться на аккаунт',
          'Сделать репост',
          'Отметить друзей'
        ],
        requirements_data: [
          { type: 'followers', value: 100, description: 'Минимум 100 подписчиков' }
        ],
        prize_value: 500.00,
        tags_list: ['instagram', 'фото', 'конкурс']
      },
      {
        user_id: testUser.id,
        draft_id: draftContest.id,
        title: 'Конкурс ВКонтакте',
        description: 'Творческий конкурс',
        platform_type: 'vk',
        contest_status: 'completed',
        platform_id: 'VK_' + uuidv4(),
        source_url: 'https://vk.com/contest1',
        start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 недели назад
        end_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // неделю назад
        prizes_data: [
          { type: 'money', value: 500, description: 'Денежный приз' }
        ],
        rules_data: [
          'Быть участником группы',
          'Сделать репост',
          'Создать творческую работу'
        ],
        requirements_data: [
          { type: 'age', value: 16, description: 'Возраст от 16 лет' }
        ],
        prize_value: 500.00,
        tags_list: ['вконтакте', 'творчество', 'конкурс']
      }
    ]

    // Создаем конкурсы
    for (const contestData of testContests) {
      const existingContest = await Contest.findOne({
        where: { platform_id: contestData.platform_id }
      })

      if (!existingContest) {
        await Contest.create(contestData)
        console.log(`Создан конкурс: ${contestData.title}`)
      } else {
        console.log(`Конкурс ${contestData.title} уже существует`)
      }
    }

    console.log('Тестовые конкурсы успешно созданы')
  } catch (error) {
    console.error('Ошибка при создании тестовых конкурсов:', error)
    throw error
  }
}

module.exports = seedTestContests 