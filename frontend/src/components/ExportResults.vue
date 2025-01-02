<template>
  <v-card class="export-results pa-4">
    <v-card-title>Экспорт результатов</v-card-title>
    
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6">
          <v-select
            v-model="exportType"
            :items="exportTypes"
            label="Формат экспорта"
          ></v-select>
        </v-col>
        
        <v-col cols="12" sm="6">
          <v-select
            v-model="dateRange"
            :items="dateRanges"
            label="Период"
          ></v-select>
        </v-col>
      </v-row>

      <v-checkbox
        v-model="includeAnalysis"
        label="Включить данные анализа"
      ></v-checkbox>

      <v-btn
        color="primary"
        :loading="loading"
        :disabled="loading"
        @click="exportData"
        block
        class="mt-4"
      >
        Экспортировать
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref } from 'vue';
import api from '../services/backendApi';
import { useToast } from 'vue-toastification';

export default {
  name: 'ExportResults',
  
  setup() {
    const toast = useToast();
    const loading = ref(false);
    const exportType = ref('csv');
    const dateRange = ref('all');
    const includeAnalysis = ref(true);

    const exportTypes = [
      { text: 'CSV файл', value: 'csv' },
      { text: 'Excel файл', value: 'excel' },
      { text: 'JSON файл', value: 'json' }
    ];

    const dateRanges = [
      { text: 'Все время', value: 'all' },
      { text: 'Последние 7 дней', value: '7days' },
      { text: 'Последние 30 дней', value: '30days' },
      { text: 'Последние 90 дней', value: '90days' }
    ];

    const exportData = async () => {
      loading.value = true;
      try {
        const response = await api.get('/api/export/contests', {
          params: {
            type: exportType.value,
            dateRange: dateRange.value,
            includeAnalysis: includeAnalysis.value
          },
          responseType: 'blob'
        });

        // Создаем ссылку для скачивания
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `contests_export_${new Date().toISOString()}.${exportType.value}`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        toast.success('Экспорт успешно выполнен');
      } catch (error) {
        console.error('Ошибка при экспорте:', error);
        toast.error('Ошибка при экспорте данных');
      } finally {
        loading.value = false;
      }
    };

    return {
      loading,
      exportType,
      dateRange,
      includeAnalysis,
      exportTypes,
      dateRanges,
      exportData
    };
  }
};
</script> 