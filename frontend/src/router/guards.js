/**
 * Навигационные guards для маршрутизации
 */

import { useAuthStore } from '@/stores/auth'

// Guard для проверки аутентификации
export const authGuard = (to, from, next) => {
  const auth = useAuthStore()
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!auth.isAuthenticated) {
      next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
}

// Guard для гостевых маршрутов
export const guestGuard = (to, from, next) => {
  const auth = useAuthStore()
  
  if (auth.isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
}

// Guard для админских маршрутов
export const adminGuard = (to, from, next) => {
  const auth = useAuthStore()
  
  if (!auth.isAdmin) {
    next({ name: 'home' })
  } else {
    next()
  }
}

// Guard для заголовков страниц
export const titleGuard = (to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} | Contest` : 'Contest'
  next()
} 