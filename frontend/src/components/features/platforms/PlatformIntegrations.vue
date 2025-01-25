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
          v-for="event in recentEvents"
          :key="event.id"
          :subtitle="formatDate(event.timestamp)"
        >
          <template v-slot:prepend>
            <v-icon :color="event.color">{{ event.icon }}</v-icon>
          </template>
          {{ event.message }}
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>

<script>
import { ref, reactive, onMounted, watch, shallowRef, onUnmounted } from 'vue'
import { Chart } from 'chart.js'
import { useAdminStore } from '@/stores/admin'
import YouTubeIntegration from './YouTubeIntegration.vue'
import InstagramIntegration from './InstagramIntegration.vue'
import VKIntegration from './VKIntegration.vue'
import TelegramIntegration from './TelegramIntegration.vue'
import VKIcon from '@/components/icons/VKIcon.vue'
import TelegramIcon from '@/components/icons/TelegramIcon.vue'
import YouTubeIcon from '@/components/icons/YouTubeIcon.vue'
import InstagramIcon from '@/components/icons/InstagramIcon.vue'

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

    // Методы
    const updateStats = async () => {
      try {
        const response = await adminStore.getIntegrationStats()
        
        // Проверяем успешность запроса и наличие данных
        if (!response?.success || !response.data) {
          console.warn('Не удалось получить статистику интеграций:', response)
          return
        }

        const stats = response.data

        // Проверяем наличие данных о платформах
        if (!stats.platforms || typeof stats.platforms !== 'object') {
          console.warn('Некорректная структура данных статистики:', stats)
          return
        }

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

        // Подготавливаем данные для графика
        const chartData = []
        const now = new Date()
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

        Object.entries(stats.platforms).forEach(([platformName, platformData]) => {
          if (platformData && platformData.enabled && platformData.lastSync) {
            const syncDate = new Date(platformData.lastSync)
            // Добавляем только данные за последние 24 часа
            if (syncDate >= oneDayAgo) {
              chartData.push({
                platform: platformName,
                timestamp: platformData.lastSync,
                activity: platformData.contestsFound || 0
              })
            }
          }
        })

        // Обновляем график только если есть данные
        if (chartData.length > 0) {
          updateActivityChart(chartData)
        } else {
          console.log('Нет данных для отображения на графике за последние 24 часа')
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
            ...event,
            color: getEventColor(event.type),
            icon: getEventIcon(event.type)
          }))
        } else {
          console.warn('Некорректный формат данных событий:', response)
          recentEvents.value = []
        }
      } catch (error) {
        console.error('Failed to load events:', error)
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
      return new Date(timestamp).toLocaleString()
    }

    const updateActivityChart = async (data) => {
      try {
        if (data?.length > 0 && activityChart.value) {
          const ctx = activityChart.value.getContext('2d')
          
          // Очищаем предыдущий график, если он существует
          if (activityChart.value.chart) {
            activityChart.value.chart.destroy()
          }

          // Создаем наборы данных для каждой платформы
          const platforms = [...new Set(data.map(item => item.platform))]
          const colors = {
            youtube: { border: 'rgb(255, 0, 0)', background: 'rgba(255, 0, 0, 0.5)' },
            instagram: { border: 'rgb(188, 42, 141)', background: 'rgba(188, 42, 141, 0.5)' },
            vk: { border: 'rgb(0, 119, 255)', background: 'rgba(0, 119, 255, 0.5)' },
            telegram: { border: 'rgb(0, 136, 204)', background: 'rgba(0, 136, 204, 0.5)' }
          }

          // Группируем данные по платформам
          const platformData = {}
          data.forEach(item => {
            if (!platformData[item.platform]) {
              platformData[item.platform] = {
                label: item.platform.charAt(0).toUpperCase() + item.platform.slice(1),
                data: [item.activity],
                borderColor: colors[item.platform]?.border || 'rgb(128, 128, 128)',
                backgroundColor: colors[item.platform]?.background || 'rgba(128, 128, 128, 0.5)',
                borderWidth: 2,
                fill: true
              }
            } else {
              platformData[item.platform].data.push(item.activity)
            }
          })

          // Создаем новый график
          activityChart.value.chart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: [...new Set(data.map(item => new Date(item.timestamp).toLocaleString()))],
              datasets: Object.values(platformData)
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1
                  }
                }
              },
              plugins: {
                legend: {
                  display: true,
                  position: 'top'
                },
                tooltip: {
                  mode: 'index',
                  intersect: false
                }
              }
            }
          })
        }
      } catch (error) {
        console.error('Ошибка при обновлении графика:', error)
      }
    }

    // Наблюдатели
    watch(timeRange, () => {
      updateActivityChart()
    })

    // Обновляем статистику при изменении активной вкладки
    watch(activeTab, () => {
      updateStats()
    })

    // Периодическое обновление статистики
    let statsInterval
    onMounted(() => {
      updateStats()
      refreshEvents()
      updateActivityChart()
      
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