<template>
  <v-card class="scheduler-control pa-4">
    <notification-system ref="notifications" />
    
    <!-- Основная информация -->
    <v-card-title class="d-flex justify-space-between align-center">
      Управление сборщиком
      <v-chip :color="statusType" :icon="statusIcon">
        {{ statusMessage }}
      </v-chip>
    </v-card-title>
    
    <v-card-text>
      <!-- Панель быстрого доступа -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="3">
          <v-card outlined>
            <v-card-text class="text-center">
              <div class="text-h6">{{ progress.totalVideos }}</div>
              <div class="text-caption">Всего видео</div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card outlined>
            <v-card-text class="text-center">
              <div class="text-h6">{{ progress.processedVideos }}</div>
              <div class="text-caption">Обработано</div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card outlined>
            <v-card-text class="text-center">
              <div class="text-h6">{{ progress.foundContests }}</div>
              <div class="text-caption">Найдено конкурсов</div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card outlined>
            <v-card-text class="text-center">
              <div class="text-h6">{{ lastRunFormatted }}</div>
              <div class="text-caption">Последний запуск</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Прогресс -->
      <v-expand-transition>
        <div v-if="isRunning" class="mb-4">
          <v-progress-linear
            :value="progressPercentage"
            height="25"
            color="primary"
            striped
          >
            <template v-slot:default>
              <span class="white--text">
                {{ progressPercentage }}% ({{ progress.processedVideos }}/{{ progress.totalVideos }})
              </span>
            </template>
          </v-progress-linear>
        </div>
      </v-expand-transition>

      <!-- Кнопки управления -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6">
          <v-btn
            :color="isRunning ? 'error' : 'primary'"
            :loading="loading"
            :disabled="loading"
            @click="toggleScheduler"
            block
            height="50"
          >
            <v-icon left>{{ isRunning ? 'mdi-stop' : 'mdi-play' }}</v-icon>
            {{ isRunning ? 'Остановить' : 'Запустить' }}
          </v-btn>
        </v-col>
        
        <v-col cols="12" sm="6">
          <v-btn
            color="secondary"
            :disabled="isRunning"
            @click="fetchStatus"
            block
            height="50"
          >
            <v-icon left>mdi-refresh</v-icon>
            Обновить статус
          </v-btn>
        </v-col>
      </v-row>

      <!-- Компоненты управления -->
      <v-expansion-panels>
        <v-expansion-panel>
          <v-expansion-panel-header>
            <v-icon left>mdi-cog</v-icon>
            Настройки
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <scheduler-settings />
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-header>
            <v-icon left>mdi-chart-bar</v-icon>
            Статистика
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <scheduler-stats />
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-header>
            <v-icon left>mdi-text</v-icon>
            Лог
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <scheduler-log ref="log" />
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
          <v-expansion-panel-header>
            <v-icon left>mdi-history</v-icon>
            История
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <scheduler-history />
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- Кнопки управления -->
      <!-- <v-row class="mb-4">
        <v-col cols="12">
          <v-btn
            color="secondary"
            @click="$router.push('/scheduler')"
            block
            height="50"
          >
            <v-icon left>mdi-cog</v-icon>
            Настройки
          </v-btn>
        </v-col>
      </v-row> -->
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import api from '../services/backendApi';
import SchedulerSettings from './SchedulerSettings.vue';
import SchedulerHistory from './SchedulerHistory.vue';
import NotificationSystem from './NotificationSystem.vue';
import SchedulerLog from './SchedulerLog.vue';

