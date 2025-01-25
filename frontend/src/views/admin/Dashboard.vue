<!-- 
  Компонент админ-панели
  Отображает статистику и управление системой
-->
<template>
  <v-container fluid>
    <!-- Вкладки -->
    <v-tabs v-model="activeTab" color="primary" @update:modelValue="handleTabChange">
      <v-tab value="dashboard">
        <v-icon start>mdi-view-dashboard</v-icon>
        Дашборд
      </v-tab>
      <v-tab value="users">
        <v-icon start>mdi-account-group</v-icon>
        Пользователи
      </v-tab>
      <v-tab value="integrations">
        <v-icon start>mdi-connection</v-icon>
        Интеграции
      </v-tab>
      <v-tab value="settings">
        <v-icon start>mdi-cog</v-icon>
        Настройки
      </v-tab>
      <v-tab value="logs">
        <v-icon start>mdi-text-box-search</v-icon>
        Логи
      </v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <!-- Дашборд -->
      <v-window-item value="dashboard">
        <!-- Верхние карточки со статистикой -->
        <v-row>
          <v-col v-for="stat in stats" :key="stat.title" cols="12" md="3">
            <v-card>
              <v-card-text>
                <div class="d-flex align-center">
                  <div>
                    <div class="text-h6">{{ stat.title }}</div>
                    <div class="text-h4">{{ stat.value }}</div>
                  </div>
                  <v-spacer></v-spacer>
                  <v-icon size="48" :color="stat.color">{{ stat.icon }}</v-icon>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Графики и таблицы -->
        <v-row>
          <!-- График активности -->
          <v-col cols="12" md="8">
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
      </v-window-item>

      <!-- Пользователи -->
      <v-window-item value="users">
        <v-card>
          <v-card-title>
            Управление пользователями
            <v-spacer></v-spacer>
            <v-text-field
              v-model="userSearch"
              append-icon="mdi-magnify"
              label="Поиск"
              single-line
              hide-details
              density="compact"
            ></v-text-field>
          </v-card-title>
          <v-data-table
            :headers="userHeaders"
            :items="users"
            :search="userSearch"
            :loading="isLoading"
            :no-data-text="isLoading ? 'Загрузка...' : 'Нет данных'"
            :loading-text="'Загрузка...'"
          >
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="!item?.raw?.is_blocked ? 'success' : 'error'"
                size="small"
              >
                {{ !item?.raw?.is_blocked ? 'Активен' : 'Заблокирован' }}
              </v-chip>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn
                icon
                variant="text"
                size="small"
                :color="!item?.raw?.is_blocked ? 'error' : 'success'"
                @click="toggleUserStatus(item?.raw?.id)"
              >
                <v-icon>{{ !item?.raw?.is_blocked ? 'mdi-lock' : 'mdi-lock-open' }}</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>

      <!-- Интеграции -->
      <v-window-item value="integrations">
        <platform-integrations />
      </v-window-item>

      <!-- Настройки -->
      <v-window-item value="settings">
        <v-card>
          <v-card-title>
            Настройки системы
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="saveSettings"
              :loading="isSaving"
              :disabled="!hasSettingsChanged"
            >
              Сохранить
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-form ref="settingsForm">
              <v-text-field
                v-model="settings.site_name"
                label="Название сайта"
                :rules="[v => !!v || 'Обязательное поле']"
                hint="Название сайта отображается в заголовке браузера, используется в email-уведомлениях и других системных сообщениях"
                persistent-hint
              ></v-text-field>
              <v-switch
                v-model="settings.maintenance_mode"
                label="Режим обслуживания"
                color="warning"
                hint="При включении этого режима сайт будет доступен только администраторам. Обычные пользователи увидят сообщение о техническом обслуживании."
                persistent-hint
              ></v-switch>
              <v-switch
                v-model="settings.registration_enabled"
                label="Регистрация пользователей"
                color="success"
                hint="Разрешить новым пользователям регистрироваться на сайте"
                persistent-hint
              ></v-switch>
            </v-form>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- Логи -->
      <v-window-item value="logs">
        <v-card>
          <v-card-title>
            Системные логи
            <v-spacer></v-spacer>
            <v-text-field
              v-model="logSearch"
              append-icon="mdi-magnify"
              label="Поиск"
              single-line
              hide-details
              density="compact"
            ></v-text-field>
          </v-card-title>
          <v-data-table
            :headers="logHeaders"
            :items="logs"
            :search="logSearch"
            :loading="isLoading"
          >
            <template v-slot:item.type="{ item }">
              <v-chip
                :color="getActionColor(item.raw.type)"
                size="small"
              >
                {{ item.raw.type }}
              </v-chip>
            </template>
            <template v-slot:item.created_at="{ item }">
              {{ formatDate(item.raw.created_at) }}
            </template>
          </v-data-table>
        </v-card>
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { useRoute, useRouter } from 'vue-router'
import { Chart, registerables } from 'chart.js'
import { PlatformIntegrations } from '@/components/features/platforms'

