<template>
  <v-snackbar
    v-model="show"
    :color="notification.color"
    :timeout="notification.timeout"
    :location="notification.location"
    class="notification-snackbar"
  >
    <div class="d-flex align-center">
      <v-icon
        v-if="notification.icon"
        :icon="notification.icon"
        class="mr-2"
        size="20"
      ></v-icon>
      
      <div class="notification-content">
        <div v-if="notification.title" class="text-subtitle-2 font-weight-bold">
          {{ notification.title }}
        </div>
        <div>{{ notification.message }}</div>
      </div>

      <v-btn
        v-if="notification.action"
        class="ml-4"
        variant="text"
        size="small"
        @click="handleAction"
      >
        {{ notification.action.text }}
      </v-btn>
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

<script>
import { ref, watch } from 'vue'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'NotificationSnackbar',
  
  setup() {
    const notificationStore = useNotificationStore()
    const show = ref(false)
    const notification = ref({
      title: '',
      message: '',
      color: 'info',
      timeout: 5000,
      location: 'bottom',
      icon: null,
      action: null
    })

    // Слушаем новые уведомления
    watch(() => notificationStore.currentNotification, (newNotification) => {
      if (newNotification) {
        notification.value = {
          ...notification.value,
          ...newNotification
        }
        show.value = true
      }
    })

    // Следим за закрытием уведомления
    watch(show, (newValue) => {
      if (!newValue) {
        notificationStore.clearCurrentNotification()
      }
    })

    const handleAction = () => {
      if (notification.value.action && notification.value.action.handler) {
        notification.value.action.handler()
      }
      show.value = false
    }

    const closeNotification = () => {
      show.value = false
    }

    return {
      show,
      notification,
      handleAction,
      closeNotification
    }
  }
}
</script>

<style scoped>
.notification-snackbar {
  max-width: 400px;
}

.notification-content {
  flex: 1;
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