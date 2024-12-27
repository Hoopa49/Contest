import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from '../components/LoginForm.vue';
import ContestList from '../components/ContestList.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: ContestList
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginForm
  },
  // Можно добавить ещё маршруты, например:
  // { path: '/contest/:id', name: 'ContestDetail', component: ContestDetail }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
