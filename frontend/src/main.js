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
import { setupFontAwesome } from './plugins/fontawesome'

// Импортируем глобальные стили
import '@/styles/main.scss'

// Создаем приложение
const app = createApp(App)

// Подключаем плагины
app.use(router)
app.use(pinia)
app.use(vuetify)
app.use(errorHandler)
app.use(notification)

// Инициализируем Font Awesome
setupFontAwesome(app)

// Монтируем приложение
app.mount('#app')