<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="d-flex flex-column">
            <div class="text-h6 mb-2">Использовано квоты сегодня</div>
            <div class="text-h4 mb-2">{{ quotaPercent.toFixed(1) }}%</div>
            <v-progress-linear
              :model-value="quotaPercent"
              :color="getQuotaColor(quotaPercent)"
              height="8"
              rounded
              class="mb-2"
            ></v-progress-linear>
            <div class="text-caption" v-if="stats.today">
              {{ stats.today.used }} из {{ stats.today.limit }} единиц
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="d-flex flex-column">
            <div class="text-h6 mb-2">Запросов сегодня</div>
            <div class="text-h4 mb-2">{{ totalRequests }}</div>
            <v-progress-linear
              :model-value="getRequestsProgress"
              color="primary"
              height="8"
              rounded
              class="mb-2"
            ></v-progress-linear>
            <div class="d-flex justify-space-between text-caption" v-if="stats.today">
              <span>
                <v-icon small color="primary">mdi-magnify</v-icon>
                {{ stats.today.searchRequests }}
              </span>
              <span>
                <v-icon small color="success">mdi-youtube</v-icon>
                {{ stats.today.videoRequests }}
              </span>
              <span>
                <v-icon small color="info">mdi-account</v-icon>
                {{ stats.today.channelRequests }}
              </span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="d-flex flex-column">
            <div class="d-flex align-center mb-2">
              <div class="text-h6">Статус API</div>
              <v-spacer></v-spacer>
              <v-chip
                v-if="stats.today"
                :color="getStatusColor(stats.today.status)"
                text-color="white"
              >
                {{ getStatusText(stats.today.status) }}
              </v-chip>
            </div>
            <div class="text-caption mb-7" v-if="stats.today">
              {{ getStatusDescription(stats.today.status) }}
            </div>
            <v-progress-linear
              :model-value="100"
              :color="stats.today ? getStatusColor(stats.today.status) : 'grey'"
              height="8"
              rounded
              class="mb-3"
            ></v-progress-linear>
            <div class="text-caption">
              Последний запрос: {{ formatDate(stats.today?.lastRequest) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="d-flex flex-column">
            <div class="text-h6 mb-2">Ошибок сегодня</div>
            <div class="text-h4 mb-2">{{ stats.today?.errorCount || 0 }}</div>
            <v-progress-linear
              :model-value="getErrorRate"
              :color="getErrorColor(getErrorRate)"
              height="8"
              rounded
              class="mb-2"
            ></v-progress-linear>
            <div class="text-caption">
              {{ getErrorRate.toFixed(1) }}% от всех запросов
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            История использования квоты
            <v-spacer></v-spacer>
            <v-btn icon @click="loadStats" :loading="loading">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <canvas ref="chartRef" height="400"></canvas>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useYoutubeStore } from '@/stores/youtube'
import { Chart } from 'chart.js/auto'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const youtubeStore = useYoutubeStore()
const chartRef = ref(null)
const loading = ref(false)
let chart = null

const stats = ref({
  today: null,
  history: [],
  totals: {
    totalUsed: 0,
    totalSearchRequests: 0,
    totalVideoRequests: 0,
    totalChannelRequests: 0,
    totalCaptionsRequests: 0,
    totalErrors: 0
  }
})

const totalRequests = computed(() => {
  if (!stats.value.today) return 0
  return (
    (stats.value.today.searchRequests || 0) +
    (stats.value.today.videoRequests || 0) +
    (stats.value.today.channelRequests || 0) +
    (stats.value.today.captionsRequests || 0)
  )
})

const getErrorRate = computed(() => {
  if (!stats.value.today || totalRequests.value === 0) return 0
  return (stats.value.today.errorCount / totalRequests.value) * 100
})

const quotaPercent = computed(() => {
  if (!stats.value.today) return 0
  return (stats.value.today.used / stats.value.today.limit) * 100
})

const getRequestsProgress = computed(() => {
  const maxRequests = 1000; // Можно настроить максимальное ожидаемое количество запросов
  return Math.min((totalRequests.value / maxRequests) * 100, 100);
});

const updateChart = () => {
  if (!chartRef.value) return
  
  if (chart) {
    chart.destroy()
  }

  const ctx = chartRef.value.getContext('2d')
  const history = stats.value.history || []

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: history.map(item => format(new Date(item.date), 'd MMM', { locale: ru })),
      datasets: [
        {
          label: 'Использовано квоты (%)',
          data: history.map(item => ((item.used / item.limit) * 100).toFixed(1)),
          borderColor: '#1976D2',
          backgroundColor: 'rgba(25, 118, 210, 0.1)',
          yAxisID: 'y',
          fill: true,
          tension: 0.1,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5
        },
        {
          label: 'Запросы',
          data: history.map(item => 
            (item.searchRequests || 0) + 
            (item.videoRequests || 0) + 
            (item.channelRequests || 0) + 
            (item.captionsRequests || 0)
          ),
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          yAxisID: 'y1',
          type: 'bar',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.6
        },
        {
          label: 'Ошибки',
          data: history.map(item => item.errorCount || 0),
          borderColor: '#FF5252',
          backgroundColor: 'rgba(255, 82, 82, 0.2)',
          yAxisID: 'y1',
          type: 'bar',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Использовано квоты (%)',
            font: {
              weight: 'bold'
            }
          },
          max: 100,
          min: 0,
          grid: {
            color: 'rgba(200, 200, 200, 0.2)'
          },
          ticks: {
            stepSize: 20
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Количество запросов',
            font: {
              weight: 'bold'
            }
          },
          grid: {
            drawOnChartArea: false
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: {
            weight: 'bold'
          },
          bodySpacing: 4,
          padding: 10
        }
      }
    }
  })
}

const loadStats = async () => {
  try {
    loading.value = true
    const response = await youtubeStore.getApiStats()
    if (response?.success && response.data) {
      stats.value = response.data
      updateChart()
    } else {
      console.warn('Некорректный формат данных:', response)
    }
  } catch (error) {
    console.error('Ошибка при загрузке статистики:', error)
  } finally {
    loading.value = false
  }
}

// Вспомогательные функции
const getQuotaColor = (percent) => {
  if (percent >= 90) return 'error'
  if (percent >= 70) return 'warning'
  return 'success'
}

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    warning: 'warning',
    error: 'error',
    inactive: 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    active: 'Активно',
    warning: 'Предупреждение',
    error: 'Ошибка',
    inactive: 'Неактивно'
  }
  return texts[status] || 'Неизвестно'
}

const getStatusDescription = (status) => {
  const descriptions = {
    active: 'API работает нормально',
    warning: 'Высокое использование квоты',
    error: 'Превышен лимит квоты',
    inactive: 'API отключено'
  }
  return descriptions[status] || 'Статус неизвестен'
}

const getErrorColor = (rate) => {
  if (rate >= 10) return 'error'
  if (rate >= 5) return 'warning'
  return 'success'
}

const formatDate = (timestamp) => {
  if (!timestamp) return 'Нет данных'
  try {
    return new Date(timestamp).toLocaleString('ru-RU')
  } catch (e) {
    return 'Некорректная дата'
  }
}

// Инициализация
onMounted(() => {
  loadStats()
})

// Обновление при изменении данных
watch(() => stats.value, () => {
  updateChart()
}, { deep: true })
</script>

<style scoped>
canvas {
  width: 100% !important;
  height: 400px !important;
}

.v-card-text {
  height: 100%;
  min-height: 160px;
}

.text-h4 {
  line-height: 1.2;
}

.v-chip {
  height: 32px;
  font-size: 1.25rem;
}
</style> 