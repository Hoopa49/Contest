// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from '../components/LoginForm.vue';
import RegisterForm from '../components/RegisterForm.vue';
import ContestList from '../components/ContestList.vue';
import VideoList from '../components/VideoList.vue';
import { useAuthStore } from '../stores/auth.js';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: ContestList,
    meta: { requiresAuth: true, roles: ['admin', 'user'] }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginForm
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterForm
  },
  {
    path: '/videos',
    name: 'Videos',
    component: VideoList,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/contests',
    name: 'Contests',
    component: ContestList,
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  // Другие маршруты
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Защита маршрутов, требующих авторизации
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  // Если есть токен, но нет данных пользователя, пробуем их получить
  if (isAuthenticated && !authStore.currentUser) {
    try {
      await authStore.fetchUser();
    } catch (error) {
      console.error('Error fetching user data:', error);
      // В случае ошибки очищаем авторизацию
      authStore.clearAuth();
    }
  }

  // Если маршрут требует авторизации
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      // Перенаправляем на страницу входа
      next({ name: 'Login', query: { redirect: to.fullPath } });
    } else {
      // Проверяем роль, если указана
      if (to.meta.role && authStore.currentUser?.role !== to.meta.role) {
        next({ name: 'Home' }); // или страница с ошибкой доступа
      } else {
        next();
      }
    }
  } else {
    // Если пользователь авторизован и пытается зайти на страницу входа/регистрации
    if (isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
      next({ name: 'Home' });
    } else {
      next();
    }
  }
});

export default router;