// Регистрируем все компоненты Chart.js
Chart.register(...registerables)

export default {
  name: 'AdminDashboard',
  components: {
    PlatformIntegrations
  },
  
  setup() {
    const adminStore = useAdminStore()
    const route = useRoute()
    const router = useRouter()
    const activityChart = ref(null)
    const timeRange = ref('week')
    const error = ref(null)
    const settingsForm = ref(null)
    let chartInstance = null

    // Состояние компонента
    const userSearch = ref('')
    const logSearch = ref('')
    const isSaving = ref(false)
    const originalSettings = ref(null)

    // Активная вкладка из хранилища
    const activeTab = ref(route.meta.tab || 'dashboard')

    // Данные из хранилища
    const systemStats = computed(() => adminStore.getSystemStats || {})
    const recentActions = computed(() => adminStore.getRecentActions || [])
    const users = computed(() => {
      const usersList = adminStore.getUsers() || []
      return usersList.map(user => ({
        ...user,
        // Используем is_active напрямую
        is_active: user.is_active
      }))
    })
    const logs = computed(() => adminStore.getLogs() || [])
    const settings = ref({
      site_name: '',
      maintenance_mode: false,
      registration_enabled: true
    })
    const isLoading = computed(() => adminStore.getLoadingStatus)

    // Проверка изменений в настройках
    const hasSettingsChanged = computed(() => {
      if (!originalSettings.value) return false
      return JSON.stringify(settings.value) !== JSON.stringify(originalSettings.value)
    })

    // Заголовки таблицы пользователей
    const userHeaders = [
      { title: 'ID', key: 'id', sortable: true },
      { title: 'Имя', key: 'first_name', sortable: true },
      { title: 'Фамилия', key: 'last_name', sortable: true },
      { title: 'Email', key: 'email', sortable: true },
      { title: 'Роль', key: 'role', sortable: true },
      { title: 'Статус', key: 'status', sortable: true },
      { title: 'Действия', key: 'actions', sortable: false }
    ]

    // Заголовки таблицы логов
    const logHeaders = [
      { title: 'ID', key: 'id', sortable: true },
      { title: 'Тип', key: 'type', sortable: true },
      { title: 'Действие', key: 'action', sortable: true },
      { title: 'Пользователь', key: 'user_id', sortable: true },
      { title: 'IP', key: 'ip_address', sortable: true },
      { title: 'Дата', key: 'created_at', sortable: true }
    ]

    // Форматированные действия
    const formattedActions = computed(() => {
      if (!recentActions.value || !Array.isArray(recentActions.value)) {
        return []
      }
      return recentActions.value.map(action => ({
        ...action,
        description: formatActionDescription(action)
      }))
    })

    // Форматирование описания действия
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

    // Форматирование даты
    const formatDate = (date) => {
      return new Date(date).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Форматированная статистика для карточек
    const stats = computed(() => [
      {
        title: 'Всего пользователей',
        value: systemStats.value?.totalUsers || 0,
        icon: 'mdi-account-group',
        color: 'primary'
      },
      {
        title: 'Активные конкурсы',
        value: systemStats.value?.activeContests || 0,
        icon: 'mdi-trophy',
        color: 'success'
      },
      {
        title: 'Новые регистрации',
        value: systemStats.value?.newRegistrations || 0,
        icon: 'mdi-account-plus',
        color: 'info'
      },
      {
        title: 'API запросы/час',
        value: systemStats.value?.apiRequestsPerHour || 0,
        icon: 'mdi-api',
        color: 'warning'
      }
    ])

    // Инициализация графика
    const initChart = () => {
      if (!activityChart.value) return // Проверяем существование ссылки на canvas
      
      const ctx = activityChart.value.getContext('2d')
      if (!ctx) return // Проверяем получение контекста
      
      // Уничтожаем предыдущий экземпляр графика если он существует
      if (chartInstance) {
        chartInstance.destroy()
      }

      chartInstance = new Chart(ctx, {
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

    // Обновление статистики
    const refreshStats = async () => {
      try {
        await adminStore.fetchSystemStats()
      } catch (err) {
        console.error('Error fetching system stats:', err)
        error.value = 'Ошибка при загрузке статистики системы'
      }
    }

    // Обновление последних действий
    const refreshActions = async () => {
      try {
        await adminStore.fetchRecentActions()
      } catch (err) {
        console.error('Error fetching recent actions:', err)
        error.value = 'Ошибка при загрузке последних действий'
      }
    }

    // Переключение статуса пользователя
    const toggleUserStatus = async (userId) => {
      try {
        await adminStore.toggleUserStatus(userId)
        // Обновляем список пользователей после изменения статуса
        await adminStore.fetchUsers()
      } catch (err) {
        console.error('Error toggling user status:', err)
        error.value = 'Ошибка при изменении статуса пользователя'
      }
    }

    // Загрузка настроек
    const loadSettings = async () => {
      try {
        const response = await adminStore.fetchSettings()
        settings.value = { ...response }
        originalSettings.value = { ...response }
      } catch (err) {
        console.error('Error loading settings:', err)
        error.value = 'Ошибка при загрузке настроек'
      }
    }

    // Сохранение настроек
    const saveSettings = async () => {
      if (!settingsForm.value.validate()) return

      try {
        isSaving.value = true
        await adminStore.updateSettings(settings.value)
        originalSettings.value = { ...settings.value }
      } catch (err) {
        console.error('Error saving settings:', err)
        error.value = 'Ошибка при сохранении настроек'
      } finally {
        isSaving.value = false
      }
    }

    // Загрузка логов
    const loadLogs = async () => {
      try {
        await adminStore.fetchLogs()
      } catch (err) {
        console.error('Error loading logs:', err)
        error.value = 'Ошибка при загрузке логов'
      }
    }

    // Инициализация при монтировании
    onMounted(() => {
      // Инициализируем активную вкладку из URL если есть, иначе используем dashboard
      const hash = window.location.hash.slice(1)
      if (hash && ['dashboard', 'users', 'settings', 'logs'].includes(hash)) {
        adminStore.setActiveTab(hash)
        // Загружаем данные в зависимости от активной вкладки
        if (hash === 'users') {
          adminStore.fetchUsers()
        }
      } else {
        adminStore.setActiveTab('dashboard')
      }
      
      refreshStats()
      refreshActions()
      
      // Инициализируем график только если мы на вкладке dashboard
      if (activeTab.value === 'dashboard') {
        // Используем nextTick чтобы убедиться что DOM обновлен
        nextTick(() => {
          initChart()
        })
      }
      
      loadSettings()
      loadLogs()
    })

    // Наблюдение за изменением вкладки
    watch(activeTab, (newTab) => {
      // Обновляем URL при смене вкладки
      window.location.hash = newTab
      
      if (newTab === 'users') {
        adminStore.fetchUsers()
      } else if (newTab === 'dashboard') {
        // Инициализируем график при переключении на dashboard
        nextTick(() => {
          initChart()
        })
      }
    })

    // Обработчик изменения вкладки
    const handleTabChange = (tab) => {
      router.push({ name: `admin-${tab}` })
    }

    // Следим за изменениями маршрута
    watch(() => route.meta.tab, (newTab) => {
      if (newTab) {
        activeTab.value = newTab
      }
    })

    return {
      stats,
      timeRange,
      activityChart,
      formattedActions,
      refreshActions,
      isLoading,
      error,
      formatDate,
      getActionIcon,
      getActionColor,
      formatActionDescription,
      activeTab,
      userSearch,
      logSearch,
      users,
      logs,
      settings,
      userHeaders,
      logHeaders,
      toggleUserStatus,
      saveSettings,
      settingsForm,
      isSaving,
      hasSettingsChanged,
      handleTabChange
    }
  }
}
</script>
