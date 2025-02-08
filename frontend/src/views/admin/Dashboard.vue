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
import { ref, computed, onMounted, watch } from 'vue'
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
    const recentActions = computed(() => adminStore.getRecentActions())
    const analyticsData = computed(() => analyticsStore.getAnalyticsData())

    // Комбинированная статистика
    const combinedStats = computed(() => {
      // Проверяем наличие данных аналитики
      const analytics = analyticsData.value || {}
      
      return [
        {
          title: 'Всего пользователей',
          value: systemStats.value?.data?.totalUsers || 0,
          icon: 'mdi-account-group',
          color: 'primary',
          trend: typeof analytics.usersTrend === 'number' ? analytics.usersTrend : 0
        },
        {
          title: 'Активные конкурсы',
          value: systemStats.value?.data?.activeContests || 0,
          icon: 'mdi-trophy',
          color: 'success',
          trend: typeof analytics.contestsTrend === 'number' ? analytics.contestsTrend : 0
        },
        {
          title: 'Активные пользователи',
          value: analytics?.metrics?.data?.[0]?.metrics?.active || 0,
          icon: 'mdi-account-check',
          color: 'info',
          trend: typeof analytics.activeUsersTrend === 'number' ? analytics.activeUsersTrend : 0
        },
        {
          title: 'Конверсия',
          value: analytics?.metrics?.data?.[0]?.metrics?.active && analytics?.metrics?.data?.[0]?.metrics?.total
            ? Math.round((analytics.metrics.data[0].metrics.active / analytics.metrics.data[0].metrics.total) * 100) + '%'
            : '0%',
          icon: 'mdi-chart-arc',
          color: 'warning',
          trend: typeof analytics.conversionTrend === 'number' ? analytics.conversionTrend : 0
        }
      ]
    })

    // Заголовки таблицы
    const headers = [
      { title: 'Дата', key: 'date', align: 'start' },
      { title: 'Метрика', key: 'metric' },
      { title: 'Значение', key: 'value' },
      { title: 'Тренд', key: 'trend' }
    ]

    // Данные таблицы
    const tableData = ref([])

    // Форматирование описания действия
    const formatActionDescription = (action) => {
      const descriptions = {
        'user_login': `Пользователь ${action.user?.username || 'Unknown'} вошел в систему`,
        'user_register': `Новая регистрация: ${action.user?.username || 'Unknown'}`,
        'contest_create': `Создан новый конкурс: ${action.contest?.title || 'Unknown'}`,
        'contest_update': `Обновлен конкурс: ${action.contest?.title || 'Unknown'}`,
        'submission_create': `Новое решение от ${action.user?.username || 'Unknown'}`
      }
      return descriptions[action.type] || 'Неизвестное действие'
    }

    // Получение цвета иконки действия
    const getActionColor = (type) => {
      const colors = {
        'user_login': 'primary',
        'user_register': 'success',
        'contest_create': 'info',
        'contest_update': 'warning',
        'submission_create': 'error'
      }
      return colors[type] || 'grey'
    }

    // Получение иконки действия
    const getActionIcon = (type) => {
      const icons = {
        'user_login': 'mdi-login',
        'user_register': 'mdi-account-plus',
        'contest_create': 'mdi-trophy-outline',
        'contest_update': 'mdi-trophy',
        'submission_create': 'mdi-file-upload'
      }
      return icons[type] || 'mdi-help-circle'
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
        loading.value = true
        
        // Определяем период
        const now = new Date()
        let startDate = new Date()
        
        switch (selectedPeriod.value) {
          case 'day':
            startDate.setDate(startDate.getDate() - 1)
            break
          case 'week':
            startDate.setDate(startDate.getDate() - 7)
            break
          case 'month':
            startDate.setMonth(startDate.getMonth() - 1)
            break
          case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1)
            break
        }

        const period = {
          start: startDate,
          end: now
        }

        // Загружаем данные
        const data = await analyticsStore.fetchAnalytics({
          period,
          metric: selectedMetric.value
        })

        // Проверяем наличие данных перед обновлением графиков
        if (data?.metrics?.data?.length) {
          updateMetricsChart(data.metrics.data)
          // Обновляем таблицу
          tableData.value = formatTableData(data.metrics.data)
        } else {
          // Очищаем график метрик при отсутствии данных
          if (metricsChartInstance) {
            metricsChartInstance.destroy()
            metricsChartInstance = null
          }
          tableData.value = []
        }

        if (data?.activity?.data?.length) {
          updateActivityChart(data.activity.data)
        } else {
          // Очищаем график активности при отсутствии данных
          if (activityChartInstance) {
            activityChartInstance.destroy()
            activityChartInstance = null
          }
        }

      } catch (error) {
        console.error('Error updating data:', error)
        // Очищаем графики при ошибке
        if (metricsChartInstance) {
          metricsChartInstance.destroy()
          metricsChartInstance = null
        }
        if (activityChartInstance) {
          activityChartInstance.destroy()
          activityChartInstance = null
        }
        tableData.value = []
      } finally {
        loading.value = false
      }
    }

    // Форматирование данных для таблицы
    const formatTableData = (data) => {
      return data.map(item => ({
        date: formatDate(item.date),
        metric: selectedMetric.value,
        value: item.metrics.total || 0,
        trend: item.metrics.trend || 0
      }))
    }

    // Обновление графика метрик
    const updateMetricsChart = (data) => {
      if (!metricsChart.value) return

      const ctx = metricsChart.value.getContext('2d')
      
      // Уничтожаем предыдущий экземпляр графика
      if (metricsChartInstance) {
        metricsChartInstance.destroy()
      }

      const labels = data.map(item => formatDate(item.date))
      const values = data.map(item => item.metrics.total || 0)
      const trends = data.map(item => item.metrics.trend || 0)

      metricsChartInstance = new Chart(ctx, {
        type: chartType.value,
        data: {
          labels,
          datasets: [
            {
              label: 'Значение',
              data: values,
              borderColor: '#1976D2',
              backgroundColor: 'rgba(25, 118, 210, 0.2)',
              tension: 0.4
            },
            {
              label: 'Тренд',
              data: trends,
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.2)',
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top'
            },
            title: {
              display: true,
              text: `Динамика ${selectedMetric.value}`
            }
          }
        }
      })
    }

    // Обновление графика активности
    const updateActivityChart = (data) => {
      if (!activityChart.value) return

      const ctx = activityChart.value.getContext('2d')
      
      // Уничтожаем предыдущий экземпляр графика
      if (activityChartInstance) {
        activityChartInstance.destroy()
      }

      const labels = data.map(item => formatDate(item.date))
      const values = data.map(item => item.value || 0)

      activityChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Активность',
              data: values,
              borderColor: '#FF9800',
              backgroundColor: 'rgba(255, 152, 0, 0.2)',
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top'
            },
            title: {
              display: true,
              text: 'Активность пользователей'
            }
          }
        }
      })
    }

    // Обновление последних действий
    const refreshActions = async () => {
      try {
        await adminStore.fetchRecentActions()
        formattedActions.value = recentActions.value.map(action => ({
          ...action,
          description: formatActionDescription(action)
        }))
      } catch (error) {
        console.error('Error refreshing actions:', error)
      }
    }

    // Обработчики изменений
    watch(chartType, () => {
      if (analyticsData.value?.metrics?.data) {
        updateMetricsChart(analyticsData.value.metrics.data)
      }
    })

    watch(timeRange, () => {
      updateData()
    })

    // Инициализация при монтировании
    onMounted(async () => {
      await Promise.all([
        adminStore.fetchSystemStats(),
        refreshActions()
      ])
      
      await updateData()
      
      // Устанавливаем интервал обновления данных
      const updateInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          updateData()
          refreshActions()
        }
      }, 60000) // Обновление каждую минуту

      // Очистка при размонтировании
      return () => {
        clearInterval(updateInterval)
        if (activityChartInstance) {
          activityChartInstance.destroy()
        }
        if (metricsChartInstance) {
          metricsChartInstance.destroy()
        }
      }
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
