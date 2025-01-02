<template>
  <v-card class="quota-stats pa-4">
    <v-card-title class="d-flex justify-space-between align-center">
      Статистика использования квоты
      <div class="d-flex align-center">
        <v-btn-toggle v-model="timeRange" class="mr-2">
          <v-btn small value="6h">6 часов</v-btn>
          <v-btn small value="12h">12 часов</v-btn>
          <v-btn small value="24h">24 часа</v-btn>
        </v-btn-toggle>
        <v-btn icon @click="exportQuotaStats">
          <v-icon>mdi-download</v-icon>
        </v-btn>
        <v-btn icon @click="refreshStats" :loading="loading">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
    </v-card-title>
    
    <v-card-text>
      <v-row>
        <!-- Текущее состояние квоты -->
        <v-col cols="12" md="6">
          <v-card outlined>
            <v-card-title>Текущее состояние</v-card-title>
            <v-card-text>
              <v-progress-circular
                :rotate="-90"
                :size="120"
                :width="15"
                :value="quotaPercentage"
                :color="quotaColor"
                class="mb-4"
              >
                {{ quotaPercentage }}%
              </v-progress-circular>
              
              <div class="text-subtitle-1 mb-2">
                Использовано: {{ usedQuota }} из {{ quotaLimit }} единиц
              </div>
              
              <v-alert
                v-if="quotaWarning"
                :type="quotaWarning.type"
                dense
                class="mb-0"
              >
                {{ quotaWarning.message }}
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- График использования -->
        <v-col cols="12" md="6">
          <v-card outlined>
            <v-card-title>Динамика использования</v-card-title>
            <div class="pa-4">
              <canvas ref="quotaChart"></canvas>
            </div>
          </v-card>
        </v-col>

        <!-- Статистика по операциям -->
        <v-col cols="12" md="6">
          <v-card outlined>
            <v-card-title class="d-flex justify-space-between align-center">
              Распределение по операциям
              <v-btn-toggle v-model="operationView" small>
                <v-btn value="count">Количество</v-btn>
                <v-btn value="cost">Стоимость</v-btn>
              </v-btn-toggle>
            </v-card-title>
            <v-list dense>
              <v-list-item v-for="(cost, operation) in operationCosts" :key="operation">
                <v-list-item-content>
                  <v-list-item-title>{{ formatOperation(operation) }}</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-progress-linear
                      :value="getOperationPercentage(operation)"
                      height="20"
                      :color="getOperationColor(operation)"
                    >
                      <template v-slot:default>
                        {{ operationStats[operation] || 0 }} 
                        {{ operationView === 'count' ? 'запросов' : 'единиц' }}
                      </template>
                    </v-progress-linear>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- Прогноз использования -->
        <v-col cols="12" md="6">
          <v-card outlined>
            <v-card-title>Прогноз использования</v-card-title>
            <v-card-text>
              <v-list dense>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Среднее в час</v-list-item-title>
                    <v-list-item-subtitle>{{ averagePerHour }} единиц</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>Прогноз на день</v-list-item-title>
                    <v-list-item-subtitle class="d-flex align-center">
                      {{ dailyForecast }} единиц
                      <v-chip
                        x-small
                        class="ml-2"
                        :color="dailyForecast > quotaLimit ? 'error' : 'success'"
                      >
                        {{ dailyForecast > quotaLimit ? 'Превышение' : 'В норме' }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import { Chart } from 'chart.js/auto';
import api from '../services/backendApi';

export default {
  name: 'QuotaStats',
  
  setup() {
    const quotaChart = ref(null);
    const quotaLimit = ref(10000);
    const operationStats = ref({});
    const operationCosts = ref({
      search: 100,
      videoDetails: 1,
      channelDetails: 1
    });
    
    const currentUsage = ref(0);
    const resetTime = ref(new Date().setHours(0, 0, 0, 0));
    const timeRange = ref('12h');
    const operationView = ref('count');
    const loading = ref(false);
    const charts = {};

    // Вычисляемые свойства
    const quotaPercentage = computed(() => {
      return Math.round((currentUsage.value / quotaLimit.value) * 100);
    });

    const quotaColor = computed(() => {
      if (quotaPercentage.value > 90) return 'error';
      if (quotaPercentage.value > 70) return 'warning';
      return 'success';
    });

    const quotaWarning = computed(() => {
      if (quotaPercentage.value > 90) {
        return {
          type: 'error',
          message: 'Критический уровень использования квоты!'
        };
      }
      if (quotaPercentage.value > 70) {
        return {
          type: 'warning',
          message: 'Высокий уровень использования квоты'
        };
      }
      return null;
    });

    const averagePerHour = computed(() => {
      // Расчет среднего использования в час
      const totalUsed = Object.entries(operationStats.value)
        .reduce((acc, [op, count]) => acc + count * operationCosts.value[op], 0);
      const hoursFromReset = (new Date() - resetTime.value) / (1000 * 60 * 60);
      return Math.round(totalUsed / hoursFromReset);
    });

    const dailyForecast = computed(() => {
      // Прогноз до конца дня
      const hoursLeft = 24 - new Date().getHours();
      return Math.round(currentUsage.value + (averagePerHour.value * hoursLeft));
    });

    // Методы
    const refreshStats = async () => {
      loading.value = true;
      try {
        const response = await api.get(`/api/quota/stats?timeRange=${timeRange.value}`);
        operationStats.value = response.data.operationStats;
        currentUsage.value = response.data.currentUsage;
        updateChart(response.data.hourlyUsage);
      } catch (error) {
        console.error('Ошибка при получении статистики:', error);
      } finally {
        loading.value = false;
      }
    };

    const exportQuotaStats = async () => {
      try {
        const response = await api.get(`/api/quota/stats/export?timeRange=${timeRange.value}`, {
          responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.download = `quota-stats-${timeRange.value}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Ошибка при экспорте статистики:', error);
      }
    };

    const formatOperation = (operation) => {
      const names = {
        search: 'Поиск видео',
        videoDetails: 'Детали видео',
        channelDetails: 'Информация о канале'
      };
      return names[operation] || operation;
    };

    const getOperationPercentage = (operation) => {
      const value = operationStats.value[operation] || 0;
      const maxValue = Math.max(...Object.values(operationStats.value));
      return maxValue ? (value / maxValue) * 100 : 0;
    };

    const getOperationColor = (operation) => {
      const colors = {
        search: 'primary',
        videoDetails: 'success',
        channelDetails: 'info'
      };
      return colors[operation] || 'grey';
    };

    const updateChart = (data) => {
      if (charts.quota) {
        charts.quota.destroy();
      }

      const ctx = quotaChart.value.getContext('2d');
      charts.quota = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map(d => new Date(d.hour).toLocaleTimeString()),
          datasets: [{
            label: 'Использование квоты',
            data: data.map(d => d.used),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            tension: 0.1,
            fill: true
          }]
        },
        options: {
          responsive: true,
          animation: {
            duration: 750,
            easing: 'easeInOutQuart'
          },
          scales: {
            y: {
              beginAtZero: true,
              max: quotaLimit.value
            }
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
    };

    // Инициализация и отслеживание изменений
    onMounted(() => {
      refreshStats();
      const interval = setInterval(refreshStats, 300000); // Обновление каждые 5 минут
      
      return () => {
        clearInterval(interval);
        if (charts.quota) {
          charts.quota.destroy();
        }
      };
    });

    watch([timeRange, operationView], () => {
      refreshStats();
    });

    return {
      loading,
      timeRange,
      operationView,
      quotaLimit,
      currentUsage,
      operationStats,
      operationCosts,
      quotaChart,
      quotaPercentage,
      quotaColor,
      quotaWarning,
      averagePerHour,
      dailyForecast,
      refreshStats,
      exportQuotaStats,
      formatOperation,
      getOperationPercentage,
      getOperationColor
    };
  }
};
</script>

<style scoped>
.quota-stats {
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

.v-progress-circular {
  margin: 0 auto;
  display: block;
}
</style> 