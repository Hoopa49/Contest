import { createApp } from 'vue';
import App from './App.vue';
import router from './router/route';
import { createPinia } from 'pinia';
import vuetify from './plugins/vuetify';
import Toast from './plugins/toast';


const pinia = createPinia();

// Добавляем router в pinia
pinia.use(({ store }) => {
  store.router = router;
});

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(vuetify);
app.use(Toast, {
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: true,
  closeButton: "button",
  icon: true,
  rtl: false
});

app.mount('#app');