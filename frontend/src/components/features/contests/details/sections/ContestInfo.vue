<!-- 
  ContestInfo.vue
  Компонент для отображения основной информации о конкурсе:
  - Даты проведения
  - Количество участников
  - Призовой фонд
  - Статистика
  - Описание
-->
<template>
  <v-card class="contest-info">
    <!-- Основные показатели -->
    <v-card-text>
      <v-row class="info-grid">
        <!-- Дата начала -->
        <v-col cols="12" sm="6" md="3">
          <div class="info-item">
            <v-icon color="primary" class="mr-2">mdi-calendar-start</v-icon>
            <div class="info-content">
              <div class="text-caption text-grey">Начало</div>
              <div class="text-body-1">{{ formatDate(startDate) }}</div>
            </div>
          </div>
        </v-col>

        <!-- Дата окончания -->
        <v-col cols="12" sm="6" md="3">
          <div class="info-item">
            <v-icon color="primary" class="mr-2">mdi-calendar-end</v-icon>
            <div class="info-content">
              <div class="text-caption text-grey">Окончание</div>
              <div class="text-body-1">{{ formatDate(endDate) }}</div>
            </div>
          </div>
        </v-col>

        <!-- Количество участников -->
        <v-col cols="12" sm="6" md="3">
          <div class="info-item">
            <v-icon color="primary" class="mr-2">mdi-account-group</v-icon>
            <div class="info-content">
              <div class="text-caption text-grey">Участников</div>
              <div class="text-body-1">
                {{ formatNumber(participantsCount) }}
                <span 
                  v-if="maxParticipants" 
                  class="text-caption text-grey"
                >
                  из {{ formatNumber(maxParticipants) }}
                </span>
              </div>
            </div>
          </div>
        </v-col>

        <!-- Призовой фонд -->
        <v-col cols="12" sm="6" md="3">
          <div class="info-item">
            <v-icon color="primary" class="mr-2">mdi-trophy</v-icon>
            <div class="info-content">
              <div class="text-caption text-grey">Призовой фонд</div>
              <div class="text-body-1">{{ prizeValue }}</div>
            </div>
          </div>
        </v-col>

        <!-- Просмотры -->
        <v-col cols="12" sm="6" md="3">
          <div class="info-item">
            <v-icon color="primary" class="mr-2">mdi-eye</v-icon>
            <div class="info-content">
              <div class="text-caption text-grey">Просмотров</div>
              <div class="text-body-1">{{ formatNumber(viewsCount) }}</div>
            </div>
          </div>
        </v-col>

        <!-- В избранном -->
        <v-col cols="12" sm="6" md="3">
          <div class="info-item">
            <v-icon color="primary" class="mr-2">mdi-star</v-icon>
            <div class="info-content">
              <div class="text-caption text-grey">В избранном</div>
              <div class="text-body-1">{{ formatNumber(favoritesCount) }}</div>
            </div>
          </div>
        </v-col>

        <!-- Рейтинг -->
        <v-col cols="12" sm="6" md="3">
          <div class="info-item">
            <v-icon color="primary" class="mr-2">mdi-star-circle</v-icon>
            <div class="info-content">
              <div class="text-caption text-grey">Рейтинг</div>
              <div class="text-body-1">
                {{ rating ? rating.toFixed(1) : '—' }}
                <v-rating
                  v-if="rating"
                  :model-value="rating"
                  readonly
                  density="compact"
                  size="x-small"
                  half-increments
                  color="warning"
                  class="d-inline-block ml-2"
                ></v-rating>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Прогресс конкурса -->
      <v-fade-transition>
        <div v-if="showProgress" class="mt-4">
          <v-progress-linear
            :model-value="progressPercentage"
            :color="progressColor"
            height="8"
            rounded
          >
            <template v-slot:default="{ value }">
              <span class="progress-text">{{ value.toFixed(0) }}%</span>
            </template>
          </v-progress-linear>
          <div class="text-caption text-grey mt-1">{{ progressText }}</div>
        </div>
      </v-fade-transition>

      <!-- Описание -->
      <div class="mt-4">
        <div 
          class="text-body-1" 
          :class="{ 'truncated': isTruncated && canTruncate }"
        >
          {{ description }}
        </div>
        <v-btn
          v-if="canTruncate"
          variant="text"
          size="small"
          class="mt-2 px-0"
          @click="toggleTruncate"
        >
          {{ isTruncated ? 'Читать полностью' : 'Свернуть' }}
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { formatDate, formatNumber } from '@/utils/formatters'

// Props с типизацией
const props = defineProps({
  /** Дата начала конкурса */
  startDate: {
    type: [Date, String],
    required: true
  },
  /** Дата окончания конкурса */
  endDate: {
    type: [Date, String],
    required: true
  },
  /** Текущее количество участников */
  participantsCount: {
    type: Number,
    default: 0
  },
  /** Максимальное количество участников */
  maxParticipants: {
    type: Number,
    default: null
  },
  /** Призовой фонд (отформатированная строка) */
  prizeValue: {
    type: String,
    required: true
  },
  /** Описание конкурса */
  description: {
    type: String,
    required: true
  },
  /** Количество просмотров */
  viewsCount: {
    type: Number,
    default: 0
  },
  /** Количество добавлений в избранное */
  favoritesCount: {
    type: Number,
    default: 0
  },
  /** Рейтинг конкурса */
  rating: {
    type: Number,
    default: null
  }
})

// Состояние
const isTruncated = ref(true)

// Вычисляемые свойства
const showProgress = computed(() => {
  return new Date() >= new Date(props.startDate) && 
         new Date() <= new Date(props.endDate)
})

const progressPercentage = computed(() => {
  if (!showProgress.value) return 0
  
  const start = new Date(props.startDate).getTime()
  const end = new Date(props.endDate).getTime()
  const now = Date.now()
  
  return Math.round(((now - start) / (end - start)) * 100)
})

const progressColor = computed(() => {
  const percentage = progressPercentage.value
  if (percentage < 25) return 'success'
  if (percentage < 75) return 'warning'
  return 'error'
})

const progressText = computed(() => {
  const percentage = progressPercentage.value
  if (percentage < 25) return 'Конкурс недавно начался'
  if (percentage < 75) return 'Конкурс в процессе'
  return 'Конкурс скоро завершится'
})

const canTruncate = computed(() => {
  return props.description.length > 300
})

// Методы
const toggleTruncate = () => {
  isTruncated.value = !isTruncated.value
}

// Добавляем watch для отслеживания изменений рейтинга
watch(
  () => props.rating,
  (newRating) => {
    console.log('ContestInfo: rating changed to:', newRating)
  },
  { immediate: true }
)
</script>

<style scoped>
.contest-info {
  border-radius: 8px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  padding: 8px;
  height: 100%;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.info-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.info-content {
  flex: 1;
}

.progress-text {
  color: white;
  font-size: 12px;
}

.truncated {
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  display: box;
  box-orient: vertical;
  line-clamp: 3;
  overflow: hidden;
  line-height: 1.4;
  max-height: 4.2em; /* line-height * number of lines */
}
</style> 