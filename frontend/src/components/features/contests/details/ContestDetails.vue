<!-- 
  ContestDetails.vue
  Основной компонент для отображения детальной информации о конкурсе.
  Объединяет все подкомпоненты и управляет их взаимодействием.
-->
<template>
  <v-container v-if="contest" class="contest-details">
    <!-- Основная информация -->
    <v-row>
      <v-col cols="12" md="8">
        <!-- Шапка конкурса -->
        <contest-header
          :image="contest.image"
          :platform="platform"
          :title="contest.title"
          :status="contestStatus"
          class="mb-4"
        />

        <!-- Основная информация -->
        <contest-info
          :title="contest.title"
          :description="contest.description"
          :start-date="contest.start_date"
          :end-date="contest.end_date"
          :views-count="contest.views_count"
          :favorites-count="contest.favorites_count"
          :rating="contest.rating"
          :participants-count="contest.participants_count"
          :status="contest.status"
          :prize-value="formatPrizeValue(contest.prize_value)"
        />

        <!-- Правила, призы, отзывы и комментарии -->
        <v-expansion-panels class="mb-4">
          <contest-rules 
            :rules="contest.rules"
            :requirements="contest.requirements"
          >
            <template #title>
              <div class="d-flex align-center">
                <v-icon icon="mdi-gavel" color="amber" size="24" class="mr-2" />
                <span class="text-h6 font-weight-bold">Правила участия</span>
              </div>
            </template>
          </contest-rules>
          <contest-prizes 
            :prizes="contest.prizes"
          >
            <template #title>
              <div class="d-flex align-center">
                <v-icon icon="mdi-trophy" color="amber" size="24" class="mr-2" />
                <span class="text-h6 font-weight-bold">Призы</span>
              </div>
            </template>
          </contest-prizes>
          <v-expansion-panel v-if="contest.allow_reviews">
            <v-expansion-panel-title>
              <div class="d-flex align-center">
                <v-icon icon="mdi-star" color="amber" size="24" class="mr-2" />
                <span class="text-h6 font-weight-bold">Отзывы</span>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <contest-reviews
                v-if="contest.id"
                :entity-id="contest.id"
                entity-type="contest"
                v-model:rating="rating"
                v-model:reviews-count="contest.reviewsCount"
                :can-rate="canRate"
                @rate="handleRate"
                @update:rating="(newRating) => {
                  console.log('Contest rating updated:', newRating)
                  if (contest.value) {
                    contest.value.rating = newRating
                    // Обновляем статистику конкурса для получения актуальных данных
                    contestService.getStats(contest.value.id).then(stats => {
                      if (stats) {
                        contest.value.rating = stats.rating
                        console.debug('Updated contest stats after rating:', stats)
                      }
                    })
                  }
                }"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel v-if="contest.allow_comments">
            <v-expansion-panel-title>
              <div class="d-flex align-center">
                <v-icon icon="mdi-comment-multiple" color="amber" size="20" class="mr-2" />
                <span class="text-h6 font-weight-bold">Комментарии</span>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <contest-comments 
                :contest-id="contest.id"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Действия -->
        <contest-actions
          :url="contest.url"
          :is-favorite="Boolean(contest.is_favorite)"
          :status="contest.status"
          :can-participate="canParticipate"
          :has-user-participated="contest.has_user_participated || false"
          :conditions="contest.requirements || []"
          @participate="handleParticipate"
          @toggle-favorite="handleToggleFavorite"
          @share="handleShare"
        />
      </v-col>

      <!-- Боковая информация -->
      <v-col cols="12" md="4">
        <contest-sidebar
          :organizer="organizer"
          :deadline="deadline"
          :requirements="contest.requirements"
          :is-favorite="Boolean(contest.is_favorite)"
          :has-user-participated="contest.has_user_participated"
          @toggle-favorite="handleToggleFavorite"
          class="sticky-sidebar"
        />
      </v-col>
    </v-row>

    <!-- Диалог шаринга -->
    <contest-share
      v-model="showShareDialog"
      :contest-id="contest.id"
      :title="contest.title"
      :description="contest.description"
      :image="contest.image"
      @share="handleShareComplete"
    />

    <!-- Загрузка -->
    <v-overlay
      :model-value="isLoading"
      class="align-center justify-center"
    >
      <v-progress-circular
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>

    <!-- Уведомления -->
    <v-snackbar
      v-model="show"
      :color="color"
      :timeout="timeout"
    >
      {{ message }}
      
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="close"
        >
          Закрыть
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useContestsStore } from '@/stores/contests'
import { ContestStatus, PlatformType } from '@/constants/contest'
import { useNotification } from '@/composables/useNotification'
import ContestHeader from './sections/ContestHeader.vue'
import ContestInfo from './sections/ContestInfo.vue'
import ContestRules from './sections/ContestRules.vue'
import ContestPrizes from './sections/ContestPrizes.vue'
import ContestActions from './sections/ContestActions.vue'
import ContestSidebar from './sections/ContestSidebar.vue'
import ContestComments from './social/comments/ContestComments.vue'
import ContestReviews from './social/reviews/ContestReviews.vue'
import ContestShare from './social/share/ContestShare.vue'
import { contestService } from '@/services'
import { formatPrizeValue } from '@/utils/formatters'

