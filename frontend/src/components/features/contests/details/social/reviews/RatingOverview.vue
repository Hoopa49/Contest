<!-- 
  RatingOverview.vue
  Компонент для отображения общего обзора рейтинга конкурса.
  Показывает среднюю оценку, количество оценок и распределение оценок.
-->
<template>
  <div class="rating-overview">
    <!-- Основная информация -->
    <div class="d-flex align-center mb-6">
      <!-- Средняя оценка -->
      <div class="average-rating text-h3 font-weight-bold mr-4">
        {{ averageRating.toFixed(1) }}
      </div>

      <!-- Звезды -->
      <div class="stars">
        <v-rating
          :model-value="averageRating"
          color="warning"
          half-increments
          readonly
          density="compact"
        />
        <div class="text-caption text-grey mt-1">
          {{ totalRatings }} {{ getRatingsWord(totalRatings) }}
        </div>
      </div>
    </div>

    <!-- Распределение оценок -->
    <rating-distribution
      :distribution="distribution"
      class="mt-4"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import RatingDistribution from './components/RatingDistribution.vue'

// Props
const props = defineProps({
  distribution: {
    type: Object,
    required: true,
    validator: (value) => {
      if (!value) return false
      return [1, 2, 3, 4, 5].every(rating => 
        typeof value[rating] === 'number' && 
        Number.isFinite(value[rating]) && 
        value[rating] >= 0
      )
    }
  }
})

// Вычисляемые свойства
const totalRatings = computed(() => 
  Object.values(props.distribution).reduce((sum, count) => sum + count, 0)
)

const averageRating = computed(() => {
  if (totalRatings.value === 0) return 0
  
  const sum = Object.entries(props.distribution).reduce(
    (acc, [rating, count]) => acc + (Number(rating) * count), 
    0
  )
  return sum / totalRatings.value
})

// Методы
const getRatingsWord = (count) => {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'оценок'
  }

  switch (lastDigit) {
    case 1:
      return 'оценка'
    case 2:
    case 3:
    case 4:
      return 'оценки'
    default:
      return 'оценок'
  }
}
</script>

<style scoped>
.rating-overview {
  max-width: 400px;
}

.average-rating {
  min-width: 80px;
  text-align: center;
}

.stars {
  flex-grow: 1;
}

/* Анимация при загрузке */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.rating-overview {
  animation: fadeIn 0.3s ease-out;
}
</style> 