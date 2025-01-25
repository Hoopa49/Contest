/**
 * Сид для создания тестового пользователя
 */

const bcrypt = require('bcryptjs')
const { User } = require('../../models')

async function seedTestUser() {
  try {
    // Проверяем, существует ли уже тестовый пользователь
    const existingUser = await User.findOne({
      where: { email: 'test@example.com' }
    })

    if (existingUser) {
      console.log('Тестовый пользователь уже существует')
      return
    }

    // Создаем тестового пользователя
    const password_hash = await bcrypt.hash('password123', 10)
    await User.create({
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      password_hash,
      role: 'user',
      is_active: true
    })

    console.log('Тестовый пользователь успешно создан')
  } catch (error) {
    console.error('Ошибка при создании тестового пользователя:', error)
    throw error
  }
}

module.exports = seedTestUser 