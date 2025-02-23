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
        :loading="loading"
        :disabled="isAuthLoading"
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
              :model-value="averageRating"
              color="amber"
              half-increments
              readonly
              class="rating-large"
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
                :model-value="getProgressValue(6 - i)"
                :color="getRatingColor(6 - i)"
                height="12"
                rounded
                class="flex-grow-1"
              />
              
              <template v-slot:append>
                <div class="ml-2" style="width: 65px">
                  <span class="text-body-2">
                    {{ ratingDistribution.value[5 - i] || 0 }} 
                    ({{ getPercentage(6 - i) }}%)
                  </span>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-col>

        <v-col cols="12" md="8">
          <div class="d-flex justify-space-between align-center mb-4">
            <div>
              <div class="text-h6">Отзывы</div>
              <div class="text-subtitle-1">
                Средняя оценка: {{ averageRating }}
                <span class="text-caption text-grey">({{ reviews.length }} отзывов)</span>
              </div>
            </div>
            <v-btn
              v-if="canAddReview"
              color="primary"
              @click="showReviewDialog = true"
              :loading="loading"
              :disabled="isAuthLoading"
            >
              <v-icon start>mdi-plus</v-icon>
              Написать отзыв
            </v-btn>
          </div>

          <v-list class="bg-transparent">
            <v-skeleton-loader
              v-if="loading && !reviews.length"
              type="list-item-three-line"
              :loading="true"
              class="mb-2"
            />

            <template v-else-if="reviews.length">
              <v-list-item v-for="review in reviews" :key="review.id">
                <div class="w-100">
                  <div class="d-flex align-center">
                    <span class="font-weight-medium">{{ review.author.username }}</span>
                    <v-rating
                      :model-value="review.rating"
                      class="ml-2"
                      color="amber"
                      density="compact"
                      readonly
                      size="x-small"
                    />
                  </div>
                  <div class="text-caption text-grey">
                    {{ formatRelativeDate(review.created_at) }}
                    <span v-if="review.is_edited">(изменено)</span>
                  </div>
                  <div class="mt-2 review-content">{{ review.content }}</div>
                  
                  <div class="d-flex align-center mt-2">
                    <v-btn
                      variant="text"
                      size="small"
                      :color="review.is_liked ? 'primary' : ''"
                      @click="toggleLike(review)"
                      :loading="review.isLikeLoading"
                      :disabled="!isAuthenticated || review.isLikeLoading"
                      class="like-button"
                    >
                      <v-icon size="18" class="mr-2">
                        {{ review.is_liked ? 'mdi-thumb-up' : 'mdi-thumb-up-outline' }}
                      </v-icon>
                      <span class="likes-count">{{ review.likes_count }}</span>
                    </v-btn>

                    <v-menu v-if="!isAuthLoading && currentUserId === review.author.id">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          variant="text"
                          size="small"
                          v-bind="props"
                          class="ml-2"
                          :disabled="loading"
                        >
                          <v-icon size="small">mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>

                      <v-list>
                        <v-list-item @click="updateReview(review)" :disabled="loading">
                          <v-list-item-title>
                            <v-icon size="small" class="mr-2">mdi-pencil</v-icon>
                            Редактировать
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteReview(review)" :disabled="loading">
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
                :readonly="loading"
              />
            </div>
            <v-textarea
              v-model="reviewForm.content"
              label="Ваш отзыв (необязательно)"
              rows="4"
              counter
              maxlength="2000"
              :rules="[v => !v || v.length <= 2000 || 'Максимальная длина отзыва - 2000 символов']"
              :readonly="loading"
            />
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="primary"
                variant="text"
                @click="showReviewDialog = false"
                :disabled="loading"
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
            :disabled="loading"
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
import { ref, computed, onMounted, toRaw, onBeforeUnmount, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import reviewApi from '@/services/api/contest_review.api'
import { usePlatformStore } from '@/stores/platform'

// Props
const props = defineProps({
  entityId: {
    type: [String, Object],
    required: true,
    validator: (value) => {
      if (!value) {
        console.error('entityId is required')
        return false
      }
      
      // Если передан объект, пытаемся извлечь id
      if (typeof value === 'object') {
        const id = value.id || value.contestId || value.platformId
        if (!id) {
          console.error('entityId object must contain id/contestId/platformId property')
          return false
        }
        return true
      }
      
      // Если передана строка
      if (typeof value === 'string') {
        return true
      }
      
      console.error('entityId must be a string or object with id')
      return false
    }
  },
  entityType: {
    type: String,
    required: true,
    validator: (value) => {
      const validTypes = ['contest', 'platform']
      if (!validTypes.includes(value)) {
        console.error(`entityType must be one of: ${validTypes.join(', ')}`)
        return false
      }
      return true
    }
  },
  canRate: {
    type: Boolean,
    default: false,
    validator: (value) => {
      if (typeof value !== 'boolean') {
        console.error('canRate must be a boolean')
        return false
      }
      return true
    }
  }
})

// Эмиты
const emit = defineEmits(['update:rating', 'update:reviewsCount', 'rate'])

// Состояние
const reviews = ref([])
const pagination = ref({
  total: 0,
  page: 1,
  limit: 10,
  pages: 0
})
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

// Состояние фильтрации и сортировки
const sorting = ref('createdAt')
const sortDirection = ref('desc')
const activeFilter = ref('all')
const ratingFilter = ref(null)
const search = ref('')
const searchTimeout = ref(null)

// Состояние для уведомлений
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Получаем данные из хранилища
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const platformStore = usePlatformStore()

// Состояние загрузки авторизации
const isAuthLoading = ref(true)

// Состояние компонента
const validateState = () => {
  try {
    // Проверка props
    if (!props.entityId || !props.entityType) {
      console.error('Missing required props:', {
        entityId: props.entityId,
        entityType: props.entityType
      })
      return false
    }

    // Проверка reviews
    if (!Array.isArray(reviews.value)) {
      console.error('Invalid reviews state:', reviews.value)
      return false
    }

    // Проверка pagination
    if (!pagination.value || typeof pagination.value !== 'object') {
      console.error('Invalid pagination state:', pagination.value)
      return false
    }

    // Проверка sorting
    if (!sorting.value || typeof sorting.value !== 'string') {
      console.error('Invalid sorting state:', sorting.value)
      return false
    }

    // Проверка filters
    if (!activeFilter.value || typeof activeFilter.value !== 'string') {
      console.error('Invalid filter state:', activeFilter.value)
      return false
    }

    if (ratingFilter.value !== null && (typeof ratingFilter.value !== 'number' || ratingFilter.value < 1 || ratingFilter.value > 5)) {
      console.error('Invalid rating filter state:', ratingFilter.value)
      return false
    }

    // Проверка search
    if (typeof search.value !== 'string') {
      console.error('Invalid search state:', search.value)
      return false
    }

    return true
  } catch (error) {
    console.error('Error validating component state:', error)
    return false
  }
}

// Хуки жизненного цикла
onMounted(async () => {
  try {
    isAuthLoading.value = true
    
    // Инициализируем состояние авторизации
    await authStore.init()
    
    // Проверяем валидность состояния
    if (!validateState()) {
      showNotification('error', 'Ошибка инициализации компонента')
      return
    }
    
    // Загружаем отзывы
  await fetchReviews()
    
    console.log('Component mounted:', {
      isAuthenticated: isAuthenticated.value,
      userId: authStore.user?.id,
      canRate: props.canRate
    })
  } catch (error) {
    console.error('Error in onMounted hook:', error)
    showNotification('error', 'Ошибка при инициализации компонента')
  } finally {
    isAuthLoading.value = false
  }
})

onBeforeUnmount(() => {
  try {
    // Очищаем состояние при размонтировании
    reviews.value = []
    reviewForm.value = {
      rating: 0,
      content: ''
    }
    editingReview.value = null
    reviewToDelete.value = null
    showReviewDialog.value = false
    showDeleteDialog.value = false
    loading.value = false
  } catch (error) {
    console.error('Error in onBeforeUnmount hook:', error)
  }
})

// Наблюдатели
watch([() => props.entityId, () => props.entityType], async ([newEntityId, newEntityType], [oldEntityId, oldEntityType]) => {
  try {
    if (newEntityId === oldEntityId && newEntityType === oldEntityType) {
      return
    }

    if (!validateState()) {
      showNotification('error', 'Ошибка обновления компонента')
      return
    }

    await fetchReviews()
  } catch (error) {
    console.error('Error in entityId/entityType watcher:', error)
    showNotification('error', 'Ошибка при обновлении отзывов')
  }
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
  try {
    // Проверяем, что авторизация не в процессе загрузки
    if (isAuthLoading.value) {
      return false
    }

    // Проверяем состояние авторизации в хранилище
    const isAuth = authStore.isAuthenticated && authStore.isInitialized && authStore.user?.id

    console.log('isAuthenticated check:', {
      isAuthLoading: isAuthLoading.value,
      storeIsAuthenticated: authStore.isAuthenticated,
      storeIsInitialized: authStore.isInitialized,
      userId: authStore.user?.id,
      result: isAuth
    })

    return isAuth
  } catch (error) {
    console.error('Error checking authentication:', error)
    return false
  }
})

const currentUserId = computed(() => {
  if (!isAuthenticated.value || !authStore.user) {
    return null
  }
  return authStore.user.id
})

const hasUserReview = computed(() => {
  if (!currentUserId.value) {
    return false
  }
  return reviews.value.some(review => review.author.id === currentUserId.value)
})

// Методы для работы с уведомлениями
const showNotification = (type, message, timeout = 5000) => {
  try {
    // Проверяем доступность notificationStore
    if (!notificationStore) {
      console.warn('NotificationStore not available, falling back to snackbar')
      snackbarText.value = message
      snackbarColor.value = type === 'error' ? 'error' : 
                           type === 'success' ? 'success' : 
                           type === 'warning' ? 'warning' : 'info'
      showSnackbar.value = true
      return
    }

    // Проверяем метод addNotification
    if (typeof notificationStore.addNotification !== 'function') {
      console.warn('NotificationStore.addNotification not available, falling back to show method')
      if (typeof notificationStore.show === 'function') {
        notificationStore.show({
          type,
          message,
          timeout
        })
        return
      }
      
      // Если оба метода недоступны, используем snackbar
      snackbarText.value = message
      snackbarColor.value = type === 'error' ? 'error' : 
                           type === 'success' ? 'success' : 
                           type === 'warning' ? 'warning' : 'info'
      showSnackbar.value = true
      return
    }

    // Используем предпочтительный метод
    notificationStore.addNotification({
      type,
      message,
      timeout
    })
  } catch (error) {
    console.error('Error showing notification:', error)
    // Fallback к локальному snackbar в случае ошибки
    snackbarText.value = message
    snackbarColor.value = type === 'error' ? 'error' : 
                         type === 'success' ? 'success' : 
                         type === 'warning' ? 'warning' : 'info'
    showSnackbar.value = true
  }
}

const showErrorNotification = (message) => {
  showNotification('error', message)
}

const showSuccessNotification = (message) => {
  showNotification('success', message)
}

const showWarningNotification = (message) => {
  showNotification('warning', message)
}

const showInfoNotification = (message) => {
  showNotification('info', message)
}

// Метод для форматирования даты
const formatDate = (date) => {
  try {
    if (!date) {
      console.warn('formatDate: date is undefined or null')
      return 'Дата не указана'
    }

    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      console.warn('formatDate: invalid date format:', date)
      return 'Некорректная дата'
    }

    return dateObj.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error in formatDate:', error)
    return 'Ошибка форматирования даты'
  }
}

