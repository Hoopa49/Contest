<!-- 
  ReviewList.vue
  Компонент для отображения списка отзывов.
  Включает сортировку, фильтрацию и пагинацию отзывов.
-->
<template>
  <div class="review-list">
    <!-- Панель управления -->
    <div class="controls d-flex flex-wrap align-center mb-4">
      <!-- Сортировка -->
      <v-select
        v-model="sortBy"
        :items="sortOptions"
        label="Сортировка"
        variant="outlined"
        density="comfortable"
        hide-details
        class="mr-4"
        style="max-width: 200px"
      />

      <!-- Фильтр по оценкам -->
      <v-btn-toggle
        v-model="selectedRating"
        density="comfortable"
        class="mr-4"
      >
        <v-btn
          value="all"
          variant="outlined"
          class="px-3"
        >
          Все
        </v-btn>
        <v-btn
          v-for="rating in [5, 4, 3, 2, 1]"
          :key="rating"
          :value="rating"
          variant="outlined"
          class="px-3"
        >
          {{ rating }}
          <v-icon
            icon="mdi-star"
            size="small"
            color="warning"
            class="ml-1"
          />
        </v-btn>
      </v-btn-toggle>

      <!-- Фильтр по верификации -->
      <v-checkbox
        v-model="showVerifiedOnly"
        label="Только проверенные"
        density="comfortable"
        hide-details
      />
    </div>

    <!-- Список отзывов -->
    <div v-if="paginatedReviews.length" class="reviews-container">
      <review-item
        v-for="review in paginatedReviews"
        :key="review.id"
        :review="review"
        :can-manage-review="canManageReview(review)"
        class="mb-4"
        @update="updateReview"
        @delete="deleteReview"
        @like="toggleLike"
        @report="reportReview"
      />

      <!-- Пагинация -->
      <v-pagination
        v-if="totalPages > 1"
        v-model="currentPage"
        :length="totalPages"
        :total-visible="7"
        class="mt-4"
      />
    </div>

    <!-- Сообщение об отсутствии отзывов -->
    <v-alert
      v-else
      type="info"
      :text="noReviewsMessage"
      variant="tonal"
      class="mt-4"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ReviewItem from '../ReviewItem.vue'

// Props
const props = defineProps({
  reviews: {
    type: Array,
    default: () => []
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  currentUserId: {
    type: String,
    default: ''
  }
})

// Эмиты
const emit = defineEmits(['update', 'delete', 'like', 'report'])

// Состояние
const currentPage = ref(1)
const sortBy = ref('newest')
const selectedRating = ref('all')
const showVerifiedOnly = ref(false)

// Опции сортировки
const sortOptions = [
  { title: 'Сначала новые', value: 'newest' },
  { title: 'Сначала старые', value: 'oldest' },
  { title: 'По рейтингу (высокий)', value: 'rating-desc' },
  { title: 'По рейтингу (низкий)', value: 'rating-asc' },
  { title: 'По полезности', value: 'helpful' }
]

// Вычисляемые свойства
const filteredReviews = computed(() => {
  let filtered = [...props.reviews]

  // Фильтр по оценке
  if (selectedRating.value !== 'all') {
    filtered = filtered.filter(review => 
      review.rating === selectedRating.value
    )
  }

  // Фильтр по верификации
  if (showVerifiedOnly.value) {
    filtered = filtered.filter(review => review.isVerified)
  }

  // Сортировка
  switch (sortBy.value) {
    case 'newest':
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
    case 'oldest':
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      break
    case 'rating-desc':
      filtered.sort((a, b) => b.rating - a.rating)
      break
    case 'rating-asc':
      filtered.sort((a, b) => a.rating - b.rating)
      break
    case 'helpful':
      filtered.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
      break
  }

  return filtered
})

const totalPages = computed(() => 
  Math.ceil(filteredReviews.value.length / props.itemsPerPage)
)

const paginatedReviews = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return filteredReviews.value.slice(start, end)
})

const noReviewsMessage = computed(() => {
  if (selectedRating.value !== 'all') {
    return `Нет отзывов с оценкой ${selectedRating.value}`
  }
  if (showVerifiedOnly.value) {
    return 'Нет проверенных отзывов'
  }
  return 'Отзывов пока нет'
})

// Методы
const canManageReview = (review) => {
  return props.currentUserId && review.author.id === props.currentUserId
}

const updateReview = (data) => {
  emit('update', data)
}

const deleteReview = (reviewId) => {
  emit('delete', reviewId)
}

const toggleLike = (data) => {
  emit('like', data)
}

const reportReview = (data) => {
  emit('report', data)
}

// Сброс страницы при изменении фильтров
watch([sortBy, selectedRating, showVerifiedOnly], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.review-list {
  width: 100%;
}

.reviews-container {
  min-height: 200px;
}

/* Адаптивность */
@media (width <= 600px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .controls > * {
    margin-right: 0;
    margin-bottom: 1rem;
    width: 100%;
  }

  .v-btn-toggle {
    flex-wrap: wrap;
  }
}
</style> 