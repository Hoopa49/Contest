<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      Активность
      <v-spacer></v-spacer>
      <v-select
        v-model="period"
        :items="periods"
        density="compact"
        variant="outlined"
        hide-details
        class="period-select"
        style="max-width: 150px"
      ></v-select>
    </v-card-title>

    <v-card-text>
      <canvas ref="chartRef" height="300"></canvas>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'
import { useUserStore } from '@/stores/user'

export default {
  name: 'ActivityChart',

  setup() {
    const userStore = useUserStore()
    const chartRef = ref(null)
    const chart = ref(null)
    const period = ref('week')

    const periods = [
      { title: 'Неделя', value: 'week' },
      { title: 'Месяц', value: 'month' },
      { title: 'Год', value: 'year' }
    ]

    const initChart = () => {
      const ctx = chartRef.value.getContext('2d')
      chart.value = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Активность',
            data: [],
            borderColor: '#1976D2',
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
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
      })
    }

    const updateChart = async () => {
      try {
        const data = await userStore.getUserActivity(period.value)
        chart.value.data.labels = data.labels
        chart.value.data.datasets[0].data = data.values
        chart.value.update()
      } catch (error) {
        console.error('Failed to update activity chart:', error)
      }
    }

    watch(period, () => {
      updateChart()
    })

    onMounted(() => {
      initChart()
      updateChart()
    })

    return {
      chartRef,
      period,
      periods
    }
  }
}
</script>

<style scoped>
.period-select {
  min-width: 120px;
}
</style> 