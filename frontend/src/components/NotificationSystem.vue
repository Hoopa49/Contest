<template>
  <div class="notification-system">
    <v-snackbar
      v-model="currentNotification.show"
      :color="currentNotification.type"
      :timeout="currentNotification.timeout"
      :multi-line="currentNotification.multiLine"
      top
      right
    >
      <div class="d-flex align-center">
        <v-icon 
          v-if="getIcon"
          :color="getIconColor"
          class="mr-2"
        >
          {{ getIcon }}
        </v-icon>
        
        <div>
          <div v-if="currentNotification.title" class="text-subtitle-1 font-weight-medium">
            {{ currentNotification.title }}
          </div>
          <div>{{ currentNotification.message }}</div>
        </div>
      </div>
      
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="dismissNotification"
        >
          Закрыть
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'NotificationSystem',
  
  setup() {
    const notificationQueue = ref([]);
    const currentNotification = ref({
      show: false,
      message: '',
      type: 'info',
      timeout: 5000,
      title: '',
      multiLine: false
    });

    const getIcon = computed(() => {
      switch (currentNotification.value.type) {
        case 'success': return 'mdi-check-circle';
        case 'error': return 'mdi-alert-circle';
        case 'warning': return 'mdi-alert';
        case 'info': return 'mdi-information';
        default: return null;
      }
    });

    const getIconColor = computed(() => {
      switch (currentNotification.value.type) {
        case 'success': return 'light-green';
        case 'error': return 'red';
        case 'warning': return 'amber';
        case 'info': return 'light-blue';
        default: return 'grey';
      }
    });

    const notify = (message, type = 'info', options = {}) => {
      const notification = {
        message,
        type,
        timeout: options.timeout || 5000,
        title: options.title || '',
        multiLine: options.multiLine || false
      };

      // Группировка похожих уведомлений
      const similarNotification = notificationQueue.value.find(
        n => n.message === message && n.type === type
      );

      if (!similarNotification) {
        notificationQueue.value.push(notification);
        if (!currentNotification.value.show) {
          showNextNotification();
        }
      }
    };

    const dismissNotification = () => {
      currentNotification.value.show = false;
      setTimeout(showNextNotification, 300);
    };

    const showNextNotification = () => {
      if (notificationQueue.value.length === 0) return;

      const notification = notificationQueue.value.shift();
      currentNotification.value = {
        ...notification,
        show: true
      };
    };

    // Слушаем изменение show для автоматического показа следующего уведомления
    watch(() => currentNotification.value.show, (newValue) => {
      if (!newValue) {
        setTimeout(showNextNotification, 300);
      }
    });

    return {
      currentNotification,
      getIcon,
      getIconColor,
      notify,
      dismissNotification
    };
  }
};
</script>

<style scoped>
.notification-system {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9999;
}
</style> 