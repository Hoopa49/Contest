<!-- 
  PrizeDistribution.vue
  Компонент для отображения распределения призов конкурса.
  Включает общую сумму призового фонда и распределение по местам.
-->
<template>
  <div class="prize-distribution">
    <!-- Общая сумма -->
    <v-card
      class="mb-4"
      variant="outlined"
    >
      <v-card-text class="text-center">
        <div class="text-h6 mb-2">
          Общий призовой фонд
        </div>
        <div class="text-h4 font-weight-bold text-primary">
          {{ formatPrizeValue(totalValue) }}
        </div>
        <div 
          v-if="prizes.length"
          class="text-caption text-medium-emphasis mt-2"
        >
          {{ totalPrizes }}
        </div>
      </v-card-text>
    </v-card>

    <!-- Распределение -->
    <v-card variant="outlined">
      <v-card-title class="d-flex align-center">
        <v-icon
          icon="mdi-chart-pie"
          color="primary"
          class="mr-2"
        />
        Распределение призов
      </v-card-title>

      <v-card-text>
        <!-- График распределения -->
        <div class="distribution-chart">
          <div
            v-for="prize in sortedPrizes"
            :key="prize.id"
            class="distribution-item"
          >
            <div class="d-flex align-center justify-space-between mb-1">
              <div class="text-caption">
                {{ prize.title }}
              </div>
              <div class="text-caption font-weight-medium">
                {{ formatPrizeValue(prize.value) }}
              </div>
            </div>
            <v-progress-linear
              :model-value="getPrizePercentage(prize)"
              :color="getPrizeColor(prize.type)"
              height="8"
              rounded
            >
              <template v-slot:default="{ value }">
                <span class="distribution-percentage">{{ Math.round(value) }}%</span>
              </template>
            </v-progress-linear>
          </div>
        </div>

        <!-- Дополнительная информация -->
        <v-alert
          v-if="note"
          type="info"
          variant="tonal"
          class="mt-4 mb-0"
          density="comfortable"
        >
          <template v-slot:prepend>
            <v-icon>mdi-information</v-icon>
          </template>
          {{ note }}
        </v-alert>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  prizes: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(prize => {
        return typeof prize === 'object' &&
          'title' in prize &&
          'value' in prize &&
          'type' in prize
      })
    }
  },
  note: {
    type: String,
    default: ''
  }
})

// Вычисляемые свойства
const totalValue = computed(() => {
  return props.prizes.reduce((sum, prize) => {
    return sum + (typeof prize.value === 'number' ? prize.value : 0)
  }, 0)
})

const sortedPrizes = computed(() => {
  return [...props.prizes].sort((a, b) => {
    // Сначала по типу (main > special > additional)
    const typeOrder = { main: 0, special: 1, additional: 2 }
    const typeCompare = typeOrder[a.type] - typeOrder[b.type]
    if (typeCompare !== 0) return typeCompare
    
    // Затем по позиции
    if (a.position && b.position) {
      return a.position - b.position
    }
    
    // Затем по стоимости
    return b.value - a.value
  })
})

const totalPrizes = computed(() => {
  const count = props.prizes.length
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return `${count} призов`
  }

  switch (lastDigit) {
    case 1:
      return `${count} приз`
    case 2:
    case 3:
    case 4:
      return `${count} приза`
    default:
      return `${count} призов`
  }
})

// Методы
const formatPrizeValue = (value) => {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(value)
  }
  return value
}

const getPrizeColor = (type) => {
  switch (type) {
    case 'main': return 'warning'
    case 'special': return 'primary'
    case 'additional': return 'success'
    default: return 'grey'
  }
}

const getPrizePercentage = (prize) => {
  if (totalValue.value === 0) return 0
  return (prize.value / totalValue.value) * 100
}
</script>

<style scoped>
.prize-distribution {
  max-width: 600px;
  margin: 0 auto;
}

.distribution-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.distribution-item {
  position: relative;
}

.distribution-percentage {
  position: absolute;
  right: 0;
  font-size: 10px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

/* Анимации */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

/* Адаптивность */
@media (max-width: 600px) {
  .prize-distribution {
    margin: 0;
  }
}
</style> 