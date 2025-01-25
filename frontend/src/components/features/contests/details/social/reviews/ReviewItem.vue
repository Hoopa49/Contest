<!-- 
  ReviewItem.vue
  Компонент для отображения отдельного отзыва.
  Включает информацию об авторе, рейтинг, текст отзыва и действия.
-->
<template>
  <v-card class="review-item" :loading="loading">
    <!-- Шапка отзыва -->
    <v-card-item>
      <div class="d-flex align-center">
        <!-- Аватар автора -->
        <v-avatar size="40" class="mr-4">
          <v-img :src="review.author.avatar" :alt="review.author.name" />
        </v-avatar>

        <!-- Информация об авторе и рейтинге -->
        <div class="flex-grow-1">
          <div class="d-flex align-center">
            <div class="text-subtitle-1 font-weight-medium">
              {{ review.author.name }}
            </div>
            <v-chip
              v-if="review.isVerified"
              color="success"
              size="small"
              class="ml-2"
            >
              <v-icon start icon="mdi-check-circle" size="x-small" />
              Проверено
            </v-chip>
          </div>
          <div class="d-flex align-center mt-1">
            <v-rating
              :model-value="review.rating"
              color="warning"
              density="compact"
              readonly
              class="mr-2"
            />
            <div class="text-caption text-grey">
              {{ formatDate(review.createdAt) }}
              <span v-if="review.isEdited" class="ml-1">(изменено)</span>
            </div>
          </div>
        </div>

        <!-- Действия с отзывом -->
        <v-menu v-if="canManageReview">
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-dots-vertical"
              variant="text"
              v-bind="props"
              :disabled="loading"
            />
          </template>
          <v-list>
            <v-list-item
              prepend-icon="mdi-pencil"
              title="Редактировать"
              @click="startEditing"
            />
            <v-list-item
              prepend-icon="mdi-delete"
              title="Удалить"
              color="error"
              @click="confirmDelete"
            />
          </v-list>
        </v-menu>
      </div>
    </v-card-item>

    <!-- Содержимое отзыва -->
    <v-card-text v-if="!isEditing">
      <!-- Основной текст -->
      <div class="review-text mb-4">
        {{ review.text }}
      </div>

      <!-- Дополнительные поля -->
      <template v-if="hasAdditionalInfo">
        <v-divider class="mb-4" />
        
        <div v-if="review.pros" class="mb-2">
          <div class="text-subtitle-2 text-success mb-1">
            <v-icon icon="mdi-plus-circle" size="small" class="mr-1" />
            Плюсы
          </div>
          <div>{{ review.pros }}</div>
        </div>

        <div v-if="review.cons" class="mb-2">
          <div class="text-subtitle-2 text-error mb-1">
            <v-icon icon="mdi-minus-circle" size="small" class="mr-1" />
            Минусы
          </div>
          <div>{{ review.cons }}</div>
        </div>

        <div v-if="review.recommendations">
          <div class="text-subtitle-2 text-info mb-1">
            <v-icon icon="mdi-lightbulb" size="small" class="mr-1" />
            Рекомендации
          </div>
          <div>{{ review.recommendations }}</div>
        </div>
      </template>
    </v-card-text>

    <!-- Форма редактирования -->
    <v-card-text v-else>
      <review-form
        :initial-rating="review.rating"
        :initial-text="review.text"
        :initial-pros="review.pros"
        :initial-cons="review.cons"
        :initial-recommendations="review.recommendations"
        show-cancel
        submit-text="Сохранить"
        :loading="loading"
        @submit="saveEdit"
        @cancel="cancelEdit"
      />
    </v-card-text>

    <!-- Действия с отзывом -->
    <v-card-actions>
      <v-spacer />
      <v-btn
        variant="text"
        density="comfortable"
        prepend-icon="mdi-thumb-up"
        :color="review.isLiked ? 'primary' : undefined"
        :disabled="loading"
        @click="toggleLike"
      >
        {{ review.likesCount || 'Полезно' }}
      </v-btn>
      <v-btn
        variant="text"
        density="comfortable"
        prepend-icon="mdi-flag"
        :disabled="loading"
        @click="reportReview"
      >
        Пожаловаться
      </v-btn>
    </v-card-actions>

    <!-- Диалог подтверждения удаления -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Удалить отзыв?
        </v-card-title>
        <v-card-text>
          Это действие нельзя будет отменить.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showDeleteDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="error"
            @click="deleteReview"
            :loading="loading"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог жалобы -->
    <v-dialog v-model="showReportDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          Пожаловаться на отзыв
        </v-card-title>
        <v-card-text>
          <v-select
            v-model="reportReason"
            :items="reportReasons"
            label="Причина жалобы"
            variant="outlined"
            class="mb-4"
          />
          <v-textarea
            v-model="reportComment"
            label="Комментарий"
            variant="outlined"
            rows="3"
            :maxlength="500"
            counter
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="cancelReport"
          >
            Отмена
          </v-btn>
          <v-btn
            color="error"
            :disabled="!reportReason"
            :loading="loading"
            @click="submitReport"
          >
            Отправить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import ReviewForm from './components/ReviewForm.vue'

// Props
const props = defineProps({
  review: {
    type: Object,
    required: true
  },
  canManageReview: {
    type: Boolean,
    default: false
  }
})

// Эмиты
const emit = defineEmits(['update', 'delete', 'like', 'report'])

// Состояние
const loading = ref(false)
const isEditing = ref(false)
const showDeleteDialog = ref(false)
const showReportDialog = ref(false)
const reportReason = ref('')
const reportComment = ref('')

// Список причин для жалобы
const reportReasons = [
  'Спам',
  'Оскорбительное содержание',
  'Недостоверная информация',
  'Нарушение правил сайта',
  'Другое'
]

// Вычисляемые свойства
const hasAdditionalInfo = computed(() => {
  return props.review.pros || props.review.cons || props.review.recommendations
})

// Методы
const formatDate = (date) => {
  return new Date(date).toLocaleString('ru', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const startEditing = () => {
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
}

const saveEdit = async (data) => {
  loading.value = true
  try {
    await emit('update', {
      id: props.review.id,
      ...data
    })
    isEditing.value = false
  } finally {
    loading.value = false
  }
}

const confirmDelete = () => {
  showDeleteDialog.value = true
}

const deleteReview = async () => {
  loading.value = true
  try {
    await emit('delete', props.review.id)
    showDeleteDialog.value = false
  } finally {
    loading.value = false
  }
}

const toggleLike = async () => {
  loading.value = true
  try {
    await emit('like', {
      id: props.review.id,
      liked: !props.review.isLiked
    })
  } finally {
    loading.value = false
  }
}

const reportReview = () => {
  showReportDialog.value = true
}

const cancelReport = () => {
  showReportDialog.value = false
  reportReason.value = ''
  reportComment.value = ''
}

const submitReport = async () => {
  loading.value = true
  try {
    await emit('report', {
      reviewId: props.review.id,
      reason: reportReason.value,
      comment: reportComment.value
    })
    showReportDialog.value = false
    reportReason.value = ''
    reportComment.value = ''
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.review-item {
  transition: all 0.3s ease;
}

.review-text {
  white-space: pre-wrap;
  word-break: break-word;
}

/* Анимация при наведении */
.review-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Анимация для кнопок */
.v-btn {
  transition: all 0.2s ease;
}

.v-btn:hover {
  transform: translateY(-1px);
}
</style> 