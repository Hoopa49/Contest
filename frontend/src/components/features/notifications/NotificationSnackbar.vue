<template>
  <v-snackbar
    v-model="show"
    :color="notification.type"
    :timeout="notification.timeout"
    location="top"
  >
    <div class="d-flex align-center">
      <v-icon
        v-if="getIcon(notification.type)"
        :icon="getIcon(notification.type)"
        class="mr-2"
        size="20"
      ></v-icon>
      
      <div class="notification-content">
        {{ notification.message }}
      </div>
    </div>

    <template v-slot:actions>
      <v-btn
        variant="text"
        icon="mdi-close"
        @click="closeNotification"
      ></v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()
const show = ref(false)
const notification = ref({
  type: 'info',
  message: '',
  timeout: 5000
})

// Слушаем новые уведомления
watch(() => notificationStore.items[0], (newNotification) => {
  if (newNotification && !newNotification.read) {
    notification.value = {
      type: newNotification.type || 'info',
      message: newNotification.message || '',
      timeout: newNotification.timeout || 5000,
      id: newNotification.id
    }
    show.value = true
  }
})

// Следим за закрытием уведомления
watch(show, (newValue) => {
  if (!newValue && notification.value?.id) {
    const index = notificationStore.items.findIndex(n => n.id === notification.value.id)
    if (index !== -1) {
      notificationStore.items[index].read = true
      notificationStore.unreadCount = Math.max(0, notificationStore.unreadCount - 1)
    }
  }
})

const getIcon = (type) => {
  switch (type) {
    case 'success': return 'mdi-check-circle'
    case 'error': return 'mdi-alert-circle'
    case 'warning': return 'mdi-alert'
    case 'info': return 'mdi-information'
    default: return null
  }
}

const closeNotification = () => {
  show.value = false
}
</script>

<style scoped>
.notification-content {
  flex: 1;
}

.v-snackbar {
  max-width: 400px;
}

/* Анимации */
.v-snackbar-enter-active,
.v-snackbar-leave-active {
  transition: transform 0.3s ease-out;
}

.v-snackbar-enter-from {
  transform: translateY(100%);
}

.v-snackbar-leave-to {
  transform: translateY(100%);
}
</style> 