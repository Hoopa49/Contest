<!-- 
  Компонент админ-панели
  Отображает статистику и управление системой
-->
<template>
  <v-container fluid>
    <!-- Фильтры для аналитики -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedPeriod"
              :items="periods"
              label="Период"
              @update:modelValue="updateData"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="selectedMetric"
              :items="metrics"
              label="Метрика"
              @update:modelValue="updateData"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-btn
              color="primary"
              block
              @click="updateData"
              :loading="loading"
            >
              Обновить данные
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Верхние карточки со статистикой -->
    <v-row>
      <v-col v-for="stat in combinedStats" :key="stat.title" cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <div>
                <div class="text-h6">{{ stat.title }}</div>
                <div class="text-h4">{{ stat.value }}</div>
                <div v-if="stat.trend !== undefined" class="text-caption" :class="stat.trend > 0 ? 'success-text' : 'error-text'">
                  {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}% к прошлому периоду
                </div>
              </div>
              <v-spacer></v-spacer>
              <v-icon size="48" :color="stat.color">{{ stat.icon }}</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Графики -->
    <v-row class="mt-4">
      <!-- График активности -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            Активность пользователей
            <v-spacer></v-spacer>
            <v-btn-toggle v-model="timeRange" mandatory>
              <v-btn value="day">День</v-btn>
              <v-btn value="week">Неделя</v-btn>
              <v-btn value="month">Месяц</v-btn>
            </v-btn-toggle>
          </v-card-title>
          <v-card-text>
            <canvas ref="activityChart"></canvas>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- График метрик -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            Динамика показателей
            <v-spacer></v-spacer>
            <v-btn-toggle v-model="chartType" mandatory>
              <v-btn value="line">
                <v-icon>mdi-chart-line</v-icon>
              </v-btn>
              <v-btn value="bar">
                <v-icon>mdi-chart-bar</v-icon>
              </v-btn>
            </v-btn-toggle>
          </v-card-title>
          <v-card-text>
            <canvas ref="metricsChart"></canvas>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Таблица с данными и последние действия -->
    <v-row class="mt-4">
      <!-- Таблица с данными -->
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            Детальные данные
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Поиск"
              single-line
              hide-details
              density="compact"
            ></v-text-field>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="tableData"
            :search="search"
            :loading="loading"
          >
            <template v-slot:item.trend="{ item }">
              <v-chip
                :color="item.raw.trend > 0 ? 'success' : 'error'"
                size="small"
              >
                {{ item.raw.trend > 0 ? '+' : '' }}{{ item.raw.trend }}%
              </v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <!-- Последние действия -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            Последние действия
            <v-spacer></v-spacer>
            <v-btn icon @click="refreshActions">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-card-title>
          <v-list v-if="formattedActions.length">
            <v-list-item
              v-for="action in formattedActions"
              :key="action.id"
              :subtitle="formatDate(action.created_at)"
            >
              <template v-slot:prepend>
                <v-icon :color="getActionColor(action.type)">{{ getActionIcon(action.type) }}</v-icon>
              </template>
              <v-list-item-title>{{ formatActionDescription(action) }}</v-list-item-title>
            </v-list-item>
          </v-list>
          <v-card-text v-else class="text-center">
            <v-progress-circular
              v-if="isLoading"
              indeterminate
              color="primary"
            ></v-progress-circular>
            <div v-else>Нет последних действий</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useAnalyticsStore } from '@/stores/analytics'
import { Chart, registerables } from 'chart.js'
import { formatDate } from '@/utils/formatters'

// Регистрируем все компоненты Chart.js
Chart.register(...registerables)

