import { isAdmin } from '@/utils/auth'

export default [
  {
    path: '/admin',
    name: 'admin',
    component: () => import('@/views/admin/Dashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    beforeEnter: isAdmin,
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/Dashboard.vue')
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/views/admin/UserManagement.vue')
      },
      {
        path: 'contests',
        name: 'admin-contests',
        component: () => import('@/views/admin/ContestModeration.vue')
      },
      {
        path: 'integrations',
        name: 'admin-integrations',
        component: () => import('@/views/admin/PlatformIntegrations.vue')
      },
      {
        path: 'youtube',
        name: 'admin-youtube',
        component: () => import('@/views/admin/YouTubeManager.vue')
      },
      {
        path: 'notifications',
        name: 'admin-notifications',
        component: () => import('@/views/admin/NotificationSettings.vue')
      },
      {
        path: 'api-settings',
        name: 'admin-api-settings',
        component: () => import('@/views/admin/ApiSettings.vue')
      },
      {
        path: 'system-settings',
        name: 'admin-system-settings',
        component: () => import('@/views/admin/SystemSettings.vue')
      },
      {
        path: 'analytics',
        name: 'admin-analytics',
        component: () => import('@/views/admin/Analytics.vue')
      }
    ]
  }
] 