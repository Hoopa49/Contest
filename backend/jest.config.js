/**
 * Jest Configuration
 * Конфигурация Jest для тестов
 */

module.exports = {
  // Корневая директория
  rootDir: '.',

  // Настройка путей для модулей
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1'
  },

  // Файл настройки окружения
  setupFiles: ['<rootDir>/jest.setup.js'],

  // Тестовое окружение
  testEnvironment: 'node',

  // Шаблоны для поиска тестов
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.js'
  ],

  // Настройки покрытия кода тестами
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/__tests__/**'
  ],

  // Игнорируемые пути
  testPathIgnorePatterns: [
    '/node_modules/'
  ],

  // Таймаут для тестов
  testTimeout: 10000
} 