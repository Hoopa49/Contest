<!-- 
  ContestReviews.vue
  Основной компонент для работы с отзывами конкурса.
  Управляет состоянием отзывов и взаимодействием с API.
-->
<template>
  <div :class="$attrs.class">
    <v-card-title class="d-flex align-center px-0">

      Отзывы ({{ reviews.length }})
      <v-spacer />
      <v-btn
        v-if="canAddReview"
        color="primary"
        variant="text"
        prepend-icon="mdi-plus"
        @click="showReviewDialog = true"
      >
        Написать отзыв
      </v-btn>
    </v-card-title>

    <v-card-text class="px-0">
      <v-row>
        <v-col cols="12" md="4">
          <div class="text-h2 text-center">
            {{ averageRating || "0.0" }}
          </div>
          <div class="text-center text-subtitle-1 mb-4">
            <v-rating
              v-if="canRate"
              v-model="userRating"
              color="amber"
              hover
              half-increments
              @update:model-value="handleRate"
            />
            <v-rating
              v-else
              :model-value="averageRating"
              color="amber"
              half-increments
              readonly
            />
            <div class="text-caption">{{ reviews.length }} оценок</div>
          </div>
          
          <v-list class="bg-transparent">
            <v-list-item v-for="i in 5" :key="i" class="px-0 py-0">
              <template v-slot:prepend>
                <div class="d-flex align-center" style="width: 45px">
                  <span class="text-body-2 mr-1">{{ 6 - i }}</span>
                  <v-icon color="amber" size="small">mdi-star</v-icon>
                </div>
              </template>
              
              <v-progress-linear
                :model-value="(ratingDistribution[6 - i] / (reviews.length || 1)) * 100"
                :color="getRatingColor(6 - i)"
                height="12"
                rounded
                class="flex-grow-1"
              />
              
              <template v-slot:append>
                <div class="ml-2" style="width: 65px">
                  <span class="text-body-2">{{ ratingDistribution[6 - i] }} ({{ Math.round((ratingDistribution[6 - i] / (reviews.length || 1)) * 100) }}%)</span>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-col>

        <v-col cols="12" md="8">
          <v-list class="bg-transparent">
            <template v-if="reviews.length">
              <v-list-item
                v-for="review in reviews"
                :key="review.id"
                class="mb-4"
              >
                <template v-slot:prepend>
                  <v-avatar :image="review.author.avatar" size="40" class="mr-3">
                    <v-icon v-if="!review.author.avatar">mdi-account</v-icon>
                  </v-avatar>
                </template>

                <div class="d-flex flex-column">
                  <div class="d-flex align-center">
                    <span class="font-weight-medium">{{ review.author.username }}</span>
                    <v-rating
                      :model-value="review.rating"
                      class="ml-2"
                      color="amber"
                      density="compact"
                      readonly
                      size="small"
                    />
                  </div>
                  <div class="text-caption text-grey">
                    {{ formatDate(review.created_at) }}
                    <span v-if="review.is_edited">(изменено)</span>
                  </div>
                  <div class="mt-2 review-content">{{ review.content }}</div>
                  
                  <div class="d-flex align-center mt-2">
                    <v-btn
                      variant="text"
                      size="small"
                      :color="review.isLiked ? 'primary' : ''"
                      @click="toggleLike(review)"
                    >
                      <v-icon size="small" class="mr-1">
                        {{ review.isLiked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline' }}
                      </v-icon>
                      {{ review.likes_count }}
                    </v-btn>

                    <v-menu v-if="currentUserId === review.author.id">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          variant="text"
                          size="small"
                          v-bind="props"
                          class="ml-2"
                        >
                          <v-icon size="small">mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>

                      <v-list>
                        <v-list-item @click="updateReview(review)">
                          <v-list-item-title>
                            <v-icon size="small" class="mr-2">mdi-pencil</v-icon>
                            Редактировать
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteReview(review)">
                          <v-list-item-title>
                            <v-icon size="small" class="mr-2">mdi-delete</v-icon>
                            Удалить
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                </div>
              </v-list-item>
            </template>
            <v-list-item v-else>
              <div class="text-center py-4 w-100">
                <div class="text-subtitle-1">Отзывов пока нет</div>
                <div class="text-caption text-grey">Будьте первым, кто оставит отзыв</div>
              </div>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Диалог добавления/редактирования отзыва -->
    <v-dialog v-model="showReviewDialog" max-width="500">
      <v-card>
        <v-card-title>
          {{ editingReview ? 'Редактировать отзыв' : 'Написать отзыв' }}
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="submitReview">
            <div class="mb-4">
              <label class="text-subtitle-2 mb-2 d-block">Оценка</label>
              <v-rating
                v-model="reviewForm.rating"
                color="amber"
                hover
                required
              />
            </div>
            <v-textarea
              v-model="reviewForm.content"
              label="Ваш отзыв (необязательно)"
              rows="4"
              counter
              maxlength="2000"
              :rules="[v => !v || v.length <= 2000 || 'Максимальная длина отзыва - 2000 символов']"
            />
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="primary"
                variant="text"
                @click="showReviewDialog = false"
              >
                Отмена
              </v-btn>
              <v-btn
                color="primary"
                type="submit"
                :loading="loading"
              >
                {{ editingReview ? 'Сохранить' : 'Отправить' }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Диалог подтверждения удаления -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Подтвердите действие
        </v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить этот отзыв?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="showDeleteDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="error"
            @click="confirmDeleteReview"
            :loading="loading"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
    >
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showSnackbar = false"
        >
          Закрыть
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, toRaw } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { formatDate } from '@/utils/formatters'
import reviewApi from '@/services/api/contest_review.api'
import { usePlatformStore } from '@/stores/platform'

// Props
const props = defineProps({
  entityId: {
    type: String,
    required: true
  },
  entityType: {
    type: String,
    required: true,
    validator: (value) => ['contest', 'platform'].includes(value)
  },
  canRate: {
    type: Boolean,
    default: false
  }
})

// Эмиты
const emit = defineEmits(['update:rating', 'update:reviewsCount', 'rate'])

// Состояние
const reviews = ref([])
const loading = ref(false)
const showReviewDialog = ref(false)
const showDeleteDialog = ref(false)
const reviewToDelete = ref(null)
const editingReview = ref(null)
const userRating = ref(0)
const reviewForm = ref({
  rating: 0,
  content: ''
})

// Состояние для уведомлений
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Получаем данные из хранилища
const authStore = useAuthStore()
const platformStore = usePlatformStore()

// Загружаем отзывы при монтировании компонента
onMounted(async () => {
  await fetchReviews()
})

// Логируем состояние authStore при инициализации
console.log('Initial auth store state:', {
  isAuthenticated: authStore.isAuthenticated,
  user: authStore.user,
  rawUser: toRaw(authStore.user),
  userKeys: Object.keys(authStore.user || {}),
  userEntries: Object.entries(authStore.user || {})
})

const isAuthenticated = computed(() => {
  const auth = authStore.isAuthenticated
  console.log('Computed isAuthenticated:', auth)
  return auth
})

const currentUserId = computed(() => {
  const user = authStore.user
  console.log('Computing currentUserId:', {
    user,
    rawUser: toRaw(user),
    id: user?.id,
    keys: Object.keys(user || {}),
    entries: Object.entries(user || {})
  })
  return user?.id
})

const hasUserReview = computed(() => 
  reviews.value.some(review => review.author.id === currentUserId.value)
)

// Вычисляемые свойства
const canAddReview = computed(() => 
  isAuthenticated.value && !hasUserReview.value
)

const averageRating = computed(() => {
  if (!reviews.value || reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0)
  const average = (sum / reviews.value.length).toFixed(1)
  return average
})

const ratingDistribution = computed(() => {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  if (!reviews.value) return distribution
  reviews.value.forEach(review => {
    distribution[review.rating]++
  })
  return distribution
})

// Методы работы с API
const fetchReviews = async () => {
  loading.value = true
  try {
    const response = props.entityType === 'contest'
      ? await reviewApi.getReviews(props.entityId)
      : await platformStore.getPlatformReviews(props.entityId)

    console.log('Fetch reviews response:', response)

    if (response.success) {
      reviews.value = response.reviews || []
      emit('update:reviewsCount', reviews.value.length)
    } else {
      showNotification(response.message || 'Не удалось загрузить отзывы', 'error')
    }
  } catch (error) {
    console.error('Error in fetchReviews:', error)
    showNotification(error.message || 'Не удалось загрузить отзывы', 'error')
  } finally {
    loading.value = false
  }
}

const submitReview = async () => {
  if (!reviewForm.value.rating) {
    showNotification('Пожалуйста, укажите оценку', 'error')
    return
  }

  loading.value = true
  try {
    const reviewData = {
      rating: reviewForm.value.rating,
      content: reviewForm.value.content || ''
    }

    console.log('Review data to be sent:', reviewData)

    let response
    if (editingReview.value) {
      response = await reviewApi.updateReview(editingReview.value.id, reviewData)
    } else {
      response = await reviewApi.addReview(props.entityId, reviewData)
    }

    console.log('API Response:', response)

    if (response.success && response.data?.review) {
      if (editingReview.value) {
        const index = reviews.value.findIndex(r => r.id === editingReview.value.id)
        if (index !== -1) {
          reviews.value[index] = response.data.review
          showNotification('Отзыв обновлен')

          // Обновляем рейтинг конкурса, если он был получен
          if (response.data?.contestStats?.rating !== undefined) {
            console.log('Updating contest rating:', response.data.contestStats.rating)
            emit('update:rating', response.data.contestStats.rating)
          }
        }
      } else {
        reviews.value.unshift(response.data.review)
        emit('update:reviewsCount', reviews.value.length)
        
        // Обновляем рейтинг конкурса при добавлении отзыва
        if (response.data?.contestStats?.rating !== undefined) {
          console.log('Updating contest rating after adding review:', response.data.contestStats.rating)
          emit('update:rating', response.data.contestStats.rating)
        }
        
        showNotification('Отзыв добавлен')
      }
      showReviewDialog.value = false
      reviewForm.value = { rating: 0, content: '' }
      editingReview.value = null
    } else {
      showNotification(response.message || 'Не удалось сохранить отзыв', 'error')
    }
  } catch (error) {
    console.error('Error in submitReview:', error)
    showNotification(error.message || 'Не удалось сохранить отзыв', 'error')
  } finally {
    loading.value = false
  }
}

const updateReview = (review) => {
  editingReview.value = review
  reviewForm.value = {
    rating: review.rating,
    content: review.content,
    id: review.id
  }
  showReviewDialog.value = true
}

const deleteReview = (review) => {
  reviewToDelete.value = review
  showDeleteDialog.value = true
}

const confirmDeleteReview = async () => {
  if (!reviewToDelete.value) return

  loading.value = true
  try {
    const response = await reviewApi.deleteReview(reviewToDelete.value.id)
    console.log('Delete review response:', response)

    if (response.success) {
      const index = reviews.value.findIndex(r => r.id === reviewToDelete.value.id)
      if (index !== -1) {
        reviews.value.splice(index, 1)
        emit('update:reviewsCount', reviews.value.length)
        
        // Обновляем рейтинг конкурса после удаления отзыва
        if (response.data?.contestStats?.rating !== undefined) {
          console.log('Updating contest rating after deleting review:', response.data.contestStats.rating)
          emit('update:rating', response.data.contestStats.rating)
        }
        
        showNotification('Отзыв удален')
        showDeleteDialog.value = false
        reviewToDelete.value = null
      }
    } else {
      showNotification(response.message || 'Не удалось удалить отзыв', 'error')
    }
  } catch (error) {
    console.error('Error deleting review:', error)
    showNotification(error.message || 'Не удалось удалить отзыв', 'error')
  } finally {
    loading.value = false
  }
}

const toggleLike = async (review) => {
  loading.value = true
  try {
    const response = props.entityType === 'contest'
      ? await reviewApi.toggleLike(review.id)
      : await platformStore.toggleReviewLike(props.entityId, review.id)

    console.log('Toggle like response:', response)

    if (response.success) {
      review.isLiked = response.isLiked
      review.likes_count = response.likesCount
    } else {
      showNotification(response.message || 'Не удалось обновить оценку отзыва', 'error')
    }
  } catch (error) {
    console.error('Error in toggleLike:', error)
    showNotification(error.message || 'Не удалось обновить оценку отзыва', 'error')
  } finally {
    loading.value = false
  }
}

const reportReview = async (data) => {
  loading.value = true
  try {
    const response = await reviewApi.reportReview(data.id, data.reason)
    if (response.success) {
      showNotification('Жалоба отправлена')
    } else {
      showNotification('Не удалось отправить жалобу', 'error')
    }
  } catch (error) {
    showNotification('Не удалось отправить жалобу', 'error')
  } finally {
    loading.value = false
  }
}

// Вспомогательные методы
const openReviewDialog = () => {
  editingReview.value = null
  showReviewDialog.value = true
}

const showNotification = (text, color = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  showSnackbar.value = true
}

const handleRate = (rating) => {
  emit('rate', rating)
}

const getRatingColor = (rating) => {
  switch (rating) {
    case 5: return 'success'        // Зеленый
    case 4: return 'light-green'    // Светло-зеленый
    case 3: return 'amber'          // Янтарный
    case 2: return 'orange'         // Оранжевый
    case 1: return 'error'          // Красный
    default: return 'grey'
  }
}

defineOptions({
  inheritAttrs: false
})
</script>

<style scoped>
.v-list-item {
  border-radius: 8px;
}

.v-list-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.v-rating .v-icon {
  padding: 0;
}

/* Стили для текста отзыва */
.review-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}
</style> 