// Состояние
const route = useRoute()
const contestStore = useContestsStore()
contestStore.init() // Инициализируем хранилище
const authStore = useAuthStore()
const { 
  show, 
  message, 
  color, 
  timeout, 
  showSuccess, 
  showError,
  close 
} = useNotification()

const showShareDialog = ref(false)
const contest = ref(null)
const isLoading = ref(true)
const error = ref(null)

// Вычисляемые свойства
const platform = computed(() => contest.value?.platform?.toLowerCase() || PlatformType.YOUTUBE)
const organizer = computed(() => contest.value?.organizer || { id: null, name: '', avatar: null })
const deadline = computed(() => {
  if (!contest.value?.end_date) return null
  const date = new Date(contest.value.end_date)
  return isNaN(date.getTime()) ? null : date.toISOString()
})
const rating = computed({
  get: () => Number(contest.value?.rating) || 0,
  set: (value) => {
    if (contest.value) {
      contest.value.rating = Number(value) || 0
    }
  }
})

const canRate = computed(() => {
  if (!authStore.isAuthenticated) return false
  if (!contest.value?.allowRating) return false
  return !contest.value?.hasUserParticipated
})

const contestStatus = computed(() => {
  if (!contest.value?.status) return ContestStatus.ACTIVE
  const status = contest.value.status.toLowerCase()
  switch (status) {
    case ContestStatus.ACTIVE: return ContestStatus.ACTIVE
    case ContestStatus.COMPLETED: return ContestStatus.COMPLETED
    case ContestStatus.CANCELLED: return ContestStatus.CANCELLED
    default: return ContestStatus.ACTIVE
  }
})

const canParticipate = computed(() => {
  // Проверяем авторизацию
  if (!authStore.isAuthenticated) return false
  
  // Проверяем наличие конкурса
  if (!contest.value) return false
  
  // Проверяем статус участия
  if (contest.value.has_user_participated) return false
  
  // Проверяем статус конкурса
  const status = contest.value.status?.toLowerCase()
  if (status !== 'active') return false
  
  // Если все проверки пройдены, пользователь может участвовать
  return true
})

