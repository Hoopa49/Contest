import { adminGuard } from './guards'

export default [
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: { 
      requiresAuth: true,
      requiresAdmin: true,
      title: 'Панель управления'
    },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { 
          title: 'Панель управления',
          tab: 'dashboard'
        }
      },
      {
        path: 'analytics',
        name: 'admin-analytics',
        component: () => import('@/views/admin/Analytics.vue'),
        meta: { 
          title: 'Аналитика',
          tab: 'analytics'
        }
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/views/admin/UserManagement.vue'),
        meta: { 
          title: 'Управление пользователями',
          tab: 'users'
        }
      },
      {
        path: 'contests',
        name: 'admin-contests',
        component: () => import('@/views/admin/ContestModeration.vue'),
        meta: { 
          title: 'Модерация конкурсов',
          tab: 'contests'
        }
      },
      {
        path: 'integrations',
        name: 'admin-integrations',
        component: () => import('@/views/admin/PlatformIntegrations.vue'),
        meta: { 
          title: 'Интеграции с платформами',
          tab: 'integrations'
        }
      },
      {
        path: 'notifications',
        name: 'admin-notifications',
        component: () => import('@/views/admin/NotificationSettings.vue'),
        meta: { 
          title: 'Настройки уведомлений',
          tab: 'notifications'
        }
      },
      {
        path: 'system-settings',
        name: 'admin-system-settings',
        component: () => import('@/views/admin/SystemSettings.vue'),
        meta: { 
          title: 'Системные настройки',
          tab: 'system-settings'
        }
      },
      {
        path: 'ui-kit',
        name: 'admin-ui-kit',
        component: () => import('@/views/admin/ui-kit/index.vue'),
        meta: { 
          title: 'UI Kit',
          tab: 'ui-kit',
          requiresAuth: true,
          requiresAdmin: true
        }
      }
    ],
    beforeEnter: [adminGuard]
  }
] 