const formatRelativeDate = (date) => {
  try {
    // Проверяем наличие даты
    if (!date) {
      console.warn('formatRelativeDate: date is undefined or null')
      return 'Дата не указана'
    }

    // Пытаемся создать объект даты
    const dateObj = new Date(date)
    
    // Проверяем валидность даты
    if (isNaN(dateObj.getTime())) {
      console.warn('formatRelativeDate: invalid date format:', date)
      return 'Некорректная дата'
    }

    // Получаем текущую дату
    const now = new Date()
    
    // Проверяем, что дата не в будущем
    if (dateObj > now) {
      console.warn('formatRelativeDate: date is in future:', date)
      return formatDate(date)
    }

    const diff = now - dateObj
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    // Форматируем относительную дату
    if (years > 0) {
      return `${years} ${getYearsDeclension(years)} назад`
    } else if (months > 0) {
      return `${months} ${getMonthsDeclension(months)} назад`
    } else if (days > 0) {
      return `${days} ${getDaysDeclension(days)} назад`
    } else if (hours > 0) {
      return `${hours} ${getHoursDeclension(hours)} назад`
    } else if (minutes > 0) {
      return `${minutes} ${getMinutesDeclension(minutes)} назад`
    } else if (seconds > 30) {
      return `${seconds} секунд назад`
    } else {
      return 'Только что'
    }
  } catch (error) {
    console.error('Error in formatRelativeDate:', error)
    return 'Ошибка форматирования даты'
  }
}

