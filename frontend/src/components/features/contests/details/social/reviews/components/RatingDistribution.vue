<!-- 
  RatingDistribution.vue
  Компонент для отображения распределения оценок.
  Показывает количество оценок каждого значения в виде прогресс-баров.
-->
<template>
  <div class="rating-distribution">
    <!-- Прогресс-бары для каждой оценки -->
    <div 
      v-for="rating in ratingBars" 
      :key="rating.value"
      class="rating-bar d-flex align-center mb-2"
    >
      <!-- Значение оценки -->
      <div class="rating-value mr-4">
        {{ rating.value }}
        <v-icon 
          icon="mdi-star" 
          color="warning" 
          size="small"
        />
      </div>

      <!-- Прогресс-бар -->
      <v-progress-linear
        :model-value="rating.percentage"
        :color="rating.color"
        height="12"
        rounded
        class="flex-grow-1"
      >
        <template v-slot:default="{ value }">
          <div class="progress-text">
            {{ rating.count }} ({{ Math.round(value) }}%)
          </div>
        </template>
      </v-progress-linear>
    </div>

    <!-- Общее количество оценок -->
    <div class="text-caption text-grey mt-2">
      Всего оценок: {{ totalRatings }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  distribution: {
    type: Object,
    required: true,
    validator: (value) => {
      // Проверяем наличие всех оценок от 1 до 5
      return [1, 2, 3, 4, 5].every(rating => 
        typeof value[rating] === 'number' && value[rating] >= 0
      )
    }
  }
})

// Вычисляем общее количество оценок
const totalRatings = computed(() => 
  Object.values(props.distribution).reduce((sum, count) => sum + count, 0)
)

// Формируем данные для прогресс-баров
const ratingBars = computed(() => {
  // Если нет оценок, возвращаем нулевые значения
  if (totalRatings.value === 0) {
    return Array.from({ length: 5 }, (_, i) => ({
      value: 5 - i,
      count: 0,
      percentage: 0,
      color: getRatingColor(5 - i)
    }))
  }

  // Формируем массив с процентами и цветами
  return Array.from({ length: 5 }, (_, i) => {
    const value = 5 - i
    const count = props.distribution[value]
    return {
      value,
      count,
      percentage: (count / totalRatings.value) * 100,
      color: getRatingColor(value)
    }
  })
})

// Определяем цвет для оценки
const getRatingColor = (rating) => {
  switch (rating) {
    case 5: return 'success'
    case 4: return 'light-green'
    case 3: return 'warning'
    case 2: return 'orange'
    case 1: return 'error'
    default: return 'grey'
  }
}
</script>

<style scoped>
.rating-distribution {
  max-width: 400px;
}

.rating-bar {
  position: relative;
}

.rating-value {
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.progress-text {
  position: absolute;
  left: 8px;
  font-size: 0.75rem;
  color: white;
  text-shadow: 0 0 2px rgba(var(--v-theme-on-surface), 0.5);
}

/* Анимация при наведении */
.rating-bar:hover .v-progress-linear {
  transform: scaleY(1.2);
  transition: transform 0.2s ease;
}
</style> 