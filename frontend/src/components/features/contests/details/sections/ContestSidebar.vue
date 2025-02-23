<!-- 
  ContestSidebar.vue
  Компонент боковой панели с дополнительной информацией о конкурсе:
  - Информация об организаторе
  - Таймер до завершения
  - Требования и ограничения
-->
<template>
  <v-navigation-drawer
    location="right"
    width="320"
    permanent
    elevation="2"
    class="contest-sidebar"
  >
    <!-- Организатор -->
    <v-card class="mb-4 mx-4 mt-4" elevation="0">
      <v-card-title class="d-flex align-center px-4">
        <v-icon start>mdi-account-tie</v-icon>
        Организатор
      </v-card-title>

      <v-card-text class="px-4">
        <div class="d-flex align-center">
          <UserAvatar
            :src="organizer.avatar"
            :name="organizer.name"
            size="48"
            class="mr-3"
          />

          <div>
            <div class="text-subtitle-1 font-weight-medium">
              {{ organizer.name }}
            </div>
            <div class="d-flex align-center text-caption text-grey">
              <v-icon
                size="small"
                :color="getRatingColor(organizer.rating)"
                class="mr-1"
              >
                mdi-star
              </v-icon>
              {{ organizer.rating }} рейтинг
            </div>
          </div>

          <v-spacer></v-spacer>

          <v-btn
            v-if="organizer.profileUrl"
            variant="text"
            :href="organizer.profileUrl"
            target="_blank"
            size="small"
          >
            Профиль
            <v-icon end>mdi-open-in-new</v-icon>
          </v-btn>
        </div>

        <div 
          v-if="organizer.description"
          class="mt-3 text-body-2"
        >
          {{ organizer.description }}
        </div>

        <v-list v-if="organizer.stats" density="compact" class="mt-2 pa-0">
          <v-list-item
            v-for="(value, key) in organizer.stats"
            :key="key"
            :prepend-icon="getStatIcon(key)"
          >
            <v-list-item-title>{{ getStatLabel(key) }}</v-list-item-title>
            <template v-slot:append>
              <span class="text-primary">{{ value }}</span>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- Таймер -->
    <v-card class="mb-4 mx-4" elevation="0">
      <v-card-title class="d-flex align-center px-4">
        <v-icon start>mdi-clock-outline</v-icon>
        {{ timerTitle }}
      </v-card-title>

      <v-card-text class="px-4">
        <div class="timer-container">
          <div class="timer-block">
            <div class="timer-value">{{ timeLeft.days }}</div>
            <div class="timer-label">дней</div>
          </div>
          <div class="timer-divider">:</div>
          <div class="timer-block">
            <div class="timer-value">{{ timeLeft.hours }}</div>
            <div class="timer-label">часов</div>
          </div>
          <div class="timer-divider">:</div>
          <div class="timer-block">
            <div class="timer-value">{{ timeLeft.minutes }}</div>
            <div class="timer-label">минут</div>
          </div>
        </div>

        <div class="text-caption text-center mt-2">
          {{ formatDate(deadline) }}
        </div>
      </v-card-text>
    </v-card>

    <!-- Требования -->
    <v-card class="mx-4" elevation="0">
      <v-card-title class="d-flex align-center px-4">
        <v-icon start>mdi-clipboard-list</v-icon>
        Требования
      </v-card-title>

      <v-card-text class="px-4">
        <v-list density="compact" class="pa-0">
          <v-list-item
            v-for="(req, index) in requirements"
            :key="index"
            :class="{ 'text-error': req.required && !req.fulfilled }"
            class="requirement-item px-0"
          >
            <template v-slot:prepend>
              <v-icon
                :color="getRequirementColor(req)"
                :icon="getRequirementIcon(req)"
                class="mt-1"
              ></v-icon>
            </template>

            <v-list-item-title class="requirement-text">
              <div class="d-flex flex-wrap align-start">
                <span class="requirement-content">{{ req.text }}</span>
                <v-chip
                  v-if="req.required"
                  color="error"
                  size="x-small"
                  class="ml-2 mt-1"
                >
                  Обязательно
                </v-chip>
              </div>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { formatDate } from '@/utils/formatters'