const getYearsDeclension = (years) => {
  try {
    const lastDigit = years % 10
    const lastTwoDigits = years % 100

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'лет'
    }

    if (lastDigit === 1) {
      return 'год'
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'года'
    }

    return 'лет'
  } catch (error) {
    console.error('Error getting years declension:', error)
    return 'лет'
  }
}

const getMonthsDeclension = (months) => {
  try {
    const lastDigit = months % 10
    const lastTwoDigits = months % 100

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'месяцев'
    }

    if (lastDigit === 1) {
      return 'месяц'
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'месяца'
    }

    return 'месяцев'
  } catch (error) {
    console.error('Error getting months declension:', error)
    return 'месяцев'
  }
}

const getDaysDeclension = (days) => {
  try {
    if (typeof days !== 'number' || days < 0) {
      console.error('Invalid days count:', days)
      return 'дней'
    }

    const lastDigit = days % 10
    const lastTwoDigits = days % 100

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'дней'
    }

    if (lastDigit === 1) {
      return 'день'
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'дня'
    }

    return 'дней'
  } catch (error) {
    console.error('Error getting days declension:', error)
    return 'дней'
  }
}

const getHoursDeclension = (hours) => {
  try {
    if (typeof hours !== 'number' || hours < 0) {
      console.error('Invalid hours count:', hours)
      return 'часов'
    }

    const lastDigit = hours % 10
    const lastTwoDigits = hours % 100

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'часов'
    }

    if (lastDigit === 1) {
      return 'час'
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'часа'
    }

    return 'часов'
  } catch (error) {
    console.error('Error getting hours declension:', error)
    return 'часов'
  }
}

const getMinutesDeclension = (minutes) => {
  try {
    if (typeof minutes !== 'number' || minutes < 0) {
      console.error('Invalid minutes count:', minutes)
      return 'минут'
    }

    const lastDigit = minutes % 10
    const lastTwoDigits = minutes % 100

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'минут'
    }

    if (lastDigit === 1) {
      return 'минута'
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'минуты'
    }

    return 'минут'
  } catch (error) {
    console.error('Error getting minutes declension:', error)
    return 'минут'
  }
}

// Вычисляемые свойства
const canAddReview = computed(() => {
  try {
    // Проверяем авторизацию
    if (!isAuthenticated.value || isAuthLoading.value) {
      return false
    }

    // Проверяем разрешение на оценку
    if (!props.canRate) {
      return false
    }

    // Проверяем наличие пользователя
    if (!authStore.user?.id) {
      return false
    }

    // Проверяем, не оставил ли пользователь уже отзыв
    const hasReview = reviews.value.some(review => 
      review.author?.id === authStore.user.id
    )

    console.log('canAddReview check:', {
      isAuthenticated: isAuthenticated.value,
      isAuthLoading: isAuthLoading.value,
      canRate: props.canRate,
      userId: authStore.user?.id,
      hasReview,
      reviews: reviews.value.map(r => ({ 
        id: r.id, 
        authorId: r.author?.id 
      }))
    })

    return !hasReview
  } catch (error) {
    console.error('Error checking if can add review:', error)
    return false
  }
})

const averageRating = computed(() => {
  try {
    if (!reviews.value || !reviews.value.length) {
      return 0
    }

  const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0)
    return Number((sum / reviews.value.length).toFixed(1))
  } catch (error) {
    console.error('Error calculating average rating:', error)
    return 0
  }
})

