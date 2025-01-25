// Список возможных статусов конкурса
export const CONTEST_STATUSES = {
  DRAFT: 'draft',
  ANNOUNCED: 'announced',
  REGISTRATION: 'registration',
  IN_PROGRESS: 'in_progress',
  JUDGING: 'judging',
  FINISHED: 'finished',
  CANCELLED: 'cancelled'
}

// Информация о статусах
const statusesInfo = {
  [CONTEST_STATUSES.DRAFT]: {
    text: 'Черновик',
    color: 'grey',
    icon: 'mdi-file-outline'
  },
  [CONTEST_STATUSES.ANNOUNCED]: {
    text: 'Анонсирован',
    color: 'info',
    icon: 'mdi-bullhorn'
  },
  [CONTEST_STATUSES.REGISTRATION]: {
    text: 'Регистрация',
    color: 'primary',
    icon: 'mdi-account-plus'
  },
  [CONTEST_STATUSES.IN_PROGRESS]: {
    text: 'Проводится',
    color: 'success',
    icon: 'mdi-play-circle'
  },
  [CONTEST_STATUSES.JUDGING]: {
    text: 'Оценивается',
    color: 'warning',
    icon: 'mdi-gavel'
  },
  [CONTEST_STATUSES.FINISHED]: {
    text: 'Завершен',
    color: 'secondary',
    icon: 'mdi-flag-checkered'
  },
  [CONTEST_STATUSES.CANCELLED]: {
    text: 'Отменен',
    color: 'error',
    icon: 'mdi-close-circle'
  }
}

/**
 * Получить информацию о статусе конкурса
 * @param {string} status - Код статуса
 * @returns {Object} Объект с информацией о статусе
 */
export const getStatusInfo = (status) => {
  return statusesInfo[status] || {
    text: 'Неизвестный статус',
    color: 'grey',
    icon: 'mdi-help-circle'
  }
}

/**
 * Получить список всех статусов с информацией
 * @returns {Array} Массив объектов с информацией о статусах
 */
export const getAllStatuses = () => {
  return Object.entries(CONTEST_STATUSES).map(([key, value]) => ({
    value,
    ...getStatusInfo(value)
  }))
}

/**
 * Проверить, является ли статус активным (конкурс проводится)
 * @param {string} status - Код статуса
 * @returns {boolean}
 */
export const isActiveStatus = (status) => {
  return [
    CONTEST_STATUSES.REGISTRATION,
    CONTEST_STATUSES.IN_PROGRESS,
    CONTEST_STATUSES.JUDGING
  ].includes(status)
}

/**
 * Проверить, является ли статус завершающим
 * @param {string} status - Код статуса
 * @returns {boolean}
 */
export const isFinishedStatus = (status) => {
  return [
    CONTEST_STATUSES.FINISHED,
    CONTEST_STATUSES.CANCELLED
  ].includes(status)
}

/**
 * Получить следующий статус в жизненном цикле конкурса
 * @param {string} currentStatus - Текущий статус
 * @returns {string|null} Следующий статус или null, если текущий статус последний
 */
export const getNextStatus = (currentStatus) => {
  const statusFlow = [
    CONTEST_STATUSES.DRAFT,
    CONTEST_STATUSES.ANNOUNCED,
    CONTEST_STATUSES.REGISTRATION,
    CONTEST_STATUSES.IN_PROGRESS,
    CONTEST_STATUSES.JUDGING,
    CONTEST_STATUSES.FINISHED
  ]
  
  const currentIndex = statusFlow.indexOf(currentStatus)
  if (currentIndex === -1 || currentIndex === statusFlow.length - 1) {
    return null
  }
  
  return statusFlow[currentIndex + 1]
} 