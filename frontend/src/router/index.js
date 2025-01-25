/**
 * Основной файл маршрутизации
 * Конфигурация и инициализация Vue Router
 */

import { createRouter, createWebHistory } from 'vue-router'
import { authGuard, adminGuard, guestGuard, titleGuard } from './guards'
import profileRoutes from './profile.routes'
import { useAuthStore } from '../stores/auth'

// Определение маршрутов
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
    meta: { 
      title: 'Главная'
    }
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: () => import('../components/features/notifications/NotificationList.vue'),
    meta: { 
      title: 'Уведомления',
      requiresAuth: true
    },
    beforeEnter: [authGuard]
  },
  {
    path: '/contests',
    name: 'contests',
    component: () => import('../components/features/contests/list/ContestListContainer.vue'),
    meta: { 
      title: 'Конкурсы',
      requiresAuth: true
    },
    beforeEnter: [authGuard]
  },
  {
    path: '/contests/:id',
    name: 'contest-details',
    component: () => import('../components/features/contests/details/ContestDetails.vue'),
    meta: { 
      title: 'Детали конкурса',
      requiresAuth: true
    },
    beforeEnter: [authGuard]
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
    meta: { 
      title: 'О проекте'
    }
  },
  {
    path: '/auth/login',
    name: 'login',
    component: () => import('../views/auth/LoginForm.vue'),
    meta: { 
      title: 'Вход',
      guest: true
    },
    beforeEnter: [guestGuard]
  },
  {
    path: '/auth/register',
    name: 'register',
    component: () => import('../views/auth/Register.vue'),
    meta: { 
      title: 'Регистрация',
      guest: true
    },
    beforeEnter: [guestGuard]
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/admin/Dashboard.vue'),
    meta: { 
      title: 'Панель администратора',
      requiresAuth: true,
      requiresAdmin: true
    },
    beforeEnter: [authGuard, adminGuard],
    children: [
      {
        path: '',
        redirect: { name: 'admin-dashboard' }
      },
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('../views/admin/Analytics.vue'),
        meta: { tab: 'dashboard' }
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('../views/admin/UserManagement.vue'),
        meta: { tab: 'users' }
      },
      {
        path: 'integrations',
        name: 'admin-integrations',
        component: () => import('../views/admin/YouTubeManager.vue'),
        meta: { tab: 'integrations' }
      },
      {
        path: 'settings',
        name: 'admin-settings',
        component: () => import('../views/admin/ApiSettings.vue'),
        meta: { tab: 'settings' }
      },
      {
        path: 'logs',
        name: 'admin-logs',
        component: () => import('../views/admin/NotificationSettings.vue'),
        meta: { tab: 'logs' }
      }
    ]
  },
  {
    path: '/auth/telegram/callback',
    name: 'telegram-callback',
    component: () => import('../views/auth/TelegramCallback.vue'),
    meta: { 
      title: 'Авторизация через Telegram',
      guest: true
    },
    beforeEnter: [guestGuard]
  },
  // Профильные маршруты
  ...profileRoutes,
  // Маршрут для 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFound.vue'),
    meta: { 
      title: 'Страница не найдена'
    }
  }
]

// Создание экземпляра маршрутизатора
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Глобальные guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Ждем инициализации авторизации
  if (!authStore.isInitialized) {
    try {
      await authStore.init()
    } catch (error) {
      console.error('Ошибка инициализации:', error)
    }
  }

  // Проверка аутентификации для защищенных маршрутов
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }

  // Проверка прав администратора
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'home' })
    return
  }

  // Проверка гостевых маршрутов
  if (to.meta.guest && authStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }

  next()
})

// Guard для заголовков страниц
router.beforeEach(titleGuard)

export default router