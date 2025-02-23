/**
 * Маршруты аутентификации
 */

export default [
  {
    path: '/auth/login',
    name: 'login',
    component: () => import('../views/auth/login/index.vue'),
    meta: { 
      title: 'Вход',
      guest: true
    }
  },
  {
    path: '/auth/register',
    name: 'register',
    component: () => import('../views/auth/register/index.vue'),
    meta: { 
      title: 'Регистрация',
      guest: true
    }
  },
  {
    path: '/auth/forgot-password',
    name: 'forgot-password',
    component: () => import('../views/auth/password/ResetPasswordForm.vue'),
    meta: { 
      title: 'Восстановление пароля',
      guest: true
    }
  },
  // Маршруты для социальных сетей
  {
    path: '/auth/telegram/callback',
    name: 'telegram-callback',
    component: () => import('../views/auth/social/TelegramCallback.vue'),
    meta: { 
      title: 'Авторизация через Telegram',
      guest: true
    }
  },
  // Здесь можно будет добавить другие социальные сети:
  // - Google
  // - VK
  // - Instagram
] 