export default {
  name: 'SchedulerControl',
  components: {
    SchedulerSettings,
    SchedulerHistory,
    NotificationSystem,
    SchedulerLog
  },

  setup() {
    const settings = ref({
      schedule: {
        enabled: false,
        frequency: 'daily',
        time: '00:00',
        days: []
      },
      filters: {
        excludedChannels: []
      }
    });

    const ws = ref(null);
    const isRunning = ref(false);
    const loading = ref(false);
    const lastRun = ref(null);
    const progress = ref({
      totalVideos: 0,
      processedVideos: 0,
      foundContests: 0,
      status: 'idle'
    });
    const notifications = ref(null);
    const log = ref(null);

    // Вычисляемые свойства
    const statusType = computed(() => {
      switch (progress.value.status) {
        case 'running': return 'info';
        case 'completed': return 'success';
        case 'error': return 'error';
        default: return 'warning';
      }
    });

    const statusIcon = computed(() => {
      switch (progress.value.status) {
        case 'running': return 'mdi-cog-sync';
        case 'completed': return 'mdi-check-circle';
        case 'error': return 'mdi-alert';
        default: return 'mdi-power-standby';
      }
    });

    const statusMessage = computed(() => {
      switch (progress.value.status) {
        case 'running': return 'Сборщик активен';
        case 'completed': return 'Сбор завершен';
        case 'error': return 'Произошла ошибка';
        default: return 'Сборщик неактивен';
      }
    });

    const lastRunFormatted = computed(() => {
      return lastRun.value 
        ? new Date(lastRun.value).toLocaleString('ru-RU')
        : 'Нет данных';
    });

    const progressPercentage = computed(() => {
      if (!progress.value.totalVideos) return 0;
      return Math.round((progress.value.processedVideos / progress.value.totalVideos) * 100);
    });

    // Методы
    const fetchStatus = async () => {
      try {
        const response = await api.get('/api/scheduler/status');
        isRunning.value = response.data.isRunning;
        lastRun.value = response.data.lastRunTime;
        progress.value = response.data.currentProgress;
        
        // Добавляем запись в лог при изменении статуса
        if (log.value) {
          log.value.addLogEntry(`Статус сборщика: ${statusMessage.value}`, statusType.value);
        }
      } catch (error) {
        console.error('Ошибка при получении статуса:', error);
        if (log.value) {
          log.value.addLogEntry(`Ошибка получения статуса: ${error.message}`, 'error');
        }
      }
    };

    const toggleScheduler = async () => {
      loading.value = true;
      try {
        if (!isRunning.value) {
          await api.post('/api/scheduler/start');
          if (log.value) {
            log.value.addLogEntry('Сборщик запущен', 'success');
          }
        } else {
          await api.post('/api/scheduler/stop');
          if (log.value) {
            log.value.addLogEntry('Сборщик остановлен', 'warning');
          }
        }
        await fetchStatus();
      } catch (error) {
        if (log.value) {
          log.value.addLogEntry(`Ошибка управления сборщиком: ${error.message}`, 'error');
        }
      } finally {
        loading.value = false;
      }
    };

    const connectWebSocket = () => {
      ws.value = new WebSocket('ws://localhost:3000');
      
      ws.value.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'PROGRESS_UPDATE') {
          progress.value = data.data;
          log.value.addLogEntry(`Обработано ${data.data.processedVideos} видео, найдено ${data.data.foundContests} конкурсов`);
          if (data.data.status === 'completed') {
            notifications.value.notify('Сбор данных успешно завершен', 'success');
            log.value.addLogEntry('Сбор данных завершен', 'success');
          } else if (data.data.status === 'error') {
            notifications.value.notify('Произошла ошибка при сборе данных', 'error');
            log.value.addLogEntry('Ошибка при сборе данных', 'error');
          }
        }
      };

      ws.value.onclose = () => {
        console.log('WebSocket соединение закрыто, переподключение...');
        notifications.value.notify('Потеряно соединение с сервером, переподключение...', 'warning');
        setTimeout(connectWebSocket, 1000);
      };

      ws.value.onerror = (error) => {
        console.error('Ошибка WebSocket:', error);
        ws.value.close(); // Закрываем соединение, onclose автоматически вызовет переподключение
      };
    };

    const loadControlSettings = async () => {
      try {
        const response = await api.get('/api/scheduler/settings');
        settings.value = {
          ...settings.value,
          ...response.data,
          schedule: {
            ...settings.value.schedule,
            ...response.data.schedule
          },
          filters: {
            ...settings.value.filters,
            excludedChannels: response.data.filters?.excludedChannels || []
          }
        };
      } catch (error) {
        console.error('Ошибка при загрузке настроек:', error);
      }
    };

    onMounted(() => {
      loadControlSettings();
      fetchStatus();
      connectWebSocket();
      // Обновляем статус каждые 5 секунд как запасной вариант
      const interval = setInterval(fetchStatus, 5000);
      
      // Очистка интервала при размонтировании
      onUnmounted(() => {
        clearInterval(interval);
      });
    });

    return {
      ws,
      isRunning,
      loading,
      lastRun,
      progress,
      notifications,
      log,
      settings,
      statusType,
      statusIcon,
      statusMessage,
      lastRunFormatted,
      progressPercentage,
      fetchStatus,
      toggleScheduler,
      loadControlSettings
    };
  }
};
</script>

<style scoped>
.scheduler-control {
  max-width: 1200px;
  margin: 0 auto;
}

.v-expansion-panel-header {
  font-weight: 500;
}

.v-card.outlined {
  transition: all 0.3s;
}

.v-card.outlined:hover {
  background-color: var(--v-primary-lighten5);
  transform: translateY(-2px);
}
</style> 