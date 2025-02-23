<template>
  <v-container fluid>
    <!-- Фильтры -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedPeriod"
              :items="periods"
              label="Период анализа"
              @update:modelValue="loadData"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedMetric"
              :items="metrics"
              label="Основная метрика"
              @update:modelValue="loadData"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-btn
              color="primary"
              block
              @click="loadData"
              :loading="loading"
              prepend-icon="mdi-refresh"
            >
              Обновить данные
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-row>
      <!-- Ключевые метрики -->
      <v-col cols="12" lg="3" md="6">
        <v-card>
          <v-card-text class="d-flex align-center">
            <v-icon size="36" color="primary" class="me-4">mdi-account-group</v-icon>
            <div>
              <div class="text-subtitle-2">Всего пользователей</div>
              <div class="text-h5">{{ stats.totalUsers || 0 }}</div>
              <div class="text-caption" :class="stats.usersTrend >= 0 ? 'success-text' : 'error-text'">
                {{ stats.usersTrend >= 0 ? '+' : '' }}{{ stats.usersTrend || 0 }}% за период
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="3" md="6">
        <v-card>
          <v-card-text class="d-flex align-center">
            <v-icon size="36" color="success" class="me-4">mdi-trophy</v-icon>
            <div>
              <div class="text-subtitle-2">Активных конкурсов</div>
              <div class="text-h5">{{ stats.activeContests || 0 }}</div>
              <div class="text-caption" :class="stats.contestsTrend >= 0 ? 'success-text' : 'error-text'">
                {{ stats.contestsTrend >= 0 ? '+' : '' }}{{ stats.contestsTrend || 0 }}% за период
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="3" md="6">
        <v-card>
          <v-card-text class="d-flex align-center">
            <v-icon size="36" color="info" class="me-4">mdi-check-circle</v-icon>
            <div>
              <div class="text-subtitle-2">Конверсия участия</div>
              <div class="text-h5">{{ stats.conversionRate || 0 }}%</div>
              <div class="text-caption" :class="stats.conversionTrend >= 0 ? 'success-text' : 'error-text'">
                {{ stats.conversionTrend >= 0 ? '+' : '' }}{{ stats.conversionTrend || 0 }}% за период
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="3" md="6">
        <v-card>
          <v-card-text class="d-flex align-center">
            <v-icon size="36" color="warning" class="me-4">mdi-chart-line-variant</v-icon>
            <div>
              <div class="text-subtitle-2">Средняя активность</div>
              <div class="text-h5">{{ stats.avgActivity || 0 }}</div>
              <div class="text-caption" :class="stats.activityTrend >= 0 ? 'success-text' : 'error-text'">
                {{ stats.activityTrend >= 0 ? '+' : '' }}{{ stats.activityTrend || 0 }}% за период
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Графики трендов -->
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon start color="primary" class="me-2">mdi-chart-line</v-icon>
            Тренды активности
            <v-spacer />
            <v-btn-toggle v-model="chartType" mandatory density="compact">
              <v-btn value="daily" size="small">День</v-btn>
              <v-btn value="weekly" size="small">Неделя</v-btn>
              <v-btn value="monthly" size="small">Месяц</v-btn>
            </v-btn-toggle>
          </v-card-title>
          <v-card-text>
            <div class="chart-container">
              <canvas ref="userActivityChart"></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Распределение платформ -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon start color="primary" class="me-2">mdi-pie-chart</v-icon>
            Распределение платформ
          </v-card-title>
          <v-card-text>
            <div class="chart-container">
              <canvas ref="platformDistributionChart"></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Прогнозы -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon start color="primary" class="me-2">mdi-trending-up</v-icon>
            Прогнозы роста
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="(forecast, index) in forecasts" :key="index">
                <template v-slot:prepend>
                  <v-icon :color="forecast.trend >= 0 ? 'success' : 'error'">
                    {{ forecast.trend >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                  </v-icon>
                </template>
                <v-list-item-title>{{ forecast.title }}</v-list-item-title>
                <template v-slot:append>
                  <span :class="forecast.trend >= 0 ? 'success-text' : 'error-text'">
                    {{ forecast.trend >= 0 ? '+' : '' }}{{ forecast.trend }}%
                  </span>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Рекомендации -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon start color="primary" class="me-2">mdi-lightbulb</v-icon>
            Рекомендации
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="(recommendation, index) in recommendations" :key="index">
                <template v-slot:prepend>
                  <v-icon :color="recommendation.priority">
                    {{ getPriorityIcon(recommendation.priority) }}
                  </v-icon>
                </template>
                <v-list-item-title>{{ recommendation.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ recommendation.description }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'
import { adminService } from '@/services/api/admin.api'
import { formatDate } from '@/utils/formatters'
import { useNotificationStore } from '@/stores/notification'

// Регистрируем все компоненты Chart.js
Chart.register(...registerables)

export default {
  name: 'AnalyticsView',

  setup() {
    const notificationStore = useNotificationStore()
    const loading = ref(false)
    const stats = ref({})
    const selectedPeriod = ref('month')
    const selectedMetric = ref('users')
    const chartType = ref('weekly')
    const forecasts = ref([])
    const recommendations = ref([])

    // Refs для графиков
    const userActivityChart = ref(null)
    const platformDistributionChart = ref(null)
    let activityChartInstance = null
    let distributionChartInstance = null

    const periods = [
      { title: 'Последние 7 дней', value: 'week' },
      { title: 'Последний месяц', value: 'month' },
      { title: 'Последний квартал', value: 'quarter' },
      { title: 'Последний год', value: 'year' }
    ]

    const metrics = [
      { title: 'Пользователи', value: 'users' },
      { title: 'Конкурсы', value: 'contests' },
      { title: 'Конверсия', value: 'conversion' },
      { title: 'Активность', value: 'activity' }
    ]

    // Конфигурация для графика активности
    const createActivityChartConfig = (data) => ({
      type: 'line',
      data: {
        labels: data.dates,
        datasets: [
          {
            label: 'Активные пользователи',
            data: data.activeUsers,
            borderColor: 'rgb(var(--v-theme-primary))',
            backgroundColor: 'rgba(var(--v-theme-primary), 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Новые регистрации',
            data: data.newRegistrations,
            borderColor: 'rgb(var(--v-theme-success))',
            backgroundColor: 'rgba(var(--v-theme-success), 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Конверсия (%)',
            data: data.conversion,
            borderColor: 'rgb(var(--v-theme-warning))',
            backgroundColor: 'rgba(var(--v-theme-warning), 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'percentage'
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
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Количество'
            }
          },
          percentage: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Конверсия (%)'
            },
            min: 0,
            max: 100,
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    })

    // Конфигурация для графика распределения платформ
    const createDistributionChartConfig = (data) => ({
      type: 'doughnut',
      data: {
        labels: data.map(item => item.name),
        datasets: [{
          data: data.map(item => item.value),
          backgroundColor: [
            'rgba(var(--v-theme-primary), 0.8)',
            'rgba(var(--v-theme-success), 0.8)',
            'rgba(var(--v-theme-warning), 0.8)',
            'rgba(var(--v-theme-error), 0.8)',
            'rgba(var(--v-theme-info), 0.8)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    })

    const loadData = async () => {
      try {
        loading.value = true
        
        // Добавляем timestamp для предотвращения кэширования
        const timestamp = Date.now()
        const params = {
          period: selectedPeriod.value,
          metric: selectedMetric.value,
          chartType: chartType.value,
          _t: timestamp
        }

        const [
          statsResponse, 
          analyticsResponse, 
          forecastsResponse, 
          recommendationsResponse
        ] = await Promise.all([
          adminService.getSystemStats(params),
          adminService.getAnalytics(params),
          adminService.getForecasts(params),
          adminService.getRecommendations()
        ])

        // Проверяем наличие данных
        if (!statsResponse?.data || !analyticsResponse?.data) {
          throw new Error('Не удалось получить данные аналитики')
        }

        // Обновляем состояние с проверкой на null
        stats.value = statsResponse.data || {}
        forecasts.value = forecastsResponse?.data || []
        recommendations.value = recommendationsResponse?.data || []
        
        const { userActivity, platformDistribution } = analyticsResponse.data

        // Проверяем наличие данных для графиков
        if (!userActivity || !platformDistribution) {
          throw new Error('Не удалось получить данные для графиков')
        }

        // Обновляем графики
        await nextTick()
        
        // Обновляем график активности
        if (activityChartInstance) {
          activityChartInstance.destroy()
        }
        
        if (userActivityChart.value) {
          activityChartInstance = new Chart(
            userActivityChart.value,
            createActivityChartConfig(userActivity)
          )
        }

        // Обновляем график распределения
        if (distributionChartInstance) {
          distributionChartInstance.destroy()
        }
        
        if (platformDistributionChart.value && platformDistribution.length > 0) {
          distributionChartInstance = new Chart(
            platformDistributionChart.value,
            createDistributionChartConfig(platformDistribution)
          )
        }

      } catch (error) {
        console.error('Ошибка загрузки аналитики:', error)
        notificationStore.showError(error.message || 'Ошибка при загрузке данных аналитики')
        
        // Очищаем данные при ошибке
        stats.value = {}
        forecasts.value = []
        recommendations.value = []
        
        // Уничтожаем графики при ошибке
        if (activityChartInstance) {
          activityChartInstance.destroy()
          activityChartInstance = null
        }
        if (distributionChartInstance) {
          distributionChartInstance.destroy()
          distributionChartInstance = null
        }
      } finally {
        loading.value = false
      }
    }

    const getPriorityIcon = (priority) => {
      const icons = {
        error: 'mdi-alert-circle',
        warning: 'mdi-alert',
        success: 'mdi-check-circle',
        info: 'mdi-information'
      }
      return icons[priority] || icons.info
    }

    onMounted(async () => {
      await loadData()
    })

    onBeforeUnmount(() => {
      // Очищаем инстансы графиков при размонтировании
      if (activityChartInstance) {
        activityChartInstance.destroy()
      }
      if (distributionChartInstance) {
        distributionChartInstance.destroy()
      }
    })

    return {
      loading,
      stats,
      selectedPeriod,
      selectedMetric,
      chartType,
      periods,
      metrics,
      userActivityChart,
      platformDistributionChart,
      forecasts,
      recommendations,
      getPriorityIcon,
      loadData
    }
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 400px;
}

.v-card-text {
  position: relative;
  height: 100%;
}

.success-text {
  color: rgb(var(--v-theme-success));
}

.error-text {
  color: rgb(var(--v-theme-error));
}

.v-list-item-subtitle {
  white-space: normal !important;
}
</style> 