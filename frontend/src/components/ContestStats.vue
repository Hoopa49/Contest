<template>
  <v-card class="contest-stats pa-4">
    <v-card-title class="d-flex justify-space-between align-center">
      Статистика конкурсов
      <div class="d-flex align-center">
        <v-btn-toggle v-model="period" class="mr-2">
          <v-btn small value="week">Неделя</v-btn>
          <v-btn small value="month">Месяц</v-btn>
          <v-btn small value="year">Год</v-btn>
        </v-btn-toggle>
        <v-btn icon @click="exportStats">
          <v-icon>mdi-download</v-icon>
        </v-btn>
        <v-btn icon @click="refreshStats" :loading="loading">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text>
      <v-row>
        <!-- Общая статистика -->
        <v-col cols="12" md="4">
          <v-card outlined>
            <v-card-text>
              <div class="text-h6 mb-2">Общая информация</div>
              <v-list dense>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Всего конкурсов</v-list-item-title>
                    <v-list-item-subtitle class="d-flex align-center">
                      {{ stats.totalContests }}
                      <v-chip
                        x-small
                        class="ml-2"
                        :color="contestsTrend > 0 ? 'success' : 'error'"
                      >
                        {{ contestsTrend > 0 ? '+' : '' }}{{ contestsTrend }}%
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Активных конкурсов</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-progress-linear
                        :value="activeContestsPercentage"
                        height="20"
                        color="primary"
                      >
                        <template v-slot:default>
                          {{ stats.activeContests }} ({{ activeContestsPercentage }}%)
                        </template>
                      </v-progress-linear>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Средний призовой фонд</v-list-item-title>
                    <v-list-item-subtitle>{{ formatCurrency(stats.averagePrize) }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- График распределения по времени -->
        <v-col cols="12" md="8">
          <v-card outlined>
            <v-card-text>
              <div class="d-flex justify-space-between align-center mb-2">
                <div class="text-h6">Распределение по времени</div>
                <v-btn-toggle v-model="timeMetric" small>
                  <v-btn value="daily">День</v-btn>
                  <v-btn value="weekly">Неделя</v-btn>
                  <v-btn value="monthly">Месяц</v-btn>
                </v-btn-toggle>
              </div>
              <canvas ref="timeChart"></canvas>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- График распределения призового фонда -->
        <v-col cols="12" md="6">
          <v-card outlined>
            <v-card-text>
              <div class="text-h6 mb-2">Распределение призового фонда</div>
              <canvas ref="prizeChart"></canvas>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Статистика по источникам -->
        <v-col cols="12" md="6">
          <v-card outlined>
            <v-card-text>
              <div class="text-h6 mb-2">Источники конкурсов</div>
              <canvas ref="sourceChart"></canvas>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import Chart from 'chart.js/auto';
import { useToast } from 'vue-toastification';
import api from '../services/backendApi';

export default {
  name: 'ContestStats',
  
  setup() {
    const toast = useToast();
    const loading = ref(false);
    const period = ref('week');
    const timeMetric = ref('daily');
    
    const stats = ref({
      totalContests: 0,
      activeContests: 0,
      averagePrize: 0,
      timeDistribution: [],
      sourceDistribution: {},
      prizeDistribution: []
    });

    // Графики
    const timeChart = ref(null);
    const sourceChart = ref(null);
    const prizeChart = ref(null);
    const charts = {};

    // Вычисляемые свойства
    const activeContestsPercentage = computed(() => {
      return Math.round((stats.value.activeContests / stats.value.totalContests) * 100) || 0;
    });

    const contestsTrend = computed(() => {
      // Расчет тренда на основе данных за выбранный период
      return 5; // Заглушка, нужно реализовать расчет
    });

    // Методы для работы с API
    const refreshStats = async () => {
      loading.value = true;
      try {
        const response = await api.get(`/api/contests/stats?period=${period.value}`);
        stats.value = response.data;
        updateCharts();
        toast.success('Статистика обновлена');
      } catch (error) {
        toast.error('Ошибка при получении статистики');
        console.error('Ошибка при получении статистики:', error);
      } finally {
        loading.value = false;
      }
    };

    const exportStats = async () => {
      try {
        const response = await api.get(`/api/contests/stats/export?period=${period.value}`, {
          responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.download = `contests-stats-${period.value}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        toast.success('Статистика экспортирована');
      } catch (error) {
        toast.error('Ошибка при экспорте статистики');
        console.error('Ошибка при экспорте статистики:', error);
      }
    };

    // Методы для работы с графиками
    const updateCharts = () => {
      // Уничтожаем старые графики
      Object.values(charts).forEach(chart => chart.destroy());
      
      // График распределения по времени
      charts.timeChart = new Chart(timeChart.value, {
        type: 'line',
        data: {
          labels: stats.value.timeDistribution.map(d => d.date),
          datasets: [{
            label: 'Количество конкурсов',
            data: stats.value.timeDistribution.map(d => d.count),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            fill: true
          }]
        },
        options: {
          responsive: true,
          animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
          },
          plugins: {
            legend: {
              position: 'top'
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          }
        }
      });

      // График распределения призового фонда
      charts.prizeChart = new Chart(prizeChart.value, {
        type: 'bar',
        data: {
          labels: stats.value.prizeDistribution.map(d => d.range),
          datasets: [{
            label: 'Количество конкурсов',
            data: stats.value.prizeDistribution.map(d => d.count),
            backgroundColor: 'rgb(54, 162, 235)'
          }]
        },
        options: {
          responsive: true,
          animation: {
            duration: 1000
          },
          plugins: {
            legend: {
              position: 'top'
            }
          }
        }
      });

      // График по источникам
      const sourceData = Object.entries(stats.value.sourceDistribution);
      charts.sourceChart = new Chart(sourceChart.value, {
        type: 'doughnut',
        data: {
          labels: sourceData.map(([source]) => source),
          datasets: [{
            data: sourceData.map(([, count]) => count),
            backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 206, 86)',
              'rgb(75, 192, 192)',
              'rgb(153, 102, 255)'
            ]
          }]
        },
        options: {
          responsive: true,
          animation: {
            duration: 1000
          },
          plugins: {
            legend: {
              position: 'right'
            }
          }
        }
      });
    };

    // Инициализация и отслеживание изменений
    onMounted(() => {
      refreshStats();
    });

    onUnmounted(() => {
      Object.values(charts).forEach(chart => chart.destroy());
    });

    watch([period, timeMetric], () => {
      refreshStats();
    });

    return {
      loading,
      period,
      timeMetric,
      stats,
      activeContestsPercentage,
      contestsTrend,
      timeChart,
      sourceChart,
      prizeChart,
      refreshStats,
      exportStats
    };
  }
};
</script>

<style scoped>
.contest-stats {
  max-width: 1200px;
  margin: 0 auto;
}

.v-card.outlined {
  height: 100%;
  transition: all 0.3s ease;
}

.v-card.outlined:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
</style> 