export default {
  name: 'AdminDashboard',
  
  setup() {
    const adminStore = useAdminStore()
    const analyticsStore = useAnalyticsStore()
    const activityChart = ref(null)
    const metricsChart = ref(null)
    const timeRange = ref('week')
    const chartType = ref('line')
    let activityChartInstance = null
    let metricsChartInstance = null

    // Состояние компонента
    const isLoading = computed(() => adminStore.isLoading || analyticsStore.isLoading)
    const loading = ref(false)
    const search = ref('')
    const selectedPeriod = ref('week')
    const selectedMetric = ref('users')
    const stats = ref([])
    const formattedActions = ref([])

    // Опции выбора
    const periods = [
      { title: 'День', value: 'day' },
      { title: 'Неделя', value: 'week' },
      { title: 'Месяц', value: 'month' },
      { title: 'Год', value: 'year' }
    ]

    const metrics = [
      { title: 'Пользователи', value: 'users' },
      { title: 'Конкурсы', value: 'contests' },
      { title: 'Активность', value: 'activity' },
      { title: 'Конверсия', value: 'conversion' }
    ]

    // Данные из хранилища
    const systemStats = computed(() => adminStore.getSystemStats || {})
    const recentActions = computed(() => adminStore.getRecentActions || [])
    const analyticsData = computed(() => analyticsStore.getAnalyticsData || {})

    // Комбинированная статистика
    const combinedStats = computed(() => [
      {
        title: 'Всего пользователей',
        value: systemStats.value?.totalUsers || 0,
        icon: 'mdi-account-group',
        color: 'primary',
        trend: analyticsData.value?.usersTrend
      },
      {
        title: 'Активные конкурсы',
        value: systemStats.value?.activeContests || 0,
        icon: 'mdi-trophy',
        color: 'success',
        trend: analyticsData.value?.contestsTrend
      },
      {
        title: 'Конверсия',
        value: analyticsData.value?.conversion || '0%',
        icon: 'mdi-chart-arc',
        color: 'info',
        trend: analyticsData.value?.conversionTrend
      },
      {
        title: 'API запросы/час',
        value: systemStats.value?.apiRequestsPerHour || 0,
        icon: 'mdi-api',
        color: 'warning',
        trend: analyticsData.value?.apiTrend
      }
    ])

    // Заголовки таблицы
    const headers = [
      { title: 'Дата', key: 'date', sortable: true },
      { title: 'Метрика', key: 'metric', sortable: true },
      { title: 'Значение', key: 'value', sortable: true },
      { title: 'Изменение', key: 'trend', sortable: true }
    ]

    // Данные таблицы
    const tableData = ref([])

    // Форматированные действия
    const formatActionDescription = (action) => {
      if (!action || !action.user) {
        return 'Неизвестное действие'
      }
      const userName = action.user ? `${action.user.first_name} ${action.user.last_name}` : 'Пользователь'
      return `${userName} ${action.action}`
    }

    // Получение иконки для типа действия
    const getActionIcon = (type) => {
      const icons = {
        'user_action': 'mdi-account',
        'api_request': 'mdi-api',
        'error': 'mdi-alert',
        'system': 'mdi-cog'
      }
      return icons[type] || 'mdi-information'
    }

    // Получение цвета для типа действия
    const getActionColor = (type) => {
      const colors = {
        'user_action': 'primary',
        'api_request': 'info',
        'error': 'error',
        'system': 'warning'
      }
      return colors[type] || 'grey'
    }

    // Инициализация графиков
    const initCharts = () => {
      initActivityChart()
      initMetricsChart()
    }

    // Инициализация графика активности
    const initActivityChart = () => {
      if (!activityChart.value) return
      
      const ctx = activityChart.value.getContext('2d')
      if (!ctx) return
      
      if (activityChartInstance) {
        activityChartInstance.destroy()
      }

      activityChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
          datasets: [{
            label: 'Активность',
            data: [12, 19, 3, 5, 2, 3],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'График активности пользователей'
            }
          }
        }
      })
    }

    // Инициализация графика метрик
    const initMetricsChart = () => {
      if (!metricsChart.value) return

      const ctx = metricsChart.value.getContext('2d')
      if (!ctx) return

      if (metricsChartInstance) {
        metricsChartInstance.destroy()
      }

      metricsChartInstance = new Chart(ctx, {
        type: chartType.value,
        data: {
          labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
          datasets: [{
            label: 'Значение метрики',
            data: [65, 59, 80, 81, 56, 55, 40],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Динамика показателей'
            }
          }
        }
      })
    }

    // Обновление данных
    const updateData = async () => {
      try {
        const period = {
          start: new Date(Date.now() - getPeriodDuration(timeRange.value)),
          end: new Date()
        }
        
        const data = await analyticsStore.fetchAnalytics({
          period,
          metric: selectedMetric.value
        })

        // Обновляем графики с полученными данными
        if (data.activity?.data) {
          updateActivityChart(data.activity.data)
        }

        // Обновляем статистику
        if (data.stats?.data) {
          stats.value = [
            {
              title: 'Всего пользователей',
              value: data.stats.data.totalUsers || 0,
              icon: 'mdi-account-group',
              color: 'primary'
            },
            {
              title: 'Активные конкурсы',
              value: data.stats.data.activeContests || 0,
              icon: 'mdi-trophy',
              color: 'success'
            },
            {
              title: 'Новые регистрации',
              value: data.stats.data.newRegistrations || 0,
              icon: 'mdi-account-plus',
              color: 'info'
            },
            {
              title: 'API запросы/час',
              value: data.stats.data.apiRequestsPerHour || 0,
              icon: 'mdi-api',
              color: 'warning'
            }
          ]
        }

        // Обновляем последние действия
        if (data.activity?.data) {
          formattedActions.value = data.activity.data.map(action => ({
            ...action,
            description: formatActionDescription(action)
          }))
        }
      } catch (error) {
        console.error('Error updating data:', error)
      }
    }

    // Получение длительности периода в миллисекундах
    const getPeriodDuration = (period) => {
      const durations = {
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000
      }
      return durations[period] || durations.week
    }

    // Обновление графика активности
    const updateActivityChart = (activityData) => {
      if (!activityChart.value) return
      
      const ctx = activityChart.value.getContext('2d')
      if (!ctx) return
      
      if (activityChartInstance) {
        activityChartInstance.destroy()
      }

      // Группируем данные по часам
      const groupedData = groupActivityByHours(activityData)

      activityChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Object.keys(groupedData),
          datasets: [{
            label: 'Активность',
            data: Object.values(groupedData),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'График активности пользователей'
            }
          }
        }
      })
    }

    // Группировка данных активности по часам
    const groupActivityByHours = (activityData) => {
      if (!Array.isArray(activityData)) {
        console.warn('Activity data is not an array:', activityData)
        return {}
      }

      const grouped = {}
      
      activityData.forEach(action => {
        const hour = new Date(action.created_at).getHours().toString().padStart(2, '0') + ':00'
        grouped[hour] = (grouped[hour] || 0) + 1
      })

      return grouped
    }

    // Обновление последних действий
    const refreshActions = async () => {
      try {
        await adminStore.fetchRecentActions()
        // Обновляем formattedActions после получения новых данных
        formattedActions.value = recentActions.value?.map(action => ({
          ...action,
          description: formatActionDescription(action)
        })) || []
      } catch (error) {
        console.error('Error fetching recent actions:', error)
      }
    }

    // Следим за изменением типа графика
    watch(chartType, () => {
      initMetricsChart()
    })

    // Инициализация при монтировании
    onMounted(() => {
      updateData()
      refreshActions()
      
      // Инициализируем графики
      nextTick(() => {
        initCharts()
      })
    })

    return {
      // Состояние
      isLoading,
      loading,
      search,
      selectedPeriod,
      selectedMetric,
      timeRange,
      chartType,
      stats,
      
      // Данные
      combinedStats,
      formattedActions,
      periods,
      metrics,
      headers,
      tableData,
      
      // Методы
      updateData,
      refreshActions,
      formatDate,
      getActionIcon,
      getActionColor,
      formatActionDescription,
      
      // Рефы для графиков
      activityChart,
      metricsChart
    }
  }
}
</script>

<style scoped>
.success-text {
  color: #4caf50;
}

.error-text {
  color: #f44336;
}
</style>
