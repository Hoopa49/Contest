<template>
  <div class="youtube-stats">
    <v-row>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-h6">Всего конкурсов</div>
            <div class="text-h4">{{ formatNumber(stats.total_contests) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-h6">Активных конкурсов</div>
            <div class="text-h4">{{ formatNumber(stats.active_contests) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-h6">Каналов с конкурсами</div>
            <div class="text-h4">{{ formatNumber(stats.channels_count) }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-h6">Средний призовой фонд</div>
            <div class="text-h4">{{ formatNumber(stats.avg_prize_value) }} ₽</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="mt-4">
      <v-card-title>
        Активность за последние 30 дней
        <v-spacer></v-spacer>
        <v-btn-toggle v-model="selectedMetric" mandatory>
          <v-btn value="contests">
            <v-icon start>mdi-trophy</v-icon>
            Конкурсы
          </v-btn>
          <v-btn value="views">
            <v-icon start>mdi-eye</v-icon>
            Просмотры
          </v-btn>
          <v-btn value="participants">
            <v-icon start>mdi-account-group</v-icon>
            Участники
          </v-btn>
        </v-btn-toggle>
      </v-card-title>
      <v-card-text>
        <canvas ref="activityChart" height="400"></canvas>
      </v-card-text>
    </v-card>

    <v-card class="mt-4">
      <v-card-title>Популярные типы конкурсов</v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item v-for="type in contestTypes" :key="type.name">
            <template v-slot:prepend>
              <v-icon>mdi-trophy</v-icon>
            </template>
            <v-list-item-title>{{ type.name }}</v-list-item-title>
            <template v-slot:append>
              <v-chip color="primary">
                {{ type.count }} ({{ type.percentage }}%)
              </v-chip>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Chart } from 'chart.js/auto'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

const props = defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({
      total_contests: 0,
      active_contests: 0,
      channels_count: 0,
      avg_prize_value: 0,
      contest_types: [],
      daily_stats: []
    })
  }
})

const activityChart = ref(null)
const selectedMetric = ref('contests')
let chart = null

// Преобразуем данные о типах конкурсов
const contestTypes = computed(() => {
  if (!props.stats.contest_types || !Array.isArray(props.stats.contest_types)) {
    console.log('Нет данных о типах конкурсов')
    return []
  }
  return props.stats.contest_types
})

// Преобразуем данные для графика
const chartData = computed(() => {
  if (!props.stats.daily_stats || !Array.isArray(props.stats.daily_stats)) {
    console.log('Нет данных для графика')
    return { labels: [], datasets: [] }
  }
  
  const labels = props.stats.daily_stats.map(day => {
    try {
      return format(new Date(day.date), 'd MMM', { locale: ru })
    } catch (e) {
      console.error('Ошибка при форматировании даты:', e)
      return 'Неизвестная дата'
    }
  })
  
  const data = {
    labels,
    datasets: [{
      label: selectedMetric.value === 'contests' ? 'Конкурсы' :
             selectedMetric.value === 'views' ? 'Просмотры' : 'Участники',
      data: props.stats.daily_stats.map(day => 
        selectedMetric.value === 'contests' ? day.contests :
        selectedMetric.value === 'views' ? day.views : day.participants
      ),
      borderColor: selectedMetric.value === 'contests' ? '#1976D2' :
                  selectedMetric.value === 'views' ? '#4CAF50' : '#FF9800',
      backgroundColor: selectedMetric.value === 'contests' ? '#1976D233' :
                      selectedMetric.value === 'views' ? '#4CAF5033' : '#FF980033',
      fill: true,
      tension: 0.4
    }]
  }
  
  return data
})

const updateChart = () => {
  if (chart) {
    chart.destroy()
  }
  
  const ctx = activityChart.value.getContext('2d')
  chart = new Chart(ctx, {
    type: 'line',
    data: chartData.value,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: '#f0f0f0'
          }
        }
      },
      plugins: {
        legend: {
          display: false
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

const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  return new Intl.NumberFormat('ru-RU').format(num)
}

watch(() => props.stats.daily_stats, () => {
  console.log('Данные статистики обновлены:', props.stats.daily_stats)
  if (chart) {
    updateChart()
  }
}, { deep: true })

watch(() => selectedMetric.value, () => {
  if (chart) {
    updateChart()
  }
})

onMounted(() => {
  console.log('Компонент смонтирован, данные:', props.stats)
  if (activityChart.value) {
    updateChart()
  }
})
</script>

<style scoped>
.youtube-stats {
  padding: 16px;
}

.v-card {
  height: 100%;
}

.v-card-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

.text-h4 {
  margin-top: 8px;
  font-weight: bold;
}

canvas {
  width: 100% !important;
  height: 400px !important;
}
</style> 