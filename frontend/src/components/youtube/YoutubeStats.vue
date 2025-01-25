<template>
  <div class="youtube-stats">
    <v-row>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-h6">Всего конкурсов</div>
            <div class="text-h4">{{ stats.total_contests || 0 }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-h6">Активных конкурсов</div>
            <div class="text-h4">{{ stats.active_contests || 0 }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-h6">Каналов с конкурсами</div>
            <div class="text-h4">{{ stats.channels_count || 0 }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text class="text-center">
            <div class="text-h6">Средний призовой фонд</div>
            <div class="text-h4">{{ formatNumber(stats.avg_prize_value || 0) }} ₽</div>
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
              <div class="d-flex align-center">
                <span class="mr-2">{{ type.count }}</span>
                <v-progress-linear
                  :model-value="type.percentage"
                  :color="getProgressColor(type.percentage)"
                  height="20"
                  rounded
                >
                  <template v-slot:default="{ value }">
                    <span>{{ Math.ceil(value) }}%</span>
                  </template>
                </v-progress-linear>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'

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
  
  const total = props.stats.contest_types.reduce((sum, type) => sum + (type.count || 0), 0)
  return props.stats.contest_types.map(type => ({
    name: type.name || 'Неизвестный тип',
    count: type.count || 0,
    percentage: total > 0 ? ((type.count || 0) / total) * 100 : 0
  }))
})

// Преобразуем данные для графика
const chartData = computed(() => {
  if (!props.stats.daily_stats || !Array.isArray(props.stats.daily_stats)) {
    console.log('Нет данных для графика');
    return { labels: [], datasets: [] };
  }
  
  const labels = props.stats.daily_stats.map(day => {
    try {
      return new Date(day.date).toLocaleDateString('ru-RU');
    } catch (e) {
      console.error('Ошибка при форматировании даты:', e);
      return 'Неизвестная дата';
    }
  });
  
  const data = {
    labels,
    datasets: [{
      label: selectedMetric.value === 'contests' ? 'Конкурсы' : 
             selectedMetric.value === 'views' ? 'Просмотры' : 'Участники',
      data: props.stats.daily_stats.map(day => {
        const value = day[selectedMetric.value];
        return typeof value === 'number' ? value : 0;
      }),
      borderColor: selectedMetric.value === 'contests' ? '#1976D2' :
                  selectedMetric.value === 'views' ? '#4CAF50' : '#FFC107',
      backgroundColor: selectedMetric.value === 'contests' ? 'rgba(25, 118, 210, 0.1)' :
                      selectedMetric.value === 'views' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 193, 7, 0.1)',
      tension: 0.1,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      fill: true
    }]
  };
  
  return data;
})

const updateChart = () => {
  if (!activityChart.value) {
    console.log('Canvas элемент не найден')
    return
  }

  if (chart) {
    chart.destroy()
  }

  // Находим максимальное значение для текущей метрики
  const maxValue = Math.max(...props.stats.daily_stats.map(day => day[selectedMetric.value] || 0))
  
  // Вычисляем оптимальный шаг для делений
  const calculateStepSize = (max) => {
    if (max <= 10) return 1
    if (max <= 100) return 10
    if (max <= 1000) return 100
    if (max <= 10000) return 1000
    return Math.pow(10, Math.floor(Math.log10(max / 10)))
  }

  const stepSize = calculateStepSize(maxValue)

  const ctx = activityChart.value.getContext('2d')
  chart = new Chart(ctx, {
    type: 'line',
    data: chartData.value,
    options: {
      responsive: true,
      maintainAspectRatio: false,
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
          padding: 10,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || ''
              if (label) {
                label += ': '
              }
              if (context.parsed.y !== null) {
                label += formatNumber(context.parsed.y)
              }
              return label
            }
          }
        }
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
          beginAtZero: true,
          grid: {
            color: 'rgba(200, 200, 200, 0.2)'
          },
          ticks: {
            callback: function(value) {
              return formatNumber(value)
            },
            stepSize: stepSize,
            maxTicksLimit: 10
          }
        }
      }
    }
  })
}

const getProgressColor = (percentage) => {
  if (percentage >= 70) return 'success'
  if (percentage >= 30) return 'warning'
  return 'error'
}

const formatNumber = (num) => {
  if (!num && num !== 0) return '0'
  return new Intl.NumberFormat('ru-RU').format(num)
}

watch(() => selectedMetric.value, () => {
  console.log('Метрика изменена:', selectedMetric.value)
  if (chart) {
    updateChart()
  }
})

watch(() => props.stats.daily_stats, () => {
  console.log('Данные статистики обновлены:', props.stats.daily_stats)
  if (chart) {
    updateChart()
  }
}, { deep: true })

onMounted(() => {
  console.log('Компонент смонтирован, данные:', props.stats)
  if (activityChart.value) {
    updateChart()
  }
})
</script>

<style scoped>
.v-progress-linear {
  width: 200px;
}
</style> 