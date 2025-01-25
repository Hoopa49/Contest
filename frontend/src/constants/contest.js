/**
 * Константы для работы с конкурсами
 */

// Статусы требований конкурса
export const RequirementStatus = {
  PENDING: 'pending',    // Ожидает выполнения
  COMPLETED: 'completed', // Выполнено
  FAILED: 'failed',      // Не выполнено
  VERIFIED: 'verified'   // Проверено
}

/**
 * Статусы конкурса
 */
export const ContestStatus = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

/**
 * Получить текст статуса на русском
 */
export const getStatusText = (status) => {
  switch (status) {
    case ContestStatus.ACTIVE:
      return 'Активный'
    case ContestStatus.COMPLETED:
      return 'Завершен'
    case ContestStatus.CANCELLED:
      return 'Отменен'
    default:
      return 'Неизвестно'
  }
}

/**
 * Получить цвет для статуса
 */
export const getStatusColor = (status) => {
  switch (status) {
    case ContestStatus.ACTIVE:
      return 'success'
    case ContestStatus.COMPLETED:
      return 'info'
    case ContestStatus.CANCELLED:
      return 'error'
    default:
      return 'grey'
  }
}

/**
 * Получить иконку для статуса
 */
export const getStatusIcon = (status) => {
  switch (status) {
    case ContestStatus.ACTIVE:
      return 'mdi-play-circle'
    case ContestStatus.COMPLETED:
      return 'mdi-check-circle'
    case ContestStatus.CANCELLED:
      return 'mdi-close-circle'
    default:
      return 'mdi-help-circle'
  }
}

// Типы платформ
export const PlatformType = {
  YOUTUBE: 'youtube',
  INSTAGRAM: 'instagram',
  TELEGRAM: 'telegram',
  VK: 'vk'
}

// Статусы участия в конкурсе
export const ParticipationStatus = {
  NONE: 'none',           // Не участвует
  PENDING: 'pending',     // Заявка на рассмотрении
  APPROVED: 'approved',   // Участие подтверждено
  REJECTED: 'rejected',   // Заявка отклонена
  COMPLETED: 'completed', // Выполнил все требования
  WINNER: 'winner'        // Победитель
}

// Типы призов
export const PrizeType = {
  MAIN: 'main',       // Главный приз (денежный)
  PRODUCT: 'product', // Физический продукт
  SERVICE: 'service', // Услуга
  OTHER: 'other'      // Другое
} 