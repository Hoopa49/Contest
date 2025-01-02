<template>
  <v-card class="scheduler-log">
    <v-card-title class="d-flex justify-space-between align-center">
      Лог действий
      <div>
        <v-btn-toggle v-model="selectedType" class="mr-2">
          <v-btn 
            v-for="type in logTypes" 
            :key="type.value"
            :value="type.value"
            small
          >
            {{ type.text }}
          </v-btn>
        </v-btn-toggle>
        
        <v-btn icon @click="exportLog" class="mr-2">
          <v-icon>mdi-download</v-icon>
        </v-btn>
        
        <v-btn icon @click="clearLog">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </v-card-title>
    
    <v-card-text>
      <v-list dense class="log-list" ref="logList">
        <v-list-item 
          v-for="(entry, index) in filteredEntries" 
          :key="index"
          :class="getLogClass(entry.type)"
        >
          <v-list-item-content>
            <v-list-item-subtitle>
              <span class="font-weight-medium">{{ formatTime(entry.timestamp) }}</span>
              <span :class="`${entry.type}--text ml-2`">[{{ entry.type.toUpperCase() }}]</span>
              <span class="ml-2">{{ entry.message }}</span>
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue';
import { useToast } from 'vue-toastification';

export default {
  name: 'SchedulerLog',
  
  setup() {
    const toast = useToast();
    const logEntries = ref([]);
    const logList = ref(null);
    const selectedType = ref('all');
    const maxEntries = 100;

    const logTypes = [
      { text: 'Все', value: 'all' },
      { text: 'Инфо', value: 'info' },
      { text: 'Успех', value: 'success' },
      { text: 'Ошибки', value: 'error' },
      { text: 'Предупреждения', value: 'warning' }
    ];

    const filteredEntries = computed(() => {
      if (selectedType.value === 'all') return logEntries.value;
      return logEntries.value.filter(entry => entry.type === selectedType.value);
    });

    const addLogEntry = async (message, type = 'info') => {
      logEntries.value.unshift({
        timestamp: new Date(),
        message,
        type
      });

      if (logEntries.value.length > maxEntries) {
        logEntries.value = logEntries.value.slice(0, maxEntries);
      }

      // Автоскролл к последней записи
      await nextTick();
      if (logList.value) {
        logList.value.scrollTop = 0;
      }
    };

    const clearLog = () => {
      logEntries.value = [];
      toast.info('Лог очищен');
    };

    const exportLog = () => {
      const logText = logEntries.value
        .map(entry => `[${formatTime(entry.timestamp)}][${entry.type.toUpperCase()}] ${entry.message}`)
        .join('\n');

      const blob = new Blob([logText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scheduler-log-${new Date().toISOString().slice(0,10)}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Лог успешно экспортирован');
    };

    const formatTime = (date) => {
      return new Date(date).toLocaleTimeString('ru-RU');
    };

    const getLogClass = (type) => {
      return `log-entry-${type}`;
    };

    // Следим за изменениями в логе
    watch(logEntries, (newEntries) => {
      if (newEntries.length > 0 && newEntries[0].type === 'error') {
        toast.error('Новая ошибка в логе');
      }
    });

    return {
      logEntries,
      logList,
      logTypes,
      selectedType,
      filteredEntries,
      addLogEntry,
      clearLog,
      exportLog,
      formatTime,
      getLogClass
    };
  }
};
</script>

<style scoped>
.log-list {
  max-height: 400px;
  overflow-y: auto;
}

.log-entry-error {
  background-color: rgba(var(--v-error-base), 0.1);
}

.log-entry-warning {
  background-color: rgba(var(--v-warning-base), 0.1);
}

.log-entry-success {
  background-color: rgba(var(--v-success-base), 0.1);
}
</style> 