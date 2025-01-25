/**
 * Маршруты профиля пользователя
 * Конфигурация маршрутов для раздела профиля
 */

import { authGuard } from './guards'

export default [
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/profile/Profile.vue'),
    meta: { 
      title: 'Профиль',
      requiresAuth: true
    },
    beforeEnter: [authGuard],
    children: [
      {
        path: '',
        name: 'profile-overview',
        component: () => import('../views/profile/Overview.vue'),
        meta: { 
          title: 'Обзор профиля'
        }
      },
      {
        path: 'password',
        name: 'profile-security',
        component: () => import('../views/profile/Security.vue'),
        meta: { 
          title: 'Безопасность'
        }
      },
      {
        path: 'contests',
        name: 'profile-contests',
        component: () => import('../views/profile/Contests.vue'),
        meta: { 
          title: 'Мои конкурсы'
        }
      },
      {
        path: 'notifications',
        name: 'profile-notifications',
        component: () => import('../components/features/notifications/NotificationSettings.vue'),
        meta: { 
          title: 'Настройки уведомлений'
        }
      }
    ]
  }
] 