// Методы
const fetchContest = async () => {
  try {
    isLoading.value = true
    const contestId = route.params.id
    if (!contestId) {
      showError('ID конкурса не найден')
      return
    }

    // Получаем данные конкурса и избранные конкурсы параллельно
    const [response, favoriteContests] = await Promise.all([
      contestStore.fetchContest(contestId),
      contestService.getFavoriteContests()
    ])
    
    if (!response) {
      showError('Не удалось загрузить данные конкурса')
      return
    }

    // Получаем статистику конкурса
    const stats = await contestService.getStats(contestId)

    // Проверяем, находится ли конкурс в избранном
    const isFavorite = favoriteContests?.data?.some(fc => fc.id === contestId) || false

    // Форматируем данные конкурса
    contest.value = {
      ...response,
      // Убеждаемся что все необходимые поля присутствуют
      id: contestId,
      title: response.title || '',
      description: response.description || '',
      platform_type: (response.platform_type || 'youtube').toLowerCase(),
      platform: (response.platform || response.platform_type || 'youtube').toLowerCase(),
      status: response.status || 'active',
      start_date: response.start_date ? new Date(response.start_date) : new Date(),
      end_date: response.end_date ? new Date(response.end_date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      views_count: stats?.views_count || response.views_count || 0,
      favorites_count: stats?.favorites_count || response.favorites_count || 0,
      participants_count: stats?.participants_count || response.participants_count || 0,
      rating: parseFloat(stats?.rating || response.rating) || 0,
      reviewsCount: parseInt(response.reviews_count) || 0,
      prize_value: parseInt(response.prize_value || response.prizeValue) || 0,
      rules: Array.isArray(response.rules) ? response.rules : [],
      prizes: Array.isArray(response.prizes) ? response.prizes : [],
      requirements: Array.isArray(response.requirements) ? response.requirements : [],
      is_favorite: isFavorite,
      has_user_participated: Boolean(response.has_user_participated),
      allow_reviews: response.allow_reviews !== false,
      allow_comments: response.allow_comments !== false,
      image: response.image || null,
      organizer: response.organizer || response.author || {
        id: null,
        name: 'Неизвестный организатор',
        email: '',
        avatar: null,
        rating: 0
      }
    }

    console.debug('Contest data loaded:', {
      id: contest.value.id,
      is_favorite: contest.value.is_favorite,
      favoriteContests: favoriteContests?.data
    })
  } catch (error) {
    console.error('Error fetching contest:', error)
    showError(error.message || 'Не удалось загрузить данные конкурса')
  } finally {
    isLoading.value = false
  }
}

const handleToggleFavorite = async () => {
  if (!authStore.isAuthenticated) {
    showError('Необходимо авторизоваться')
    return
  }

  try {
    const contestId = route.params.id
    if (!contestId) {
      showError('ID конкурса не найден')
      return
    }

    const response = await contestService.toggleFavorite(contestId)
    
    // Обновляем состояние избранного
    if (contest.value) {
      // Получаем новое состояние из ответа сервера
      const newIsFavorite = response?.data?.isFavorite || false
      contest.value.is_favorite = newIsFavorite
      
      // Обновляем статистику конкурса
      const stats = await contestService.getStats(contestId)
      if (stats) {
        contest.value.favorites_count = stats.favorites_count
        console.debug('Updated contest stats:', stats)
      }
      
      // Показываем сообщение в зависимости от нового состояния
      if (newIsFavorite) {
        showSuccess('Добавлено в избранное')
      } else {
        showSuccess('Удалено из избранного', 'warning')
      }
    }
    
    console.debug('Toggle favorite result:', {
      contestId,
      isFavorite: contest.value?.is_favorite,
      response: response?.data
    })
  } catch (error) {
    console.error('Error toggling favorite:', error)
    showError('Не удалось обновить избранное')
  }
}

const handleShare = () => {
  showShareDialog.value = true
}

const handleShareComplete = () => {
  showShareDialog.value = false
  showSuccess('Ссылка скопирована')
}

const handleRate = async (rating) => {
  if (!authStore.isAuthenticated) {
    showError('Необходимо авторизоваться')
    return
  }

  try {
    await contestStore.rateContest(contest.value.id, rating)
    await fetchContest() // Обновляем данные конкурса
    showSuccess('Оценка сохранена')
  } catch (error) {
    showError('Не удалось сохранить оценку')
    console.error('Error rating contest:', error)
  }
}

const handleParticipate = async () => {
  if (!authStore.isAuthenticated) {
    showError('Необходимо авторизоваться для участия в конкурсе')
    return
  }

  const contestId = route.params.id
  if (!contestId) {
    showError('ID конкурса не найден')
    return
  }

  try {
    isLoading.value = true
    const response = await contestStore.participateInContest(contestId)
    
    // Если получили ошибку от сервера
    if (response?.error) {
      if (response.error.includes('уже участвуете')) {
        // Обновляем статус участия локально
        if (contest.value) {
          contest.value.has_user_participated = true
        }
        showError('Вы уже являетесь участником этого конкурса')
      } else {
        showError(response.error)
      }
      return
    }

    // Если участие успешно
    if (contest.value) {
      contest.value.has_user_participated = true
      contest.value.participants_count = (contest.value.participants_count || 0) + 1
    }
    
    showSuccess('Вы успешно присоединились к конкурсу')
  } catch (error) {
    console.error('Error participating in contest:', error)
    
    // Обрабатываем ошибку 500
    if (error?.response?.status === 500) {
      const errorMessage = error?.response?.data?.message || error.message
      if (errorMessage?.includes('уже участвуете')) {
        if (contest.value) {
          contest.value.has_user_participated = true
        }
        showError('Вы уже являетесь участником этого конкурса')
      } else {
        showError(errorMessage || 'Произошла ошибка при попытке участия в конкурсе')
      }
    } else {
      showError(error.message || 'Не удалось присоединиться к конкурсу')
    }
  } finally {
    isLoading.value = false
  }
}

// Жизненный цикл
onMounted(() => {
  fetchContest()
})

// Добавляем watch для отслеживания изменений contest.rating
watch(
  () => contest.value?.rating,
  (newRating) => {
    console.log('ContestDetails: contest rating changed to:', newRating)
  },
  { immediate: true }
)
</script>

<style scoped>
.contest-details {
  max-width: 1400px;
}

.sticky-sidebar {
  position: sticky;
  top: 24px;
}

@media (max-width: 960px) {
  .sticky-sidebar {
    position: static;
  }
}
</style> 