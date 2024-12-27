import { createApp } from 'vue';
import App from './App.vue';
import router from './router/route';
import { createPinia } from 'pinia';
import vuetify from './plugins/vuetify';
import Toast from './plugins/toast';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(vuetify);
app.use(Toast, {
  // Опции по умолчанию
  timeout: 3000,
  position: 'top-right'
});
app.mount('#app');