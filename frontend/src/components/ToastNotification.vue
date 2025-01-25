<!--
  Компонент для отображения уведомлений
  Поддерживает разные типы: success, error, warning, info
-->
<template>
  <v-snackbar
    v-model="isVisible"
    :color="toast.type"
    :timeout="toast.duration"
    location="top"
  >
    {{ toast.message }}
    
    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="hideToast"
      >
        Закрыть
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'

export default {
  name: 'ToastNotification',
  
  setup() {
    const notificationStore = useNotificationStore()
    
    const toast = computed(() => notificationStore.toast)
    const isVisible = computed({
      get: () => toast.value.show,
      set: () => hideToast()
    })
    
    const hideToast = () => {
      notificationStore.hideToast()
    }
    
    return {
      toast,
      isVisible,
      hideToast
    }
  }
}
</script> 