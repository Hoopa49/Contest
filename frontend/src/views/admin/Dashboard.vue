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
                v-if="item?.raw?.trend !== undefined"
                :color="item.raw.trend > 0 ? 'success' : 'error'"
                size="small"
              >
                {{ item.raw.trend > 0 ? '+' : '' }}{{ item.raw.trend }}%
              </v-chip>
            </template>
            <template v-slot:item.created_at="{ item }">
              {{ item?.raw?.created_at || 'Не указано' }}
            </template>
            <template v-slot:item.type="{ item }">
              {{ item?.raw?.type || 'Неизвестно' }}
            </template>
            <template v-slot:item.description="{ item }">
              {{ item?.raw?.description || 'Нет описания' }}
            </template>
            <template v-slot:item.user="{ item }">
              {{ item?.raw?.user?.full_name || 'Системный пользователь' }}
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
          <v-list v-if="recentActions?.length">
            <template v-for="action in recentActions" :key="action?.id">
              <v-list-item
                v-if="action?.created_at"
                :subtitle="action.created_at || ''"
              >
                <template v-slot:prepend>
                  <v-icon :color="getActionColor(action?.type, action?.platform)">
                    {{ getActionIcon(action?.type, action?.platform) }}
                  </v-icon>
                </template>
                <v-list-item-title>{{ formatActionDescription(action) }}</v-list-item-title>
              </v-list-item>
            </template>
          </v-list>
          <v-card-text v-else class="text-center">
            <v-progress-circular
              v-if="loading"
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
import { adminService } from '@/services/api/admin.api'

// Регистрируем все компоненты Chart.js
Chart.register(...registerables)

