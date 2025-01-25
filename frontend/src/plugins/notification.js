/**
 * Плагин для уведомлений
 * Добавляет глобальную шину событий для отображения уведомлений
 */

import { reactive } from 'vue'

// Состояние уведомлений
const state = reactive({
  notifications: new Map(),
  counter: 0
})

// Типы уведомлений
const NotificationTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

// Создание уведомления
const createNotification = (type, message, timeout = 5000) => {
  const id = state.counter++
  const notification = {
    id,
    type,
    message,
    timeout
  }
  
  state.notifications.set(id, notification)
  
  if (timeout > 0) {
    setTimeout(() => {
      removeNotification(id)
    }, timeout)
  }
  
  return id
}

// Удаление уведомления
const removeNotification = (id) => {
  state.notifications.delete(id)
}

// Методы для разных типов уведомлений
const notify = {
  success: (message, timeout) => createNotification(NotificationTypes.SUCCESS, message, timeout),
  error: (message, timeout) => createNotification(NotificationTypes.ERROR, message, timeout),
  warning: (message, timeout) => createNotification(NotificationTypes.WARNING, message, timeout),
  info: (message, timeout) => createNotification(NotificationTypes.INFO, message, timeout)
}

// Компонент для отображения уведомлений
const NotificationsComponent = {
  name: 'v-notifications',
  
  setup() {
    return {
      notifications: state.notifications
    }
  },
  
  template: `
    <div class="notifications">
      <v-snackbar
        v-for="notification in notifications"
        :key="notification.id"
        v-model="notification.show"
        :color="notification.type"
        :timeout="notification.timeout"
        location="top"
        @click="removeNotification(notification.id)"
      >
        {{ notification.message }}
        
        <template v-slot:actions>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="removeNotification(notification.id)"
          />
        </template>
      </v-snackbar>
    </div>
  `
}

// Плагин Vue
export default {
  install: (app) => {
    // Регистрируем глобальный компонент
    app.component('v-notifications', NotificationsComponent)
    
    // Добавляем методы в глобальные свойства
    app.config.globalProperties.$notify = notify
    
    // Добавляем методы в provide/inject
    app.provide('notify', notify)
  }
} 