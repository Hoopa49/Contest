<!-- 
  ContestStats.vue
  Компонент для отображения статистики конкурса:
  - Общее количество участников
  - Количество просмотров
  - Рейтинг конкурса
  - Количество добавлений в избранное
  - График активности
-->
<template>
  <v-card class="mb-4">
    <v-card-title class="text-h6">
      Статистика
    </v-card-title>
    
    <v-card-text>
      <v-row>
        <v-col cols="6" sm="3">
          <v-card variant="outlined">
            <v-card-text class="text-center">
              <div class="text-h5 mb-1">{{ participantsCount }}</div>
              <div class="text-caption">Участников</div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="6" sm="3">
          <v-card variant="outlined">
            <v-card-text class="text-center">
              <div class="text-h5 mb-1">{{ viewsCount }}</div>
              <div class="text-caption">Просмотров</div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="6" sm="3">
          <v-card variant="outlined">
            <v-card-text class="text-center">
              <div class="text-h5 mb-1">{{ favoritesCount }}</div>
              <div class="text-caption">В избранном</div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="6" sm="3">
          <v-card variant="outlined">
            <v-card-text class="text-center">
              <div class="text-h5 mb-1">{{ rating || '—' }}</div>
              <div class="text-caption">Рейтинг</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <div v-if="activityData.length" class="mt-4">
        <div class="text-subtitle-1 mb-2">Активность участников</div>
        <div style="height: 200px">
          <canvas ref="chartRef"></canvas>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  participantsCount: {
    type: Number,
    required: true
  },
  viewsCount: {
    type: Number,
    required: true
  },
  favoritesCount: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  activityData: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(item => 
        typeof item.date === 'string' && 
        typeof item.count === 'number'
      )
    }
  }
})

// Создаем ref для canvas элемента
const chartRef = ref(null)
let chart = null

// Конфигурация графика
const chartConfig = computed(() => ({
  type: 'line',
  data: {
    labels: props.activityData.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [{
      label: 'Активность',
      data: props.activityData.map(item => item.count),
      fill: true,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.4,
      backgroundColor: 'rgba(75, 192, 192, 0.2)'
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  }
}))

// Инициализация графика
onMounted(() => {
  if (chartRef.value) {
    chart = new Chart(chartRef.value, chartConfig.value)
  }
})

// Обновление графика при изменении данных
watch(() => props.activityData, () => {
  if (chart) {
    chart.data = chartConfig.value.data
    chart.update()
  }
}, { deep: true })

// Очистка при размонтировании
onUnmounted(() => {
  if (chart) {
    chart.destroy()
  }
})
</script>

<style scoped>
.v-card-text {
  padding: 12px;
}
</style> 