import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

/**
 * Форматирование даты
 * @param {string|Date} date - Дата для форматирования
 * @param {string} formatStr - Строка формата (по умолчанию 'dd.MM.yyyy HH:mm')
 * @returns {string} Отформатированная дата
 */
export const formatDate = (date, formatStr = 'dd.MM.yyyy HH:mm') => {
  if (!date) return ''
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return format(parsedDate, formatStr, { locale: ru })
}

/**
 * Получение диапазона дат
 * @param {string} range - Диапазон (day, week, month, year)
 * @returns {Object} Объект с начальной и конечной датой
 */
export const getDateRange = (range) => {
  const end = new Date()
  const start = new Date()

  switch (range) {
    case 'day':
      start.setDate(start.getDate() - 1)
      break
    case 'week':
      start.setDate(start.getDate() - 7)
      break
    case 'month':
      start.setMonth(start.getMonth() - 1)
      break
    case 'year':
      start.setFullYear(start.getFullYear() - 1)
      break
    default:
      start.setDate(start.getDate() - 7)
  }

  return {
    startDate: start,
    endDate: end
  }
} 