/**
 * @typedef {import('@/modules/youtube/schemas/admin.schema').SystemStats} SystemStats
 * @typedef {import('@/modules/youtube/schemas/admin.schema').UserAction} UserAction
 */

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
    const loading = ref(false)
    const search = ref('')
    const selectedPeriod = ref('week')
    const selectedMetric = ref('users')
    const stats = ref([])

    // Заголовки таблицы
    const headers = ref([
      { title: 'Дата', key: 'created_at', align: 'start' },
      { title: 'Тип', key: 'type' },
      { title: 'Описание', key: 'description' },
      { title: 'Пользователь', key: 'user.full_name' }
    ])

    // Данные таблицы
    const tableData = ref([])

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

    // Данные из API
    /** @type {Ref<SystemStats>} */
    const systemStats = ref(null)
    /** @type {Ref<UserAction[]>} */
    const recentActions = ref([])

    // Комбинированная статистика
    const combinedStats = computed(() => {
      const stats = systemStats.value || {}
      const analytics = analyticsStore.getAnalyticsData() || {}
      
      return [
        {
          title: 'Всего пользователей',
          value: stats.totalUsers || 0,
          icon: 'mdi-account-group',
          color: 'primary',
          trend: typeof analytics.usersTrend === 'number' ? analytics.usersTrend : 0
        },
        {
          title: 'Активные конкурсы',
          value: stats.activeContests || 0,
          icon: 'mdi-trophy',
          color: 'success',
          trend: typeof analytics.contestsTrend === 'number' ? analytics.contestsTrend : 0
        },
        {
          title: 'Новые регистрации (24ч)',
          value: stats.newRegistrations || 0,
          icon: 'mdi-account-plus',
          color: 'info',
          trend: typeof analytics.registrationsTrend === 'number' ? analytics.registrationsTrend : 0
        },
        {
          title: 'Активность (1ч)',
          value: stats.userActivities || 0,
          icon: 'mdi-chart-timeline-variant',
          color: 'warning',
          trend: typeof analytics.activityTrend === 'number' ? analytics.activityTrend : 0
        }
      ]
    })

    // Дополнительная статистика конкурсов
    const contestStats = computed(() => {
      const stats = systemStats.value || {}
      
      return [
        {
          title: 'Всего просмотров',
          value: stats.totalViews || 0,
          icon: 'mdi-eye',
          color: 'purple'
        },
        {
          title: 'Всего участников',
          value: stats.totalParticipants || 0,
          icon: 'mdi-account-multiple',
          color: 'deep-purple'
        },
        {
          title: 'Средний рейтинг',
          value: (stats.averageRating || 0).toFixed(1),
          icon: 'mdi-star',
          color: 'amber'
        }
      ]
    })

    // Форматирование и отображение
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      
      try {
        // Если это уже объект Date
        if (dateStr instanceof Date) {
          return dateStr;
        }
        
        // Пробуем создать Date напрямую (для ISO строк)
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          return d;
        }
        
        // Если не получилось, пробуем парсить русский формат
        const months = {
          'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3,
          'мая': 4, 'июня': 5, 'июля': 6, 'августа': 7,
          'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
        };
        
        const regex = /(\d+)\s+(\w+)\s+(\d{4})\s*(?:г\.)?\s*(?:в)?\s*(\d{1,2}):(\d{2})/;
        const match = dateStr.match(regex);
        
        if (match) {
          const [_, day, monthStr, year, hours, minutes] = match;
          const monthIndex = months[monthStr.toLowerCase()];
          
          if (monthIndex !== undefined) {
            const d = new Date(year, monthIndex, day, hours, minutes);
            if (!isNaN(d.getTime())) {
              return d;
            }
          }
        }
        
        return null;
      } catch (error) {
        return null;
      }
    };

    const formatDate = (date) => {
      if (!date) return 'Не указано';
      
      try {
        const parsedDate = parseDate(date);
        if (!parsedDate) {
          return date;
        }
        
        return new Intl.DateTimeFormat('ru', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(parsedDate);
      } catch (error) {
        return date;
      }
    };

    const getActionIcon = (type, platform) => {
      const icons = {
        'user_login': 'mdi-login',
        'user_register': 'mdi-account-plus',
        'contest_create': 'mdi-trophy-outline',
        'contest_update': 'mdi-trophy',
        'submission_create': 'mdi-file-upload',
        'youtube': 'mdi-youtube',
        'instagram': 'mdi-instagram',
        'unknown': 'mdi-help-circle'
      }
      return icons[type] || icons[platform] || icons['unknown']
    }

    const getActionColor = (type, platform) => {
      const colors = {
        'user_login': 'primary',
        'user_register': 'success',
        'contest_create': 'info',
        'contest_update': 'warning',
        'submission_create': 'error',
        'youtube': 'error',
        'instagram': 'purple',
        'unknown': 'grey'
      }
      return colors[type] || colors[platform] || colors['unknown']
    }

    const formatActionDescription = (action) => {
      if (!action) return 'Неизвестное действие';
      
      const userName = action.user?.full_name || 'Системный пользователь';
      const metadata = action.action_data || {};
      
      if (action.platform === 'youtube') {
        return metadata.title || 'Синхронизация YouTube';
      }
      
      if (action.platform === 'instagram') {
        return metadata.title || 'Поиск в Instagram';
      }
      
      const descriptions = {
        'user_login': `Пользователь ${userName} вошел в систему`,
        'user_register': `Новая регистрация: ${userName}`,
        'contest_create': `Создан новый конкурс: ${metadata.title || 'Без названия'}`,
        'contest_update': `Обновлен конкурс: ${metadata.title || 'Без названия'}`,
        'submission_create': `Новое решение от ${userName}`,
        'unknown': `${metadata.title || metadata.message || 'Неизвестное действие'}`
      };
      
      const actionType = action.action_type || action.type || 'unknown';
      return descriptions[actionType] || descriptions['unknown'];
    }

    // Методы
    const updateData = async () => {
      loading.value = true
      try {
        const [statsResponse, actionsResponse] = await Promise.all([
          adminService.getSystemStats(),
          adminService.getRecentActions()
        ])

        systemStats.value = statsResponse?.data || null
        
        // Фильтруем null и undefined значения, а также проверяем наличие created_at
        const filteredActions = (Array.isArray(actionsResponse?.data) ? actionsResponse.data : [])
          .filter(action => {
            if (!action) return false;
            
            // Проверяем наличие хотя бы одного валидного поля даты
            const creationDate = action.created_at || action.createdAt || action.action_data?.created_at;
            const parsedDate = parseDate(creationDate);
            
            return parsedDate !== null;
          })
          .map(action => {
            const creationDate = action.created_at || action.createdAt || action.action_data?.created_at;
            const formattedDate = formatDate(creationDate);
            
            return {
              ...action,
              created_at: formattedDate,
              raw_date: parseDate(creationDate), // Сохраняем распарсенную дату для сортировки
              type: action.action_type || action.type || 'unknown',
              platform: action.platform || '',
              action_data: action.action_data || {},
              user: action.user || {
                id: action.user_id || '',
                full_name: 'Системный пользователь',
                email: 'system@example.com'
              }
            };
          })
          .sort((a, b) => b.raw_date - a.raw_date); // Сортируем по дате от новых к старым
        
        recentActions.value = filteredActions
        
        // Обновляем данные таблицы с проверкой на null
        tableData.value = filteredActions
          .filter(Boolean)
          .map(action => {
            if (!action) return null;
            
            return {
              created_at: action.created_at,
              type: action.type,
              description: formatActionDescription(action),
              user: action.user
            };
          })
          .filter(Boolean);

        // Обновляем графики
        updateCharts()
      } catch (error) {
        console.error('Ошибка при обновлении данных:', error)
      } finally {
        loading.value = false
      }
    }

    const refreshActions = async () => {
      try {
        const { data } = await adminService.getRecentActions()
        
        // Фильтруем null и undefined значения, а также проверяем наличие created_at
        const filteredActions = (Array.isArray(data) ? data : [])
          .filter(action => {
            const isValid = action && action.id && (
              action.created_at || 
              action.createdAt || 
              action.action_data?.created_at
            )
            return isValid;
          })
          .map(action => ({
            ...action,
            created_at: formatDate(action.created_at || action.createdAt || action.action_data?.created_at),
            type: action.action_type || action.type || 'unknown',
            platform: action.platform || '',
            action_data: action.action_data || {},
            user: action.user || {
              id: action.user_id || '',
              full_name: 'Системный пользователь',
              email: 'system@example.com'
            }
          }))
        
        recentActions.value = filteredActions
        
        // Обновляем данные таблицы с проверкой на null
        tableData.value = filteredActions
          .filter(Boolean)
          .map(action => ({
            created_at: action.created_at,
            type: action.type,
            description: formatActionDescription(action),
            user: action.user
          }))
          .filter(Boolean)
      } catch (error) {
        console.error('Ошибка при обновлении действий:', error)
      }
    }

    // Обновление графиков
    const updateCharts = () => {
      if (activityChartInstance) {
        activityChartInstance.destroy()
      }
      if (metricsChartInstance) {
        metricsChartInstance.destroy()
      }

      // Инициализация графика активности
      if (activityChart.value) {
        const validActions = recentActions.value.filter(action => action && action.created_at)
        const ctx = activityChart.value.getContext('2d')
        activityChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: validActions.map(action => action.created_at).reverse(),
            datasets: [{
              label: 'Активность',
              data: validActions.map((_, index) => index + 1).reverse(),
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        })
      }

      // Инициализация графика метрик
      if (metricsChart.value) {
        const stats = systemStats.value || {}
        const ctx = metricsChart.value.getContext('2d')
        metricsChartInstance = new Chart(ctx, {
          type: chartType.value,
          data: {
            labels: ['Пользователи', 'Конкурсы', 'Просмотры', 'Участники', 'Рейтинг'],
            datasets: [{
              label: 'Значения',
              data: [
                stats.totalUsers || 0,
                stats.activeContests || 0,
                stats.totalViews || 0,
                stats.totalParticipants || 0,
                stats.averageRating || 0
              ],
              backgroundColor: [
                'rgba(54, 162, 235, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(255, 159, 64, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 205, 86, 0.5)'
              ],
              borderColor: [
                'rgb(54, 162, 235)',
                'rgb(75, 192, 192)',
                'rgb(255, 159, 64)',
                'rgb(153, 102, 255)',
                'rgb(255, 205, 86)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        })
      }
    }

    // Инициализация при монтировании
    onMounted(async () => {
      await updateData()
      
      // Устанавливаем интервал обновления данных
      const updateInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          updateData()
        }
      }, 300000) // Обновление каждые 5 минут

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
      loading,
      search,
      selectedPeriod,
      selectedMetric,
      timeRange,
      chartType,
      
      // Данные
      systemStats,
      recentActions,
      combinedStats,
      contestStats,
      periods,
      metrics,
      headers,
      tableData,
      
      // Методы
      updateData,
      refreshActions,
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