const ratingDistribution = computed(() => {
  try {
    const distribution = {
      value: [0, 0, 0, 0, 0]
    };
    
    if (!reviews.value || !reviews.value.length) {
      console.debug('No reviews available for rating distribution');
      return distribution;
    }

    console.debug('Calculating rating distribution for reviews:', reviews.value.length);

    // Подсчитываем количество каждой оценки
    reviews.value.forEach(review => {
      const rating = Math.round(review.rating); // Округляем на случай дробных оценок
      if (rating >= 1 && rating <= 5) {
        distribution.value[rating - 1]++; // Индексы 0-4 соответствуют оценкам 1-5
      }
    });

    console.debug('Calculated rating distribution:', distribution);
    return distribution;
  } catch (error) {
    console.error('Error calculating rating distribution:', error);
    return { value: [0, 0, 0, 0, 0] };
  }
});

const getProgressValue = (rating) => {
  try {
    if (!reviews.value.length) return 0;
    const count = ratingDistribution.value?.value?.[rating - 1] || 0;
    const progress = (count / reviews.value.length) * 100;
    console.debug('Progress value for rating', rating, ':', { count, total: reviews.value.length, progress });
    return progress;
  } catch (error) {
    console.error('Error calculating progress value:', error);
    return 0;
  }
};

const getPercentage = (rating) => {
  try {
    if (!reviews.value.length) return 0;
    const count = ratingDistribution.value?.value?.[rating - 1] || 0;
    const percentage = Math.round((count / reviews.value.length) * 100) || 0;
    console.debug('Percentage for rating', rating, ':', { count, total: reviews.value.length, percentage });
    return percentage;
  } catch (error) {
    console.error('Error calculating percentage:', error);
    return 0;
  }
};

// Методы работы с API
const getEntityId = computed(() => {
  if (typeof props.entityId === 'object') {
    return (props.entityId.id || props.entityId.contestId || props.entityId.platformId).toString()
  }
  return props.entityId.toString()
})

const fetchReviews = async () => {
  try {
    if (loading.value) return

    loading.value = true
    console.log('Fetching reviews for:', getEntityId.value)
    
    const response = await reviewApi.getReviews(
      getEntityId.value,
      pagination.value.page,
      pagination.value.limit
    )

    console.log('Reviews API response:', response)

    if (!response || typeof response !== 'object') {
      console.error('Invalid API response:', response)
      showErrorNotification('Некорректный ответ от сервера')
      return
    }

    // Проверяем наличие отзывов в ответе
    if (!Array.isArray(response.reviews)) {
      console.error('Reviews array is missing in response:', response)
      showErrorNotification('Некорректный формат данных отзывов')
      return
    }

    // Обновляем состояние на основе ответа API с проверкой дат
    reviews.value = response.reviews.map(review => {
      let normalizedReview = { ...review }

      // Проверяем и нормализуем дату создания
      if (!normalizedReview.created_at && normalizedReview.createdAt) {
        normalizedReview.created_at = normalizedReview.createdAt
      }
      
      if (!normalizedReview.created_at && normalizedReview.updatedAt) {
        normalizedReview.created_at = normalizedReview.updatedAt
      }
      
      // Если дата все еще отсутствует, используем текущую дату
      if (!normalizedReview.created_at) {
        console.warn('Review is missing created_at, using current date:', normalizedReview)
        normalizedReview.created_at = new Date().toISOString()
      }

      // Проверяем формат даты и конвертируем в ISO строку если нужно
      try {
        const date = new Date(normalizedReview.created_at)
        if (!isNaN(date.getTime())) {
          normalizedReview.created_at = date.toISOString()
    } else {
          console.warn('Invalid date format, using current date:', normalizedReview.created_at)
          normalizedReview.created_at = new Date().toISOString()
    }
  } catch (error) {
        console.warn('Error parsing date, using current date:', error)
        normalizedReview.created_at = new Date().toISOString()
      }

      return {
        ...normalizedReview,
        isLikeLoading: false
      }
    })

    // Логируем отзывы для отладки
    console.log('Mapped reviews:', reviews.value.map(r => ({
      id: r.id,
      created_at: r.created_at,
      content: r.content?.substring(0, 50)
    })))

    pagination.value = {
      total: response.total || 0,
      page: response.page || 1,
      limit: pagination.value.limit,
      pages: response.totalPages || 1
    }
  } catch (error) {
    console.error('Error fetching reviews:', error)
    showErrorNotification('Ошибка при загрузке отзывов')
  } finally {
    loading.value = false
  }
}

const submitReview = async () => {
  try {
    if (loading.value) return

  loading.value = true
    console.log('Submitting review:', {
      reviewId: editingReview.value?.id,
      currentData: {
      rating: reviewForm.value.rating,
        content: reviewForm.value.content
    }
    })

    let response
    if (editingReview.value) {
      // Обновляем существующий отзыв
      response = await reviewApi.updateReview(editingReview.value.id, {
        rating: reviewForm.value.rating,
        content: reviewForm.value.content
      })
    } else {
      // Создаем новый отзыв
      response = await reviewApi.addReview(props.entityId, {
        rating: reviewForm.value.rating,
        content: reviewForm.value.content
      })
    }

    console.log('Review submission response:', response)

    if (response.success) {
      // Если это новый отзыв, добавляем его в начало списка
      if (!editingReview.value && response.data?.review) {
        // Проверяем наличие пользователя
        if (!authStore.user) {
          throw new Error('Пользователь не авторизован')
        }

        reviews.value.unshift({
          ...response.data.review,
          author: {
            id: authStore.user.id,
            username: authStore.user.username,
            avatar: authStore.user.avatar
          },
          isLikeLoading: false,
          isLiked: false,
          likes_count: 0
        })
      } else if (editingReview.value && response.data?.review) {
        // Если это редактирование, обновляем существующий отзыв
        const index = reviews.value.findIndex(r => r.id === editingReview.value.id)
        if (index !== -1) {
          reviews.value[index] = {
            ...reviews.value[index],
            ...response.data.review,
            author: reviews.value[index].author
          }
        }
      }
      
      // Обновляем рейтинг конкурса если он пришел в ответе
        if (response.data?.contestStats?.rating !== undefined) {
        console.log('Updating contest rating:', response.data.contestStats.rating)
          emit('update:rating', response.data.contestStats.rating)
        }
        
      // Обновляем количество отзывов
      emit('update:reviewsCount', reviews.value.length)
      
      showNotification('success', editingReview.value ? 'Отзыв успешно обновлен' : 'Отзыв успешно добавлен')
      showReviewDialog.value = false
      editingReview.value = null
      
      // Сбрасываем форму
      reviewForm.value = {
        rating: 0,
        content: ''
      }
    } else {
      console.error('Error in submitReview:', response)
      showNotification('error', response.message || 'Не удалось сохранить отзыв')
    }
  } catch (error) {
    console.error('Error in submitReview:', error)
    showNotification('error', error.message || 'Не удалось сохранить отзыв')
  } finally {
    loading.value = false
  }
}

