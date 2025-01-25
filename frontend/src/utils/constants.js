/**
 * Константы приложения
 * Содержит общие константы и методы для работы с ними
 */

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    CURRENT_USER: '/auth/me'
  },
  CONTESTS: {
    LIST: '/contests',
    DETAILS: id => `/contests/${id}`,
    RECOMMENDED: '/contests/recommended',
    RATE: id => `/contests/${id}/rate`,
    REVIEW: id => `/contests/${id}/review`
  },
  USER: {
    PROFILE: '/user/profile',
    SETTINGS: '/user/settings'
  }
}

// Типы конкурсов
export const CONTEST_TYPES = {
  YOUTUBE: 'youtube',
  INSTAGRAM: 'instagram',
  TELEGRAM: 'telegram',
  VK: 'vk'
}

// Роли пользователей
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
}

// Статусы конкурса
export const CONTEST_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

// Получение цвета статуса
export const getStatusColor = (status) => {
  switch (status) {
    case CONTEST_STATUS.DRAFT:
      return 'grey'
    case CONTEST_STATUS.ACTIVE:
      return 'success'
    case CONTEST_STATUS.COMPLETED:
      return 'primary'
    case CONTEST_STATUS.CANCELLED:
      return 'error'
    default:
      return 'grey'
  }
}

// Получение текста статуса
export const getStatusText = (status) => {
  switch (status) {
    case CONTEST_STATUS.ACTIVE:
      return 'Активный'
    case CONTEST_STATUS.COMPLETED:
      return 'Завершен'
    case CONTEST_STATUS.CANCELLED:
      return 'Отменен'
    default:
      return 'Неизвестно'
  }
}

// Лимиты и ограничения
export const LIMITS = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 32,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif']
}

// Пагинация по умолчанию
export const DEFAULT_PAGINATION = {
  page: 1,
  perPage: 10,
  sortBy: 'createdAt',
  sortDesc: true
}