import { RequirementStatus } from '@/constants/contest'
import UserAvatar from '@/components/common/UserAvatar.vue'

// Props с типизацией
const props = defineProps({
  /** Информация об организаторе */
  organizer: {
    type: Object,
    required: true,
    validator: (value) => {
      return (
        typeof value === 'object' &&
        value !== null &&
        (value.id === null || typeof value.id === 'string') &&
        typeof value.name === 'string' &&
        (!value.email || typeof value.email === 'string') &&
        (!value.avatar || typeof value.avatar === 'string') &&
        (!value.rating || typeof value.rating === 'number')
      )
    }
  },
  /** Дедлайн конкурса */
  deadline: {
    type: String,
    required: true,
    validator: (value) => {
      if (!value) return false
      const date = new Date(value)
      return !isNaN(date.getTime())
    }
  },
  /** Требования конкурса */
  requirements: {
    type: Array,
    default: () => [],
    validator: (value) => {
      if (!Array.isArray(value)) return false
      return value.every(req => 
        typeof req === 'object' &&
        req !== null &&
        typeof req.text === 'string'
      )
    }
  }
})

// Состояние
const timerInterval = ref(null)
const timeLeft = ref({ days: 0, hours: 0, minutes: 0 })

// Вычисляемые свойства
const timerTitle = computed(() => {
  const now = new Date()
  const deadline = new Date(props.deadline)
  return now > deadline ? 'Завершен' : 'До завершения'
})

// Методы
const updateTimer = () => {
  const now = new Date()
  const deadline = new Date(props.deadline)
  const diff = deadline - now

  if (diff <= 0) {
    timeLeft.value = { days: 0, hours: 0, minutes: 0 }
    clearInterval(timerInterval.value)
    return
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  timeLeft.value = { days, hours, minutes }
}

const getRatingColor = (rating) => {
  if (rating >= 4.5) return 'success'
  if (rating >= 4.0) return 'warning'
  if (rating >= 3.0) return 'orange'
  return 'error'
}

const getStatIcon = (key) => {
  const icons = {
    contests: 'mdi-trophy',
    participants: 'mdi-account-group',
    rating: 'mdi-star',
    reviews: 'mdi-comment'
  }
  return icons[key] || 'mdi-information'
}

const getStatLabel = (key) => {
  const labels = {
    contests: 'Конкурсов',
    participants: 'Участников',
    rating: 'Рейтинг',
    reviews: 'Отзывов'
  }
  return labels[key] || key
}

const getRequirementIcon = (req) => {
  if (req.status === RequirementStatus.FULFILLED) return 'mdi-check-circle'
  if (req.status === RequirementStatus.PENDING) return 'mdi-clock-outline'
  return 'mdi-alert-circle'
}

const getRequirementColor = (req) => {
  if (req.status === RequirementStatus.FULFILLED) return 'success'
  if (req.status === RequirementStatus.PENDING) return 'warning'
  return 'error'
}

// Жизненный цикл
onMounted(() => {
  updateTimer()
  timerInterval.value = setInterval(updateTimer, 60000) // Обновляем каждую минуту
})

onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})
</script>

<style scoped>
.contest-sidebar {
  border-left: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.timer-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.timer-block {
  text-align: center;
  min-width: 60px;
}

.timer-value {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
  color: rgb(var(--v-theme-primary));
}

.timer-label {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
}

.timer-divider {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  margin-top: -0.5rem;
}

.requirement-item {
  margin-bottom: 0.5rem;
}

.requirement-text {
  line-height: 1.4;
}

.requirement-content {
  flex: 1;
  min-width: 0;
}
</style> 