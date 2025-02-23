<!-- 
  ContestRating.vue
  Компонент для отображения и управления рейтингом конкурса
-->
<template>
  <div class="rating-container">
    <!-- Общий рейтинг -->
    <div class="rating-overview">
      <div class="rating-score">
        <span class="text-h4">{{ averageRating }}</span>
        <span class="text-subtitle-1">/5</span>
      </div>
      
      <v-rating
        v-model="displayRating"
        :model-value="averageRating"
        readonly
        half-increments
        color="warning"
        background-color="warning-lighten-3"
        hover
      ></v-rating>
      
      <div class="text-caption text-grey">
        {{ totalVotes }} {{ getVotesText(totalVotes) }}
      </div>
    </div>

    <!-- Распределение оценок -->
    <div class="rating-distribution mt-4">
      <div 
        v-for="n in 5"
        :key="n"
        class="distribution-row d-flex align-center mb-1"
      >
        <span class="text-caption mr-2">{{ n }}</span>
        <v-icon color="warning" size="small" class="mr-2">mdi-star</v-icon>
        <v-progress-linear
          :model-value="getDistributionPercentage(n)"
          color="warning"
          height="8"
          rounded
          class="flex-grow-1"
        ></v-progress-linear>
        <span class="text-caption ml-2">{{ distribution[n] || 0 }}</span>
      </div>
    </div>

    <!-- Форма оценки -->
    <div v-if="canRate" class="rating-form mt-4">
      <v-divider class="mb-4"></v-divider>
      
      <div class="text-subtitle-2 mb-2">Ваша оценка</div>
      
      <div class="d-flex align-center">
        <v-rating
          v-model="userRating"
          color="warning"
          hover
          class="mr-2"
        ></v-rating>
        
        <v-btn
          :disabled="!userRating || isSubmitting"
          :loading="isSubmitting"
          color="primary"
          size="small"
          @click="submitRating"
        >
          {{ userPreviousRating ? 'Обновить' : 'Оценить' }}
        </v-btn>
      </div>

      <v-expand-transition>
        <v-alert
          v-if="ratingMessage"
          :type="ratingMessageType"
          variant="tonal"
          class="mt-2"
          density="compact"
        >
          {{ ratingMessage }}
        </v-alert>
      </v-expand-transition>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ContestRating',

  props: {
    // Общий рейтинг
    rating: {
      type: Number,
      required: true
    },
    // Общее количество голосов
    votes: {
      type: Number,
      required: true
    },
    // Распределение оценок
    distribution: {
      type: Object,
      default: () => ({})
    },
    // Предыдущая оценка пользователя
    userPreviousRating: {
      type: Number,
      default: null
    },
    // Может ли пользователь оценивать
    canRate: {
      type: Boolean,
      default: true
    }
  },

  emits: ['rate'],

  setup(props, { emit }) {
    // Состояние компонента
    const userRating = ref(props.userPreviousRating || 0)
    const isSubmitting = ref(false)
    const ratingMessage = ref('')
    const ratingMessageType = ref('info')
    const displayRating = ref(0)

    // Вычисляемые свойства
    const averageRating = computed(() => {
      return props.rating.toFixed(1)
    })

    const totalVotes = computed(() => props.votes)

    // Методы
    const getVotesText = (count) => {
      const cases = [2, 0, 1, 1, 1, 2]
      const titles = ['оценка', 'оценки', 'оценок']
      return titles[(count % 100 > 4 && count % 100 < 20) ? 2 : 
        cases[Math.min(count % 10, 5)]]
    }

    const getDistributionPercentage = (rating) => {
      if (!props.votes) return 0
      return ((props.distribution[rating] || 0) / props.votes) * 100
    }

    const submitRating = async () => {
      if (!userRating.value) return

      try {
        isSubmitting.value = true
        // Эмитим событие с новой оценкой
        await emit('rate', userRating.value)
        
        ratingMessage.value = 'Ваша оценка успешно сохранена'
        ratingMessageType.value = 'success'
      } catch (error) {
        ratingMessage.value = 'Не удалось сохранить оценку'
        ratingMessageType.value = 'error'
      } finally {
        isSubmitting.value = false
        
        // Скрываем сообщение через 3 секунды
        setTimeout(() => {
          ratingMessage.value = ''
        }, 3000)
      }
    }

    return {
      userRating,
      isSubmitting,
      ratingMessage,
      ratingMessageType,
      displayRating,
      averageRating,
      totalVotes,
      getVotesText,
      getDistributionPercentage,
      submitRating
    }
  }
}
</script>

<style scoped>
.rating-container {
  max-width: 400px;
}

.rating-overview {
  text-align: center;
}

.rating-score {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.distribution-row {
  min-width: 200px;
}

.rating-form {
  border-radius: 8px;
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  padding: 16px;
}
</style> 
