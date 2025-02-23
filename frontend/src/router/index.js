/**
 * Основной файл маршрутизации
 * Конфигурация и инициализация Vue Router
 */

import { createRouter, createWebHistory } from 'vue-router'
import { authGuard, adminGuard, guestGuard, titleGuard } from './guards'
import profileRoutes from './profile.routes'
import authRoutes from './auth.routes'
import adminRoutes from './admin.routes'
import { useAuthStore } from '../stores/auth'

// Определение маршрутов
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/home/index.vue'),
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
  },
  {
    path: '/tracking',
    name: 'tracking',
    component: () => import('../views/tracking/index.vue'),
    meta: {
      title: 'Отслеживание',
      requiresAuth: true
    },
    beforeEnter: [authGuard]
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/about/index.vue'),
    meta: { 
      title: 'О проекте'
    }
  },
  // Маршруты для ошибок
  {
    path: '/error',
    name: 'error',
    component: () => import('../views/error/index.vue'),
    children: [
      {
        path: '404',
        name: 'not-found',
        component: () => import('../views/error/NotFound.vue'),
        meta: { 
          title: 'Страница не найдена'
        }
      }
    ]
  },
  // Маршруты аутентификации
  ...authRoutes.map(route => ({
    ...route,
    beforeEnter: [guestGuard]
  })),
  // Профильные маршруты
  ...profileRoutes,
  // Административные маршруты
  ...adminRoutes,
  // Перенаправление всех несуществующих маршрутов на 404
  {
    path: '/:catchAll(.*)*',
    name: 'not-found',
    component: () => import('../views/error/NotFound.vue'),
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