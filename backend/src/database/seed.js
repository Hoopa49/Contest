/**
 * Запуск сидов базы данных
 */

const seedTestUser = require('./seeders/user.seeder')

async function runSeeders() {
  try {
    console.log('Запуск сидов...')
    
    // Запускаем сиды
    await seedTestUser()
    
    console.log('Сиды успешно выполнены')
    process.exit(0)
  } catch (error) {
    console.error('Ошибка при выполнении сидов:', error)
    process.exit(1)
  }
}

runSeeders() 