/**
 * Утилиты для форматирования данных
 */

// Форматирование даты
export const formatDate = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

// Форматирование относительной даты
export const formatRelativeDate = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'только что'
  if (minutes < 60) return `${minutes} ${pluralize(minutes, 'минуту', 'минуты', 'минут')} назад`
  if (hours < 24) return `${hours} ${pluralize(hours, 'час', 'часа', 'часов')} назад`
  if (days < 7) return `${days} ${pluralize(days, 'день', 'дня', 'дней')} назад`

  return formatDate(date)
}

/**
 * Склонение существительных
 * @param {number} number - Число
 * @param {string} one - Форма для 1
 * @param {string} few - Форма для 2-4
 * @param {string} many - Форма для 5-20
 * @returns {string} Правильная форма слова
 */
const pluralize = (number, one, few, many) => {
  const mod10 = number % 10
  const mod100 = number % 100

  if (mod10 === 1 && mod100 !== 11) {
    return one
  }
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) {
    return few
  }
  return many
}

// Форматирование времени
export const formatTime = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

// Форматирование даты и времени
export const formatDateTime = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

// Форматирование числа с разделителями
export const formatNumber = (num) => {
  if (!num) return '0'
  return new Intl.NumberFormat('ru-RU').format(num)
}

// Форматирование денежной суммы
export const formatCurrency = (amount, currency = 'RUB') => {
  if (typeof amount !== 'number') return ''
  
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency
  }).format(amount)
}

export const formatPrize = (value) => {
  if (!value) return '0 ₽'
  return `${formatNumber(value)} ₽`
}

export const formatPrizeValue = (value) => {
  if (value === undefined || value === null) return '—'
  if (typeof value === 'string') return value
  return `${formatNumber(value)} ₽`
}

export const truncateText = (text, length = 100) => {
  if (!text) return ''
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Форматирование длительности видео
 * @param {string} duration - Длительность в формате ISO 8601
 * @returns {string} Отформатированная длительность
 */
export const formatDuration = (duration) => {
  if (!duration) return '0:00'

  // Преобразование ISO 8601 в секунды
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  if (!match) return '0:00'

  const hours = (match[1] ? parseInt(match[1]) : 0)
  const minutes = (match[2] ? parseInt(match[2]) : 0)
  const seconds = (match[3] ? parseInt(match[3]) : 0)

  // Форматирование
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Форматирование размера файла
 * @param {number} bytes - Размер в байтах
 * @returns {string} Отформатированный размер
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

/**
 * Форматирование процента
 * @param {number} value - Значение от 0 до 1
 * @returns {string} Отформатированный процент
 */
export const formatPercent = (value) => {
  if (typeof value !== 'number') return '0%'
  return `${(value * 100).toFixed(1)}%`
} 
