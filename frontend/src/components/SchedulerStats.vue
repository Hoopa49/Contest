<template>
  <v-container>
    <v-card class="mb-4">
      <v-card-title class="d-flex justify-space-between align-center">
        Статистика сборщика
        <v-btn icon @click="refreshStats">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-row>
          <!-- Основные метрики -->
          <v-col cols="12" md="4">
            <v-card outlined>
              <v-list>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Всего запусков</v-list-item-title>
                    <v-list-item-subtitle>{{ stats.totalRuns }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Успешных запусков</v-list-item-title>
                    <v-list-item-subtitle>{{ stats.successfulRuns }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Найдено конкурсов</v-list-item-title>
                    <v-list-item-subtitle>{{ stats.totalContests }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>

          <!-- График эффективности -->
          <v-col cols="12" md="8">
            <v-card outlined>
              <v-card-title>Эффективность поиска</v-card-title>
              <div class="pa-4">
                <canvas ref="efficiencyChart"></canvas>
              </div>
            </v-card>
          </v-col>

          <!-- График использования квоты -->
          <v-col cols="12" md="6">
            <v-card outlined>
              <v-card-title>Использование квоты API</v-card-title>
              <div class="pa-4">
                <canvas ref="quotaChart"></canvas>
              </div>
            </v-card>
          </v-col>

          <!-- График по ключевым словам -->
          <v-col cols="12" md="6">
            <v-card outlined>
              <v-card-title>Статистика по ключевым словам</v-card-title>
              <div class="pa-4">
                <canvas ref="keywordsChart"></canvas>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import Chart from 'chart.js/auto'
import api from '../services/backendApi'

export default {
  name: 'SchedulerStats',
  
  setup() {
    const loading = ref(false)
    const stats = ref({
      totalRuns: 0,
      successfulRuns: 0,
      totalContests: 0,
      efficiency: [],
      quotaUsage: [],
      keywordsStats: {}
    })
    
    const efficiencyChart = ref(null)
    const quotaChart = ref(null)
    const keywordsChart = ref(null)
    const charts = {}
    const toast = useToast()

    // Добавим вызов при монтировании
    onMounted(async () => {
      console.log('Component mounted')
      await refreshStats()
    })

    const refreshStats = async () => {
      loading.value = true;
      try {
        console.log('Запрос статистики...');
        const response = await api.get('/api/scheduler/stats');
        console.log('Получены данные:', response.data);
        
        if (!response.data) {
          throw new Error('Нет данных статистики');
        }

        stats.value = {
          totalRuns: response.data.totalRuns || 0,
          successfulRuns: response.data.successfulRuns || 0,
          totalContests: response.data.totalContests || 0,
          efficiency: response.data.efficiency || [],
          quotaUsage: response.data.quotaUsage || [],
          keywordsStats: response.data.keywordsStats || {}
        };

        await nextTick();
        updateCharts();
        
      } catch (error) {
        console.error('Ошибка при получении статистики:', error);
        toast.error('Ошибка при загрузке статистики');
      } finally {
        loading.value = false;
      }
    };

    const updateCharts = () => {
      // Уничтожаем старые графики
      Object.values(charts).forEach(chart => chart?.destroy());
      
      // График эффективности
      if (efficiencyChart.value) {
        charts.efficiency = new Chart(efficiencyChart.value, {
          type: 'line',
          data: {
            labels: stats.value.efficiency.map(e => e.date),
            datasets: [{
              label: 'Эффективность поиска',
              data: stats.value.efficiency.map(e => e.value),
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top'
              }
            }
          }
        });
      }

      // График использования квоты
      if (quotaChart.value) {
        charts.quota = new Chart(quotaChart.value, {
          type: 'line',
          data: {
            labels: stats.value.quotaUsage.map(q => q.date),
            datasets: [{
              label: 'Использование квоты',
              data: stats.value.quotaUsage.map(q => q.value),
              borderColor: 'rgb(54, 162, 235)',
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top'
              }
            }
          }
        });
      }
    };

    return {
      loading,
      stats,
      efficiencyChart,
      quotaChart,
      keywordsChart,
      refreshStats
    }
  }
}
</script> 