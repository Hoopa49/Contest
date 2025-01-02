import { createApp } from 'vue';
import App from './App.vue';
import router from './router/route';
import { createPinia } from 'pinia';
import vuetify from './plugins/vuetify';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import SchedulerControl from './components/SchedulerControl.vue';
import Chart from 'chart.js/auto';


const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(Toast, {
  position: 'top-right',
  timeout: 3000
})

app.mount('#app')