const updateReview = (review) => {
  if (!isAuthenticated.value) {
    showNotification('error', 'Для редактирования отзыва необходимо авторизоваться')
    return
  }

  if (loading.value) {
    return
  }

  // Проверяем, является ли текущий пользователь автором отзыва
  if (review.author.id !== currentUserId.value) {
    showNotification('error', 'Вы можете редактировать только свои отзывы')
    return
  }

  try {
    console.log('Updating review:', {
      reviewId: review.id,
      currentData: {
        rating: review.rating,
        content: review.content
      }
    })

  editingReview.value = review
  reviewForm.value = {
    rating: review.rating,
    content: review.content,
    id: review.id
  }
  showReviewDialog.value = true
  } catch (error) {
    console.error('Error in updateReview:', {
      error,
      message: error.message,
      review
    })
    showNotification('error', 'Не удалось открыть форму редактирования')
  }
}

const deleteReview = async (review) => {
  try {
    if (!review || !review.id) {
      console.error('Invalid review data:', review)
      showNotification('error', 'Некорректные данные отзыва')
      return
    }

    if (!isAuthenticated.value) {
      showNotification('error', 'Необходимо авторизоваться')
      return
    }

    loading.value = true
    console.log('Deleting review:', { reviewId: review.id })
    
    const response = await reviewApi.deleteReview(review.id)
    console.log('Delete review response:', response)

    if (response.success) {
      // Удаляем отзыв из локального списка
      const index = reviews.value.findIndex(r => r.id === review.id)
      if (index !== -1) {
        reviews.value.splice(index, 1)
      }
      
      // Обновляем рейтинг конкурса если он пришел в ответе
      if (response.data?.contestStats?.rating !== undefined) {
        console.log('Updating contest rating after delete:', response.data.contestStats.rating)
        emit('update:rating', response.data.contestStats.rating)
      }
      
      // Обновляем количество отзывов
      emit('update:reviewsCount', reviews.value.length)
      
      showNotification('success', 'Отзыв успешно удален')
      showDeleteDialog.value = false
      reviewToDelete.value = null
    } else {
      console.error('Failed to delete review:', response)
      showNotification('error', response.message || 'Не удалось удалить отзыв')
    }
  } catch (error) {
    console.error('Error deleting review:', error)
    showNotification('error', error.message || 'Ошибка при удалении отзыва')
  } finally {
    loading.value = false
  }
}

