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
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const roles = to.meta.roles;
  const authStore = useAuthStore();

  if (requiresAuth) {
    if (!authStore.isAuthenticated) {
      return next({ name: 'Login' });
    }

    // Получаем данные пользователя из токена, если ещё не получены
    if (!authStore.user) {
      await authStore.fetchUser();
    }

    if (roles && !roles.includes(authStore.user.role)) {
      return next({ name: 'Home' });
    }
  }
  next();
});

export default router;
