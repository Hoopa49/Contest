<template>
  <v-container>
    <!-- Общая статистика -->
    <v-row>
      <v-col cols="12" md="3" v-for="stat in totalStats" :key="stat.title">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-subtitle-1">{{ stat.title }}</div>
                <div class="text-h4">{{ stat.value }}</div>
              </div>
              <v-icon :color="stat.color" size="36">{{ stat.icon }}</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Управление интеграциями -->
    <v-tabs
      v-model="activeTab"
      class="mt-4"
    >
      <v-tab value="youtube">
        <YouTubeIcon class="mr-2" color="currentColor" />
        YouTube
      </v-tab>
      <v-tab value="instagram">
        <InstagramIcon class="mr-2" color="currentColor" />
        Instagram
      </v-tab>
      <v-tab value="vk">
        <VKIcon class="mr-2" color="currentColor" />
        VK
      </v-tab>
      <v-tab value="telegram">
        <TelegramIcon class="mr-2" color="currentColor" />
        Telegram
      </v-tab>
    </v-tabs>

    <v-window v-model="activeTab" class="mt-4">
      <v-window-item value="youtube">
        <YouTubeIntegration />
      </v-window-item>

      <v-window-item value="instagram">
        <InstagramIntegration />
      </v-window-item>

      <v-window-item value="vk">
        <VKIntegration />
      </v-window-item>

      <v-window-item value="telegram">
        <TelegramIntegration />
      </v-window-item>
    </v-window>

    <!-- График активности -->
    <v-card class="mt-4">
      <v-card-title>
        Активность по платформам
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

    <!-- Последние события -->
    <v-card class="mt-4">
      <v-card-title>
        Последние события
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click="refreshEvents"
          :loading="refreshing"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-card-title>
      <v-list>
        <v-list-item
          v-for="event in sortedEvents"
          :key="event.id"
          :subtitle="formatDate(event.timestamp)"
        >
          <template v-slot:prepend>
            <v-icon :color="event.color">{{ event.icon }}</v-icon>
          </template>
          <v-list-item-title class="text-subtitle-2 font-weight-medium">
            {{ event.title }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ event.message }}
          </v-list-item-subtitle>
          <v-list-item-subtitle class="text-caption">
            {{ formatDate(event.timestamp) }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>

<script>
import { ref, reactive, onMounted, watch, shallowRef, onUnmounted, computed } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useAdminStore } from '@/stores/admin'
import YouTubeIntegration from './YouTubeIntegration.vue'
import InstagramIntegration from './InstagramIntegration.vue'
import VKIntegration from './VKIntegration.vue'
import TelegramIntegration from './TelegramIntegration.vue'
import VKIcon from '@/components/icons/VKIcon.vue'
import TelegramIcon from '@/components/icons/TelegramIcon.vue'
import YouTubeIcon from '@/components/icons/YouTubeIcon.vue'
import InstagramIcon from '@/components/icons/InstagramIcon.vue'

// Регистрируем все компоненты Chart.js
Chart.register(...registerables)

