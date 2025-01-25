<template>
  <v-container>
    <!-- Фильтры периода -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="4">
            <v-select
              v-model="period"
              :items="periodOptions"
              label="Период"
              @change="updateAnalytics"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-menu
              ref="startMenu"
              v-model="startMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="dateRange.start"
                  label="Начало периода"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="props"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="dateRange.start"
                @input="startMenu = false"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col cols="12" md="4">
            <v-menu
              ref="endMenu"
              v-model="endMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="dateRange.end"
                  label="Конец периода"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="props"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="dateRange.end"
                @input="endMenu = false"
              ></v-date-picker>
            </v-menu>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Основные метрики -->
    <v-row>
      <v-col cols="12" md="3" v-for="metric in metrics" :key="metric.title">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h6">{{ metric.title }}</div>
                <div class="text-h4">{{ metric.value }}</div>
              </div>
              <v-icon
                :color="metric.trend > 0 ? 'success' : 'error'"
                size="36"
              >
                {{ metric.trend > 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
              </v-icon>
            </div>
            <div class="text-caption">
              {{ metric.trend > 0 ? '+' : '' }}{{ metric.trend }}% по сравнению с прошлым периодом
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Графики -->
    <v-row class="mt-4">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>
            Активность пользователей
            <v-spacer></v-spacer>
            <v-btn-toggle v-model="userActivityType" mandatory>
              <v-btn value="registrations">Регистрации</v-btn>
              <v-btn value="contests">Участие в конкурсах</v-btn>
            </v-btn-toggle>
          </v-card-title>
          <v-card-text>
            <canvas ref="userActivityChart"></canvas>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>
            Распределение по платформам
          </v-card-title>
          <v-card-text>
            <canvas ref="platformChart"></canvas>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Таблица топ конкурсов -->
    <v-card class="mt-4">
      <v-card-title>
        Топ конкурсов
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Поиск"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="contestHeaders"
        :items="topContests"
        :search="search"
        :loading="loading"
      >
        <template v-slot:item.platform="{ item }">
          <v-chip :color="getPlatformColor(item.platform)">
            {{ item.platform }}
          </v-chip>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { Chart } from 'chart.js'
import { useAdminStore } from '@/stores/admin'

export default {
  name: 'Analytics',
  setup() {
    const adminStore = useAdminStore()
    const loading = ref(false)
    const period = ref('week')
    const startMenu = ref(false)
    const endMenu = ref(false)
    const userActivityType = ref('registrations')
    const search = ref('')

    const periodOptions = [
      { title: 'Сегодня', value: 'day' },
      { title: 'Неделя', value: 'week' },
      { title: 'Месяц', value: 'month' },
      { title: 'Год', value: 'year' },
      { title: 'Произвольный период', value: 'custom' }
    ]

    const dateRange = reactive({
      start: null,
      end: null
    })

    const metrics = ref([
      { title: 'Новые пользователи', value: 0, trend: 0 },
      { title: 'Активные конкурсы', value: 0, trend: 0 },
      { title: 'Участия', value: 0, trend: 0 },
      { title: 'Конверсия', value: '0%', trend: 0 }
    ])

    const contestHeaders = [
      { title: 'Название', key: 'title' },
      { title: 'Платформа', key: 'platform' },
      { title: 'Участников', key: 'participants' },
      { title: 'Просмотров', key: 'views' },
      { title: 'Конверсия', key: 'conversion' }
    ]

    const topContests = ref([])

    // Методы
    const updateAnalytics = async () => {
      loading.value = true
      try {
        const data = await adminStore.getAnalytics({
          period: period.value,
          dateRange: dateRange
        })
        // Обновление данных на графиках и в таблицах
      } catch (error) {
        console.error('Failed to load analytics:', error)
      } finally {
        loading.value = false
      }
    }

    const getPlatformColor = (platform) => {
      const colors = {
        youtube: 'red',
        instagram: 'purple',
        telegram: 'blue',
        vk: 'blue-darken-2'
      }
      return colors[platform.toLowerCase()] || 'grey'
    }

    // Наблюдатели
    watch([period, dateRange], () => {
      updateAnalytics()
    })

    onMounted(() => {
      updateAnalytics()
    })

    return {
      loading,
      period,
      periodOptions,
      startMenu,
      endMenu,
      dateRange,
      metrics,
      userActivityType,
      search,
      contestHeaders,
      topContests,
      getPlatformColor,
      updateAnalytics
    }
  }
}
</script> 