const confirmDeleteReview = async () => {
  if (!reviewToDelete.value) return

  loading.value = true
  try {
    console.log('Deleting review:', {
      reviewId: reviewToDelete.value.id
    })

    const response = await reviewApi.deleteReview(reviewToDelete.value.id)
    console.log('Delete review response:', {
      success: response.success,
      data: response.data,
      message: response.message
    })

    if (response.success) {
      const index = reviews.value.findIndex(r => r.id === reviewToDelete.value.id)
      if (index !== -1) {
        reviews.value.splice(index, 1)
        emit('update:reviewsCount', reviews.value.length)
        
        if (response.data?.contestStats?.rating !== undefined) {
          console.log('Updating contest rating after deleting review:', response.data.contestStats.rating)
          emit('update:rating', response.data.contestStats.rating)
        }
        
        showNotification('success', 'Отзыв удален')
        showDeleteDialog.value = false
        reviewToDelete.value = null
      }
    } else {
      console.error('Failed to delete review:', response.message)
      showNotification(response.message || 'Не удалось удалить отзыв', 'error')
    }
  } catch (error) {
    console.error('Error in confirmDeleteReview:', {
      error,
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    showNotification(error.message || 'Не удалось удалить отзыв', 'error')
  } finally {
    loading.value = false
  }
}

const toggleLike = async (review) => {
  try {
    if (!review || !review.id) {
      console.error('Invalid review data:', review)
      showNotification('error', 'Некорректные данные отзыва')
      return
    }

    if (!isAuthenticated.value) {
      showNotification('error', 'Необходимо авторизоваться')
      return
    }

    review.isLikeLoading = true
    const response = await reviewApi.toggleLike(review.id)
    console.log('Toggle like response:', response)

    if (response && response.success) {
      const index = reviews.value.findIndex(r => r.id === review.id)
      if (index !== -1) {
        // Обновляем состояние на основе ответа от сервера
        const newLikesCount = response.data?.likesCount ?? 
          (reviews.value[index].likes_count + (response.data?.isLiked ? 1 : -1))

        reviews.value[index] = {
          ...reviews.value[index],
          is_liked: response.data?.isLiked ?? !reviews.value[index].is_liked,
          likes_count: newLikesCount,
          isLikeLoading: false
        }
      }
    } else {
      showNotification('error', response.message || 'Не удалось обновить лайк')
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    showNotification('error', error.message || 'Ошибка при обновлении лайка')
  } finally {
    if (review) {
      review.isLikeLoading = false
    }
  }
}

const reportReview = async (review, reason) => {
  try {
    if (!review || !review.id) {
      console.error('Invalid review data:', review)
      showNotification('error', 'Некорректные данные отзыва')
      return
    }

    if (!reason) {
      console.error('No report reason provided')
      showNotification('error', 'Необходимо указать причину жалобы')
      return
    }

    if (!isAuthenticated.value) {
      showNotification('error', 'Необходимо авторизоваться')
      return
    }

    loading.value = true
    const response = await reviewApi.reportReview(review.id, reason)

    if (response.success) {
      showNotification('success', 'Жалоба успешно отправлена')
      closeReportDialog()
    }
  } catch (error) {
    console.error('Error reporting review:', error)
    showNotification('error', error.message || 'Ошибка при отправке жалобы')
  } finally {
    loading.value = false
  }
}

// Методы для работы с диалогами
const validateDialog = (dialog) => {
  try {
    if (!dialog || typeof dialog !== 'object') {
      console.error('Invalid dialog object:', dialog)
      return false
    }

    if (typeof dialog.show !== 'boolean') {
      console.error('Invalid dialog show state:', dialog.show)
      return false
    }

    return true
  } catch (error) {
    console.error('Error validating dialog:', error)
    return false
  }
}

const showDialog = (dialogRef, data = null) => {
  try {
    if (!dialogRef || typeof dialogRef.value !== 'boolean') {
      console.error('Invalid dialog reference:', dialogRef)
      return
    }

    if (data && !validateReviewData(data)) {
      return
    }

    dialogRef.value = true
  } catch (error) {
    console.error('Error showing dialog:', error)
  }
}

const hideDialog = (dialogRef) => {
  try {
    if (!dialogRef || typeof dialogRef.value !== 'boolean') {
      console.error('Invalid dialog reference:', dialogRef)
      return
    }

    dialogRef.value = false
  } catch (error) {
    console.error('Error hiding dialog:', error)
  }
}

const resetDialogData = () => {
  try {
    reviewData.value = {
      rating: 0,
      content: ''
    }
    selectedReview.value = null
    reviewToDelete.value = null
    reviewToReport.value = null
    reportReason.value = ''
  } catch (error) {
    console.error('Error resetting dialog data:', error)
  }
}

const openReviewDialog = (review = null) => {
  try {
    if (!isAuthenticated.value) {
      showErrorNotification('Необходимо авторизоваться')
      return
    }

    if (review && !validateReviewData(review)) {
      showErrorNotification('Некорректные данные отзыва')
      return
    }

    resetDialogData()
    if (review) {
      reviewData.value = { ...review }
      selectedReview.value = review
    }
    showDialog(showReviewDialog)
  } catch (error) {
    console.error('Error opening review dialog:', error)
    showErrorNotification('Ошибка при открытии формы отзыва')
  }
}

const openDeleteDialog = (review) => {
  try {
    if (!isAuthenticated.value) {
      showErrorNotification('Необходимо авторизоваться')
      return
    }

    if (!validateReviewData(review)) {
      showErrorNotification('Некорректные данные отзыва')
      return
    }

    resetDialogData()
    reviewToDelete.value = review
    showDialog(showDeleteDialog)
  } catch (error) {
    console.error('Error opening delete dialog:', error)
    showErrorNotification('Ошибка при открытии диалога удаления')
  }
}

const openReportDialog = (review) => {
  try {
    if (!isAuthenticated.value) {
      showErrorNotification('Необходимо авторизоваться')
      return
    }

    if (!validateReviewData(review)) {
      showErrorNotification('Некорректные данные отзыва')
      return
    }

    resetDialogData()
    reviewToReport.value = review
    showDialog(showReportDialog)
  } catch (error) {
    console.error('Error opening report dialog:', error)
    showErrorNotification('Ошибка при открытии формы жалобы')
  }
}

const closeReviewDialog = () => {
  try {
    hideDialog(showReviewDialog)
    resetDialogData()
  } catch (error) {
    console.error('Error closing review dialog:', error)
  }
}

const closeDeleteDialog = () => {
  try {
    hideDialog(showDeleteDialog)
    resetDialogData()
  } catch (error) {
    console.error('Error closing delete dialog:', error)
  }
}

const closeReportDialog = () => {
  try {
    hideDialog(showReportDialog)
    resetDialogData()
  } catch (error) {
    console.error('Error closing report dialog:', error)
  }
}

const handleRate = async (rating) => {
  try {
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      console.error('Invalid rating value:', rating)
      showNotification('error', 'Некорректное значение оценки')
      return
    }

    if (!isAuthenticated.value) {
      showNotification('error', 'Необходимо авторизоваться')
      return
    }

    if (!props.canRate) {
      showNotification('error', 'У вас нет прав для оценки')
      return
    }

    loading.value = true
    reviewForm.value = {
      rating,
      content: ''
    }
    showReviewDialog.value = true
  emit('rate', rating)
  } catch (error) {
    console.error('Error handling rate:', error)
    showNotification('error', error.message || 'Ошибка при обработке оценки')
  } finally {
    loading.value = false
  }
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

const handlePageChange = async (page) => {
  try {
    if (!page || typeof page !== 'number' || page < 1) {
      console.error('Invalid page number:', page)
      showNotification('error', 'Некорректный номер страницы')
      return
    }

    if (loading.value) {
      return
    }

    await fetchReviews()
  } catch (error) {
    console.error('Error changing page:', error)
    showNotification('error', 'Ошибка при смене страницы')
  }
}

const handlePerPageChange = async (perPage) => {
  try {
    if (!perPage || typeof perPage !== 'number' || perPage < 1) {
      console.error('Invalid per page value:', perPage)
      showNotification('error', 'Некорректное количество элементов на странице')
      return
    }

    if (loading.value) {
      return
    }

    pagination.value.perPage = perPage
    await fetchReviews()
  } catch (error) {
    console.error('Error changing items per page:', error)
    showNotification('error', 'Ошибка при изменении количества элементов на странице')
  }
}

const handleSortChange = async (sortBy) => {
  try {
    if (!sortBy || typeof sortBy !== 'string') {
      console.error('Invalid sort parameter:', sortBy)
      showNotification('error', 'Некорректный параметр сортировки')
      return
    }

    const validSortFields = ['rating', 'createdAt', 'likesCount']
    if (!validSortFields.includes(sortBy)) {
      console.error('Invalid sort field:', sortBy)
      showNotification('error', 'Некорректное поле сортировки')
      return
    }

    if (loading.value) {
      return
    }

    sorting.value = sortBy
    await fetchReviews()
  } catch (error) {
    console.error('Error changing sort:', error)
    showNotification('error', 'Ошибка при изменении сортировки')
  }
}

const handleSortDirectionChange = async (direction) => {
  try {
    if (!direction || typeof direction !== 'string') {
      console.error('Invalid sort direction:', direction)
      showNotification('error', 'Некорректное направление сортировки')
      return
    }

    const validDirections = ['asc', 'desc']
    if (!validDirections.includes(direction)) {
      console.error('Invalid sort direction:', direction)
      showNotification('error', 'Некорректное направление сортировки')
      return
    }

    if (loading.value) {
      return
    }

    sortDirection.value = direction
    await fetchReviews()
  } catch (error) {
    console.error('Error changing sort direction:', error)
    showNotification('error', 'Ошибка при изменении направления сортировки')
  }
}

const handleFilterChange = async (filter) => {
  try {
    if (!filter || typeof filter !== 'string') {
      console.error('Invalid filter parameter:', filter)
      showNotification('error', 'Некорректный параметр фильтрации')
      return
    }

    const validFilters = ['all', 'positive', 'negative', 'neutral']
    if (!validFilters.includes(filter)) {
      console.error('Invalid filter value:', filter)
      showNotification('error', 'Некорректное значение фильтра')
      return
    }

    if (loading.value) {
      return
    }

    activeFilter.value = filter
    await fetchReviews()
  } catch (error) {
    console.error('Error changing filter:', error)
    showNotification('error', 'Ошибка при изменении фильтра')
  }
}

const handleRatingFilterChange = async (rating) => {
  try {
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      console.error('Invalid rating filter:', rating)
      showNotification('error', 'Некорректное значение фильтра по оценке')
      return
    }

    if (loading.value) {
      return
    }

    ratingFilter.value = rating
    await fetchReviews()
  } catch (error) {
    console.error('Error changing rating filter:', error)
    showNotification('error', 'Ошибка при изменении фильтра по оценке')
  }
}

const clearFilters = async () => {
  try {
    if (loading.value) {
      return
    }

    activeFilter.value = 'all'
    ratingFilter.value = null
    await fetchReviews()
  } catch (error) {
    console.error('Error clearing filters:', error)
    showNotification('error', 'Ошибка при сбросе фильтров')
  }
}

const handleSearch = async (searchQuery) => {
  try {
    if (typeof searchQuery !== 'string') {
      console.error('Invalid search query:', searchQuery)
      showNotification('error', 'Некорректный поисковый запрос')
      return
    }

    if (loading.value) {
      return
    }

    search.value = searchQuery.trim()
    await fetchReviews()
  } catch (error) {
    console.error('Error performing search:', error)
    showNotification('error', 'Ошибка при выполнении поиска')
  }
}

const clearSearch = async () => {
  try {
    if (loading.value) {
      return
    }

    search.value = ''
    await fetchReviews()
  } catch (error) {
    console.error('Error clearing search:', error)
    showNotification('error', 'Ошибка при очистке поиска')
  }
}

const debounceSearch = (value) => {
  try {
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
    }

    searchTimeout.value = setTimeout(() => {
      handleSearch(value)
    }, 500)
  } catch (error) {
    console.error('Error in debounced search:', error)
    showNotification('error', 'Ошибка при обработке поискового запроса')
  }
}

const exportReviews = async (format) => {
  try {
    if (!format || typeof format !== 'string') {
      console.error('Invalid export format:', format)
      showNotification('error', 'Некорректный формат экспорта')
      return
    }

    const validFormats = ['csv', 'excel', 'pdf']
    if (!validFormats.includes(format)) {
      console.error('Invalid export format:', format)
      showNotification('error', 'Неподдерживаемый формат экспорта')
      return
    }

    if (loading.value) {
      return
    }

    loading.value = true
    const response = await reviewService.exportReviews({
      entityId: props.entityId,
      entityType: props.entityType,
      format,
      filters: {
        rating: ratingFilter.value,
        type: activeFilter.value,
        search: search.value
      }
    })

    if (response.success) {
      const blob = new Blob([response.data], { type: response.contentType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `reviews-${props.entityType}-${props.entityId}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      showNotification('success', 'Экспорт успешно выполнен')
    }
  } catch (error) {
    console.error('Error exporting reviews:', error)
    showNotification('error', error.message || 'Ошибка при экспорте отзывов')
  } finally {
    loading.value = false
  }
}

const validateExportData = (data) => {
  try {
    if (!data || typeof data !== 'object') {
      console.error('Invalid export data:', data)
      return false
    }

    if (!data.entityId || !data.entityType || !data.format) {
      console.error('Missing required export parameters:', data)
      return false
    }

    if (data.filters) {
      if (data.filters.rating && (typeof data.filters.rating !== 'number' || data.filters.rating < 1 || data.filters.rating > 5)) {
        console.error('Invalid rating filter in export:', data.filters.rating)
        return false
      }

      if (data.filters.type && !['all', 'positive', 'negative', 'neutral'].includes(data.filters.type)) {
        console.error('Invalid type filter in export:', data.filters.type)
        return false
      }

      if (data.filters.search && typeof data.filters.search !== 'string') {
        console.error('Invalid search filter in export:', data.filters.search)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Error validating export data:', error)
    return false
  }
}

const importReviews = async (file) => {
  try {
    if (!file || !(file instanceof File)) {
      console.error('Invalid file:', file)
      showNotification('error', 'Некорректный файл')
      return
    }

    const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      console.error('Invalid file type:', file.type)
      showNotification('error', 'Неподдерживаемый тип файла')
      return
    }

    if (loading.value) {
      return
    }

    loading.value = true
    const formData = new FormData()
    formData.append('file', file)
    formData.append('entityId', props.entityId)
    formData.append('entityType', props.entityType)

    const response = await reviewService.importReviews(formData)

    if (response.success) {
      reviews.value = response.data.reviews.map(review => ({
        ...review,
        isLikeLoading: false
      }))
      showNotification('success', 'Импорт успешно выполнен')
      await fetchReviews()
    }
  } catch (error) {
    console.error('Error importing reviews:', error)
    showNotification('error', error.message || 'Ошибка при импорте отзывов')
  } finally {
    loading.value = false
  }
}

const validateImportFile = (file) => {
  try {
    if (!file || !(file instanceof File)) {
      console.error('Invalid import file:', file)
      return false
    }

    const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      console.error('Invalid import file type:', file.type)
      return false
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      console.error('Import file too large:', file.size)
      return false
    }

    return true
  } catch (error) {
    console.error('Error validating import file:', error)
    return false
  }
}

const handleFileSelect = (event) => {
  try {
    const file = event.target.files[0]
    if (!validateImportFile(file)) {
      showNotification('error', 'Некорректный файл для импорта')
      return
    }

    importReviews(file)
  } catch (error) {
    console.error('Error handling file select:', error)
    showNotification('error', 'Ошибка при выборе файла')
  }
}

// Методы для работы с пользователями
const validateUser = (user) => {
  try {
    if (!user || typeof user !== 'object') {
      console.error('Invalid user object:', user)
      return false
    }

    if (!user.id || typeof user.id !== 'string') {
      console.error('Invalid user ID:', user.id)
      return false
    }

    if (!user.username || typeof user.username !== 'string') {
      console.error('Invalid username:', user.username)
      return false
    }

    return true
  } catch (error) {
    console.error('Error validating user:', error)
    return false
  }
}

const canUserEditReview = computed(() => (review) => {
  try {
    if (!review || typeof review !== 'object') {
      console.error('Invalid review object:', review)
      return false
    }

    if (!isAuthenticated.value) {
      return false
    }

    const currentUser = userStore.currentUser
    if (!validateUser(currentUser)) {
      return false
    }

    return review.userId === currentUser.id
  } catch (error) {
    console.error('Error checking if user can edit review:', error)
    return false
  }
})

const canUserDeleteReview = computed(() => (review) => {
  try {
    if (!review || typeof review !== 'object') {
      console.error('Invalid review object:', review)
      return false
    }

    if (!isAuthenticated.value) {
      return false
    }

    const currentUser = userStore.currentUser
    if (!validateUser(currentUser)) {
      return false
    }

    return review.userId === currentUser.id || currentUser.isAdmin
  } catch (error) {
    console.error('Error checking if user can delete review:', error)
    return false
  }
})

const getUserDisplayName = (user) => {
  try {
    if (!validateUser(user)) {
      return 'Неизвестный пользователь'
    }

    return user.displayName || user.username
  } catch (error) {
    console.error('Error getting user display name:', error)
    return 'Ошибка'
  }
}

const isCurrentUser = computed(() => (userId) => {
  try {
    if (!userId || typeof userId !== 'string') {
      console.error('Invalid user ID:', userId)
      return false
    }

    if (!isAuthenticated.value) {
      return false
    }

    const currentUser = userStore.currentUser
    if (!validateUser(currentUser)) {
      return false
    }

    return userId === currentUser.id
  } catch (error) {
    console.error('Error checking if current user:', error)
    return false
  }
})

defineOptions({
  inheritAttrs: false
})
</script>

<style scoped>
.v-list-item {
  border-radius: 8px;
}

.v-list-item:hover {
  background-color: rgb(255 255 255 / 5%);
}

.rating-large {
  margin: 12px 0;
}

.rating-large .v-icon {
  margin: 0 4px;
  padding: 0;
}

.v-rating {
  margin: 4px 0;
}

.v-rating .v-icon {
  margin: 0 2px;
  padding: 0;
}

/* Стили для текста отзыва */
.review-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
}

.like-button {
  min-width: auto;
  padding: 0 8px;
}

.likes-count {
  font-size: 0.875rem;
  margin-left: 4px;
}
</style> 