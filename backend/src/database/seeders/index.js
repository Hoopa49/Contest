/**
 * Основной файл для запуска всех сидов
 */

const seedTestUser = require('./user.seeder')
const seedTestContests = require('./contest.seeder')
const seedIntegrations = require('./integration.seeder')
const { log } = require('../../utils/logger')
const { LOG_MESSAGES } = require('../../constants/logs')

async function runSeeders() {
  try {
    log.info(LOG_MESSAGES.DATABASE.SEEDING_START)

    // Сначала создаем тестового пользователя
    log.info('Запуск сида пользователей')
    await seedTestUser()
    
    // Затем создаем тестовые конкурсы
    log.info('Запуск сида конкурсов')
    await seedTestContests()
    
    // Создаем тестовые данные интеграций
    log.info('Запуск сида интеграций')
    await seedIntegrations()
    
    log.info(LOG_MESSAGES.DATABASE.SEEDING_END)
  } catch (error) {
    log.error('Ошибка при выполнении сидов', {
      error: error.message,
      stack: error.stack
    })
    process.exit(1)
  }
}

// Запускаем сиды если файл вызван напрямую
if (require.main === module) {
  runSeeders()
}

module.exports = runSeeders 