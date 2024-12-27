import { createApp } from 'vue';
import App from './App.vue';
import router from './router/route'; // тот самый файл, где маршруты

const app = createApp(App);
app.use(router); // используем роутер
app.mount('#app');