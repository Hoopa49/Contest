<!--
  Компонент для отображения уведомлений
  Поддерживает разные типы: success, error, warning, info
-->
<template>
  <transition name="toast">
    <v-snackbar
      v-model="isVisible"
      :color="toast.type"
      :timeout="toast.duration"
      location="top"
      class="toast-notification"
      :class="toast.type"
    >
      <div class="d-flex align-center">
        <v-icon
          :icon="getIcon"
          class="me-2"
          size="small"
        />
        {{ toast.message }}
      </div>
      
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="hideToast"
          size="small"
        >
          Закрыть
        </v-btn>
      </template>
    </v-snackbar>
  </transition>
</template>

<script>
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'ToastNotification',
  
  setup() {
    const notificationStore = useNotificationStore()
    
    const toast = computed(() => notificationStore.getToast)
    const isVisible = computed({
      get: () => toast.value.show,
      set: () => hideToast()
    })
    
    const getIcon = computed(() => {
      const icons = {
        success: 'mdi-check-circle',
        error: 'mdi-alert-circle',
        warning: 'mdi-alert',
        info: 'mdi-information'
      }
      return icons[toast.value.type] || icons.info
    })
    
    const hideToast = () => {
      notificationStore.hideToast()
    }
    
    return {
      toast,
      isVisible,
      getIcon,
      hideToast
    }
  }
}
</script>

<style scoped>
.toast-notification {
  border-radius: 8px;
  min-width: 300px;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateY(-30px);
  opacity: 0;
}

.toast-leave-to {
  transform: translateY(-30px);
  opacity: 0;
}

.success {
  background-color: rgb(var(--v-theme-success)) !important;
}

.error {
  background-color: rgb(var(--v-theme-error)) !important;
}

.warning {
  background-color: rgb(var(--v-theme-warning)) !important;
}

.info {
  background-color: rgb(var(--v-theme-info)) !important;
}
</style> 