<!-- 
  ContestReviewDialog.vue
  Диалоговое окно для создания и редактирования отзыва.
  Включает форму отзыва и правила написания отзывов.
-->
<template>
  <v-dialog
    v-model="dialog"
    max-width="800"
    scrollable
    @click:outside="closeDialog"
  >
    <v-card>
      <!-- Заголовок -->
      <v-card-title class="text-h5 pa-4">
        {{ isEditing ? 'Редактировать отзыв' : 'Написать отзыв' }}
      </v-card-title>

      <!-- Правила написания отзывов -->
      <v-card-text v-if="!isEditing" class="pa-4 pb-0">
        <v-alert
          type="info"
          variant="tonal"
          class="mb-4"
        >
          <div class="text-subtitle-1 mb-2">
            Правила написания отзывов:
          </div>
          <v-list density="compact" class="bg-transparent">
            <v-list-item
              v-for="(rule, index) in reviewRules"
              :key="index"
              :prepend-icon="rule.icon"
              :title="rule.text"
              class="px-0"
            />
          </v-list>
        </v-alert>
      </v-card-text>

      <!-- Форма отзыва -->
      <v-card-text class="pa-4">
        <review-form
          :initial-rating="initialData.rating"
          :initial-text="initialData.text"
          :initial-pros="initialData.pros"
          :initial-cons="initialData.cons"
          :initial-recommendations="initialData.recommendations"
          :loading="loading"
          :error-message="errorMessage"
          @submit="submitReview"
        />
      </v-card-text>

      <!-- Кнопки управления -->
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="loading"
          @click="closeDialog"
        >
          Отмена
        </v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          :disabled="!isValid"
          @click="submitForm"
        >
          {{ isEditing ? 'Сохранить' : 'Опубликовать' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import ReviewForm from '../components/ReviewForm.vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  initialData: {
    type: Object,
    default: () => ({
      rating: 0,
      text: '',
      pros: '',
      cons: '',
      recommendations: ''
    })
  }
})

// Эмиты
const emit = defineEmits(['update:modelValue', 'submit'])

// Состояние
const loading = ref(false)
const errorMessage = ref('')
const formRef = ref(null)

// Правила написания отзывов
const reviewRules = [
  {
    icon: 'mdi-text',
    text: 'Опишите свой опыт участия в конкурсе'
  },
  {
    icon: 'mdi-thumb-up',
    text: 'Укажите плюсы и минусы конкурса'
  },
  {
    icon: 'mdi-lightbulb',
    text: 'Поделитесь рекомендациями для улучшения'
  },
  {
    icon: 'mdi-alert',
    text: 'Избегайте оскорблений и нецензурной лексики'
  },
  {
    icon: 'mdi-check-circle',
    text: 'Ваш отзыв будет проверен модератором'
  }
]

// Вычисляемые свойства
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEditing = computed(() => props.initialData.rating > 0)

const isValid = computed(() => {
  return formRef.value?.isValid || false
})

// Методы
const submitForm = async () => {
  if (formRef.value) {
    formRef.value.submitForm()
  }
}

const submitReview = async (data) => {
  loading.value = true
  errorMessage.value = ''

  try {
    await emit('submit', {
      ...data,
      id: props.initialData.id
    })
    closeDialog()
  } catch (error) {
    errorMessage.value = 'Не удалось сохранить отзыв. Попробуйте позже.'
  } finally {
    loading.value = false
  }
}

const closeDialog = () => {
  if (!loading.value) {
    dialog.value = false
    errorMessage.value = ''
  }
}
</script>

<style scoped>
/* Анимация появления диалога */
:deep(.v-dialog-transition-enter-active),
:deep(.v-dialog-transition-leave-active) {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.v-dialog-transition-enter-from),
:deep(.v-dialog-transition-leave-to) {
  transform: translateY(100%);
  opacity: 0;
}

/* Стили для правил */
:deep(.v-list-item) {
  min-height: 36px;
}

:deep(.v-list-item__prepend) {
  margin-right: 8px;
}
</style> 