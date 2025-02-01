/**
 * Конфигурация навигации приложения
 */

// Основное меню
export const mainMenuItems = [
  {
    title: 'Главная',
    icon: 'mdi-home',
    to: { name: 'Home' }
  },
  {
    title: 'Конкурсы',
    icon: 'mdi-trophy',
    to: { name: 'Contests' }
  }
]

// Меню профиля
export const profileMenuItems = [
  {
    title: 'Профиль',
    icon: 'mdi-account',
    to: { name: 'profile' }
  },
  {
    title: 'Мои конкурсы',
    icon: 'mdi-trophy',
    to: { name: 'profile-contests' }
  },
  {
    title: 'Статистика',
    icon: 'mdi-chart-bar',
    to: { name: 'profile-overview' }
  },
  {
    title: 'Безопасность',
    icon: 'mdi-shield-lock',
    to: { name: 'security-settings' }
  },
  {
    title: 'Подписка',
    icon: 'mdi-crown',
    to: { name: 'profile-overview' }
  },
  {
    title: 'Уведомления',
    icon: 'mdi-bell',
    to: { name: 'notification-settings' }
  }
]

// Меню администратора
export const adminMenuItems = [
  {
    title: 'Админ панель',
    icon: 'mdi-shield-crown',
    to: { name: 'admin-dashboard' }
  }
] 