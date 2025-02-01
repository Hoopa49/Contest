/**
 * Основной файл для запуска всех сидов
 */

const seedTestUser = require('./user.seeder')
const seedTestContests = require('./contest.seeder')
const seedIntegrations = require('./integration.seeder')
const seedIntegrationActivities = require('./integration_activities.seeder')
const { logger } = require('../../logging')

async function runSeeders() {
  try {
    logger.info('Начало заполнения базы данных тестовыми данными')

    // Сначала создаем тестового пользователя
    logger.info('Запуск сида пользователей')
    await seedTestUser()
    
    // Затем создаем тестовые конкурсы
    logger.info('Запуск сида конкурсов')
    await seedTestContests()
    
    // Создаем тестовые данные интеграций
    logger.info('Запуск сида интеграций')
    await seedIntegrations()
    
    // Создаем тестовые данные активности интеграций
    logger.info('Запуск сида активности интеграций')
    await seedIntegrationActivities()
    
    logger.info('Заполнение базы данных завершено')
  } catch (error) {
    logger.error('Ошибка при выполнении сидов', {
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