export default {
  name: 'PlatformIntegrations',
  components: {
    YouTubeIntegration,
    InstagramIntegration,
    VKIntegration,
    TelegramIntegration,
    VKIcon,
    TelegramIcon,
    YouTubeIcon,
    InstagramIcon
  },
  setup() {
    const adminStore = useAdminStore()
    const activeTab = shallowRef('youtube')
    const timeRange = ref('week')
    const activityChart = ref(null)
    const refreshing = ref(false)

    const totalStats = reactive([
      {
        title: 'Всего интеграций',
        value: 4,
        icon: 'mdi-connection',
        color: 'primary'
      },
      {
        title: 'Активные интеграции',
        value: 0,
        icon: 'mdi-check-circle',
        color: 'success'
      },
      {
        title: 'Найдено конкурсов',
        value: 0,
        icon: 'mdi-trophy',
        color: 'info'
      },
      {
        title: 'Ошибки за 24ч',
        value: 0,
        icon: 'mdi-alert-circle',
        color: 'error'
      }
    ])

    const recentEvents = ref([])

    // Добавляем вычисляемое свойство для отсортированных событий
    const sortedEvents = computed(() => {
      return [...recentEvents.value]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10) // Показываем только последние 10 событий
    })

    // Наблюдатели
    watch(timeRange, async (newRange) => {
      try {
        console.log('Запрашиваем данные активности для периода:', newRange)
        const response = await adminStore.getIntegrationActivity(newRange)
        
        if (response?.success && response.data) {
          console.log('Получены данные активности:', response.data)
          
          const chartData = []
          const { byPlatform = {} } = response.data
          
          // Для каждой платформы добавляем данные
          Object.entries(byPlatform).forEach(([platform, data]) => {
            if (data?.actions && Array.isArray(data.actions)) {
              data.actions.forEach(action => {
                chartData.push({
                  platform,
                  timestamp: action.timestamp,
                  activity: parseInt(action.count) || 0
                })
              })
            }
          })

          if (chartData.length > 0) {
            console.log('Данные для графика:', chartData)
            updateActivityChart(chartData)
          } else {
            console.log('Нет данных для отображения на графике')
            if (activityChart.value?.chart) {
              activityChart.value.chart.destroy()
              activityChart.value.chart = null
            }
          }
        } else {
          console.warn('Некорректный формат данных активности:', response)
          if (activityChart.value?.chart) {
            activityChart.value.chart.destroy()
            activityChart.value.chart = null
          }
        }
      } catch (error) {
        console.error('Ошибка при получении данных активности:', error)
        if (activityChart.value?.chart) {
          activityChart.value.chart.destroy()
          activityChart.value.chart = null
        }
      }
    })

    // Методы
    const updateStats = async () => {
      try {
        const response = await adminStore.getIntegrationStats()
        
        // Проверяем успешность запроса и наличие данных
        if (!response?.success || !response.data?.platforms) {
          console.warn('Не удалось получить статистику интеграций:', response)
          return
        }

        const stats = response.data
        console.log('Полученные данные с сервера:', stats)
        
        // Подсчитываем общее количество активных интеграций
        const activeIntegrations = Object.values(stats.platforms)
          .filter(platform => platform && platform.enabled)
          .length

        // Подсчитываем общее количество найденных конкурсов
        const totalContests = Object.values(stats.platforms)
          .reduce((acc, platform) => acc + (platform?.contestsFound || 0), 0)

        // Подсчитываем общее количество ошибок за 24 часа
        const totalErrors = Object.values(stats.platforms)
          .reduce((acc, platform) => acc + (platform?.errorCount || 0), 0)

        // Обновляем значения счетчиков
        totalStats[0].value = Object.keys(stats.platforms).length // Всего интеграций
        totalStats[1].value = activeIntegrations // Активные интеграции
        totalStats[2].value = totalContests // Найдено конкурсов
        totalStats[3].value = totalErrors // Ошибки

        // Запрашиваем данные активности за текущий период
        try {
          const activityResponse = await adminStore.getIntegrationActivity(timeRange.value)
          if (activityResponse?.success && activityResponse.data) {
            const chartData = []
            const { byPlatform = {} } = activityResponse.data

            if (!byPlatform || Object.keys(byPlatform).length === 0) {
              console.log('Нет данных для отображения на графике')
              if (activityChart.value?.chart) {
                activityChart.value.chart.destroy()
                activityChart.value.chart = null
              }
              return
            }

            // Для каждой платформы создаем точку данных
            Object.entries(byPlatform).forEach(([platform, data]) => {
              if (data?.actions && Array.isArray(data.actions)) {
                data.actions.forEach(action => {
                  chartData.push({
                    platform,
                    timestamp: action.timestamp,
                    activity: parseInt(action.count) || 0
                  })
                })
              }
            })

            if (chartData.length > 0) {
              updateActivityChart(chartData)
            } else {
              console.log('Нет данных для отображения на графике')
              if (activityChart.value?.chart) {
                activityChart.value.chart.destroy()
                activityChart.value.chart = null
              }
            }
          } else {
            console.warn('Некорректный формат данных активности:', activityResponse)
            if (activityChart.value?.chart) {
              activityChart.value.chart.destroy()
              activityChart.value.chart = null
            }
          }
        } catch (error) {
          console.error('Ошибка при получении данных активности:', error)
          if (activityChart.value?.chart) {
            activityChart.value.chart.destroy()
            activityChart.value.chart = null
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке статистики интеграций:', error)
      }
    }

    const refreshEvents = async () => {
      refreshing.value = true
      try {
        const response = await adminStore.getIntegrationEvents()
        if (response?.success && Array.isArray(response.data)) {
          recentEvents.value = response.data.map(event => ({
            id: event.id,
            message: event.message,
            title: event.title,
            type: event.type || 'info',
            timestamp: event.timestamp,
            platform: event.platform,
            color: getEventColor(event.type),
            icon: getEventIcon(event.type)
          }))
        } else {
          console.warn('Некорректный формат данных событий:', response)
          recentEvents.value = []
        }
      } catch (error) {
        console.error('Ошибка при загрузке событий:', error)
        recentEvents.value = []
      } finally {
        refreshing.value = false
      }
    }

    const getEventColor = (type) => {
      const colors = {
        success: 'success',
        error: 'error',
        warning: 'warning',
        info: 'info'
      }
      return colors[type] || 'grey'
    }

    const getEventIcon = (type) => {
      const icons = {
        success: 'mdi-check-circle',
        error: 'mdi-alert-circle',
        warning: 'mdi-alert',
        info: 'mdi-information'
      }
      return icons[type] || 'mdi-circle'
    }

    const formatDate = (timestamp) => {
      const date = new Date(timestamp)
      return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const updateActivityChart = async (data) => {
      try {
        if (!activityChart.value) {
          console.warn('Canvas элемент не найден')
          return
        }

        const ctx = activityChart.value.getContext('2d')
        if (!ctx) {
          console.warn('Контекст canvas не найден')
          return
        }

        // Очищаем предыдущий график
        if (activityChart.value.chart) {
          activityChart.value.chart.destroy()
        }

        // Группируем данные по датам для каждой платформы
        const groupedData = {}
        data.forEach(item => {
          const date = new Date(item.timestamp).toLocaleDateString('ru-RU')
          if (!groupedData[date]) {
            groupedData[date] = {}
          }
          if (!groupedData[date][item.platform]) {
            groupedData[date][item.platform] = 0
          }
          groupedData[date][item.platform] += item.activity
        })

        // Получаем уникальные платформы и даты
        const platforms = [...new Set(data.map(item => item.platform))]
        const sortedDates = Object.keys(groupedData).sort((a, b) => 
          new Date(a) - new Date(b)
        )

        // Создаем наборы данных для каждой платформы
        const datasets = platforms.map((platform, index) => {
          const color = getChartColor(index)
          return {
            label: platform,
            data: sortedDates.map(date => groupedData[date][platform] || 0),
            borderColor: color,
            backgroundColor: color + '20',
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            fill: true,
            tension: 0.4
          }
        })

        // Создаем новый график
        activityChart.value.chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: sortedDates.map(date => formatChartDate(date)),
            datasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                  callback: (value) => value.toFixed(0)
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              },
              x: {
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                  maxRotation: 45,
                  minRotation: 45
                }
              }
            },
            plugins: {
              legend: {
                display: true,
                position: 'top',
                labels: {
                  usePointStyle: true,
                  padding: 20
                }
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                  title: (tooltipItems) => formatChartDate(tooltipItems[0].label),
                  label: (context) => {
                    return `${context.dataset.label}: ${context.raw} действий`
                  }
                },
                padding: 10,
                backgroundColor: 'rgba(0, 0, 0, 0.8)'
              }
            }
          }
        })
      } catch (error) {
        console.error('Ошибка при обновлении графика:', error)
      }
    }

    const formatChartDate = (date) => {
      return new Date(date).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit'
      })
    }

    const getChartColor = (index) => {
      const colors = [
        '#4CAF50', // Зеленый
        '#2196F3', // Синий
        '#FFC107', // Желтый
        '#9C27B0', // Фиолетовый
        '#FF5722', // Оранжевый
        '#607D8B', // Серый
        '#E91E63', // Розовый
        '#00BCD4'  // Голубой
      ]
      return colors[index % colors.length]
    }

    // Обновляем статистику при изменении активной вкладки
    watch(activeTab, () => {
      updateStats()
    })

    // Периодическое обновление статистики
    let statsInterval
    onMounted(() => {
      updateStats()
      refreshEvents()
      
      // Обновляем статистику каждые 30 секунд
      statsInterval = setInterval(updateStats, 30000)

      // Добавляем слушатель события переключения интеграции
      window.addEventListener('integration-toggled', () => {
        console.log('Получено событие integration-toggled, обновляем статистику')
        updateStats()
      })
    })

    // Очищаем интервал и слушатели при размонтировании компонента
    onUnmounted(() => {
      if (statsInterval) {
        clearInterval(statsInterval)
      }
      window.removeEventListener('integration-toggled', updateStats)
    })

    return {
      activeTab,
      timeRange,
      activityChart,
      refreshing,
      totalStats,
      recentEvents,
      sortedEvents,
      refreshEvents,
      formatDate
    }
  }
}
</script>

<style scoped>
.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-2px);
}
</style> 