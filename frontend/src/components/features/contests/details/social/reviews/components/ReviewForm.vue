<!-- 
  ReviewForm.vue
  Компонент формы для создания и редактирования отзывов.
  Включает рейтинг, текст отзыва и опциональные поля.
-->
<template>
  <div class="review-form">
    <!-- Рейтинг -->
    <div class="rating-section mb-4">
      <div class="text-subtitle-1 mb-2">
        {{ label }}
      </div>
      <v-rating
        v-model="rating"
        color="warning"
        hover
        :disabled="disabled"
        class="mb-2"
      />
      <div class="text-caption" :class="ratingHintColor">
        {{ ratingHint }}
      </div>
    </div>

    <!-- Текст отзыва -->
    <v-textarea
      v-model="text"
      :label="textLabel"
      :placeholder="placeholder"
      variant="outlined"
      :rows="4"
      counter
      :maxlength="2000"
      :disabled="disabled"
      :error-messages="errorMessage"
      class="mb-4"
      @keydown.ctrl.enter="submitForm"
      hide-details="auto"
    />

    <!-- Дополнительные поля -->
    <div class="additional-fields mb-4" v-if="showAdditionalFields">
      <!-- Плюсы -->
      <v-text-field
        v-model="pros"
        label="Плюсы"
        variant="outlined"
        density="comfortable"
        :disabled="disabled"
        class="mb-2"
        hide-details="auto"
      />

      <!-- Минусы -->
      <v-text-field
        v-model="cons"
        label="Минусы"
        variant="outlined"
        density="comfortable"
        :disabled="disabled"
        class="mb-2"
        hide-details="auto"
      />

      <!-- Рекомендации -->
      <v-text-field
        v-model="recommendations"
        label="Рекомендации"
        variant="outlined"
        density="comfortable"
        :disabled="disabled"
        hide-details="auto"
      />
    </div>

    <!-- Кнопки управления -->
    <div class="d-flex justify-end">
      <v-btn
        v-if="showCancel"
        variant="text"
        class="mr-2"
        :disabled="disabled || loading"
        @click="cancel"
      >
        Отмена
      </v-btn>
      <v-btn
        color="primary"
        :disabled="!isValid || disabled"
        :loading="loading"
        @click="submitForm"
      >
        {{ submitText }}
      </v-btn>
    </div>

    <!-- Подсказка о горячих клавишах -->
    <div class="text-caption text-grey mt-2">
      Ctrl + Enter для быстрой отправки
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  initialRating: {
    type: Number,
    default: 0
  },
  initialText: {
    type: String,
    default: ''
  },
  initialPros: {
    type: String,
    default: ''
  },
  initialCons: {
    type: String,
    default: ''
  },
  initialRecommendations: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: 'Ваша оценка'
  },
  textLabel: {
    type: String,
    default: 'Ваш отзыв'
  },
  placeholder: {
    type: String,
    default: 'Расскажите о вашем опыте участия в конкурсе...'
  },
  submitText: {
    type: String,
    default: 'Отправить'
  },
  showCancel: {
    type: Boolean,
    default: false
  },
  showAdditionalFields: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

// Эмиты
const emit = defineEmits(['submit', 'cancel'])

// Состояние
const rating = ref(props.initialRating)
const text = ref(props.initialText)
const pros = ref(props.initialPros)
const cons = ref(props.initialCons)
const recommendations = ref(props.initialRecommendations)

// Отслеживаем изменения начальных значений
watch(() => props.initialRating, (newValue) => {
  rating.value = newValue
})

watch(() => props.initialText, (newValue) => {
  text.value = newValue
})

watch(() => props.initialPros, (newValue) => {
  pros.value = newValue
})

watch(() => props.initialCons, (newValue) => {
  cons.value = newValue
})

watch(() => props.initialRecommendations, (newValue) => {
  recommendations.value = newValue
})

// Вычисляемые свойства
const isValid = computed(() => {
  return rating.value > 0 && text.value.trim().length >= 10
})

const ratingHint = computed(() => {
  if (rating.value === 0) return 'Выберите оценку'
  const hints = [
    'Очень плохо',
    'Плохо',
    'Нормально',
    'Хорошо',
    'Отлично'
  ]
  return hints[rating.value - 1]
})

const ratingHintColor = computed(() => {
  if (rating.value === 0) return 'text-grey'
  const colors = [
    'text-error',
    'text-warning',
    'text-info',
    'text-success',
    'text-success'
  ]
  return colors[rating.value - 1]
})

// Методы
const submitForm = () => {
  if (isValid.value && !props.disabled && !props.loading) {
    emit('submit', {
      rating: rating.value,
      text: text.value.trim(),
      pros: pros.value.trim(),
      cons: cons.value.trim(),
      recommendations: recommendations.value.trim()
    })
  }
}

const cancel = () => {
  rating.value = props.initialRating
  text.value = props.initialText
  pros.value = props.initialPros
  cons.value = props.initialCons
  recommendations.value = props.initialRecommendations
  emit('cancel')
}
</script>

<style scoped>
.review-form {
  max-width: 600px;
}

.rating-section {
  text-align: center;
}

/* Анимация для звезд */
:deep(.v-rating__wrapper) {
  gap: 4px;
}

:deep(.v-rating__item) {
  transition: transform 0.2s ease;
}

:deep(.v-rating__item--hover) {
  transform: scale(1.2);
}

/* Анимация для полей ввода */
:deep(.v-field--focused) {
  transition: transform 0.2s ease;
  transform: scale(1.01);
}
</style> 