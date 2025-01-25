/**
 * Главный файл приложения
 * Инициализация Vue и подключение плагинов
 */

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import vuetify from './plugins/vuetify'
import errorHandler from './plugins/errorHandler'
import notification from './plugins/notification'

// Создаем приложение
const app = createApp(App)

// Подключаем плагины
app.use(router)
app.use(pinia)
app.use(vuetify)
app.use(errorHandler)
app.use(notification)

// Монтируем приложение
app.mount('#app')