<template>
  <v-card class="scheduler-history pa-4">
    <v-card-title class="d-flex justify-space-between align-center">
      История запусков
      <v-btn icon @click="fetchHistory">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>
    
    <v-data-table
      :headers="headers"
      :items="history"
      :loading="loading"
      :items-per-page="10"
      class="elevation-1"
    >
      <template v-slot:headers="{ columns }">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :class="['text-center', column.value === 'id' ? 'text-start' : '']"
          >
            {{ column.title }}
          </th>
        </tr>
      </template>

      <template v-slot:item.status="{ item }">
        <v-chip :color="getStatusColor(item.status)" small>
          {{ getStatusText(item.status) }}
        </v-chip>
      </template>

      <template v-slot:item.startTime="{ item }">
        {{ formatDate(item.startTime) }}
      </template>

      <template v-slot:item.duration="{ item }">
        {{ calculateDuration(item) }}
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn icon small @click="showDetails(item)">
          <v-icon>mdi-information</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Диалог с деталями -->
    <v-dialog v-model="showDialog" max-width="600px">
      <v-card v-if="selectedRun">
        <v-card-title>Детали запуска</v-card-title>
        <v-card-text>
          <v-list dense>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Статус</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip :color="getStatusColor(selectedRun.status)" small>
                    {{ getStatusText(selectedRun.status) }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Время запуска</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(selectedRun.startTime) }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Обработано видео</v-list-item-title>
                <v-list-item-subtitle>
                  {{ selectedRun.processedVideos }} из {{ selectedRun.totalVideos }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Найдено конкурсов</v-list-item-title>
                <v-list-item-subtitle>
                  {{ selectedRun.foundContests }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>API запросы</v-list-item-title>
                <v-list-item-subtitle>
                  {{ selectedRun.apiRequests }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>Использовано квоты</v-list-item-title>
                <v-list-item-subtitle>
                  {{ selectedRun.quotaUsed }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>

            <v-list-item v-if="selectedRun.error">
              <v-list-item-content>
                <v-list-item-title class="error--text">Ошибка</v-list-item-title>
                <v-list-item-subtitle class="error--text">
                  {{ selectedRun.error }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { ref, onMounted } from 'vue';
import api from '../services/backendApi';

export default {
  name: 'SchedulerHistory',

  setup() {
    const loading = ref(false);
    const history = ref([]);
    const showDialog = ref(false);
    const selectedRun = ref(null);

    const headers = ref([
      { title: 'ID', key: 'id', sortable: true },
      { title: 'Статус', key: 'status', sortable: true },
      { title: 'Время запуска', key: 'startTime', sortable: true },
      { title: 'Длительность', key: 'duration', sortable: true },
      { title: 'API запросы', key: 'apiRequests', sortable: true },
      { title: 'Квота', key: 'quotaUsed', sortable: true },
      { title: 'Обработано', key: 'processedVideos', sortable: true },
      { title: 'Конкурсов', key: 'foundContests', sortable: true },
      { title: 'Действия', key: 'actions', sortable: false }
    ]);

    const fetchHistory = async () => {
      loading.value = true;
      try {
        const response = await api.get('/api/scheduler/history');
        history.value = response.data;
      } catch (error) {
        console.error('Ошибка при получении истории:', error);
      } finally {
        loading.value = false;
      }
    };

    const showDetails = (run) => {
      selectedRun.value = run;
      showDialog.value = true;
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'running': return 'info';
        case 'completed': return 'success';
        case 'error': return 'error';
        case 'stopped': return 'warning';
        default: return 'grey';
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case 'running': return 'Запущен';
        case 'completed': return 'Завершен';
        case 'error': return 'Ошибка';
        case 'stopped': return 'Остановлен';
        default: return 'Неизвестно';
      }
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleString('ru-RU');
    };

    const calculateDuration = (run) => {
      if (!run.startTime || !run.endTime) return '-';
      const start = new Date(run.startTime);
      const end = new Date(run.endTime);
      const diff = end - start;
      const minutes = Math.floor(diff / 60000);
      const seconds = ((diff % 60000) / 1000).toFixed(0);
      return `${minutes}м ${seconds}с`;
    };

    onMounted(fetchHistory);

    return {
      headers,
      history,
      loading,
      showDialog,
      selectedRun,
      fetchHistory,
      showDetails,
      getStatusColor,
      getStatusText,
      formatDate,
      calculateDuration
    };
  }
};
</script> 