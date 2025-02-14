/**
 * Схемы данных для админ-панели
 */

/**
 * @typedef {Object} SystemStats
 * @property {number} totalUsers - Общее количество пользователей
 * @property {number} activeContests - Количество активных конкурсов
 * @property {number} newRegistrations - Количество новых регистраций за последние 24 часа
 * @property {number} userActivities - Количество успешных действий пользователей за последний час
 * @property {number} totalViews - Общее количество просмотров конкурсов
 * @property {number} totalParticipants - Общее количество участников конкурсов
 * @property {number} averageRating - Средний рейтинг конкурсов
 * @property {Object} analytics - Аналитические данные за последние 24 часа
 */

/**
 * @typedef {Object} UserAction
 * @property {string} id - Идентификатор действия
 * @property {string} type - Тип действия (user_login, user_register, contest_create, etc.)
 * @property {string} description - Описание действия
 * @property {Date} created_at - Дата и время действия
 * @property {Object} metadata - Дополнительные данные действия
 * @property {Object} user - Информация о пользователе
 * @property {string} user.id - Идентификатор пользователя
 * @property {string} user.email - Email пользователя
 * @property {string} user.first_name - Имя пользователя
 * @property {string} user.last_name - Фамилия пользователя
 */

/**
 * @typedef {Object} AdminUser
 * @property {string} id - Идентификатор пользователя
 * @property {string} email - Email пользователя
 * @property {string} first_name - Имя пользователя
 * @property {string} last_name - Фамилия пользователя
 * @property {string} role - Роль пользователя
 * @property {boolean} is_active - Статус активности пользователя
 * @property {Date} created_at - Дата создания пользователя
 */

/**
 * @typedef {Object} SystemSetting
 * @property {string} key - Ключ настройки
 * @property {string} value - Значение настройки
 * @property {string} [description] - Описание настройки
 * @property {string} [group] - Группа настроек
 */

/**
 * @typedef {Object} SystemLog
 * @property {string} id - Идентификатор лога
 * @property {string} type - Тип лога
 * @property {string} message - Сообщение лога
 * @property {Object} metadata - Дополнительные данные
 * @property {Date} created_at - Дата создания лога
 * @property {string} [level] - Уровень логирования
 * @property {string} [source] - Источник лога
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {number} total - Общее количество записей
 * @property {number} page - Текущая страница
 * @property {number} perPage - Количество записей на странице
 * @property {number} totalPages - Общее количество страниц
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Статус ответа
 * @property {*} data - Данные ответа
 * @property {string} [message] - Сообщение
 * @property {PaginationMeta} [meta] - Метаданные пагинации
 */

module.exports = {} 