<!-- 
  ContestCard.vue
  Компонент карточки конкурса.
  Отображает основную информацию о конкурсе.
-->
<template>
  <v-card
    class="contest-card"
    :loading="loading"
    @click="$emit('click')"
  >
    <!-- Изображение конкурса -->
    <div class="contest-image">
      <component 
        :is="getPlatformIcon(contest.platform_type)" 
        v-if="getPlatformIcon(contest.platform_type)"
        class="platform-logo"
        :size="64"
        :color="getPlatformColor(contest.platform_type)"
      />
      <v-icon
        v-else
        size="64"
        class="platform-logo"
      >
        mdi-help-circle
      </v-icon>

      <!-- Оверлей с призовым фондом -->
      <div v-if="contest.prize_value" class="prize-overlay">
        <v-chip
          color="success"
          size="small"
          class="prize-chip"
        >
          <v-icon start size="small">mdi-trophy</v-icon>
          {{ formatPrize(contest.prize_value) }}
        </v-chip>
      </div>

      <!-- Оверлей с платформой -->
      <div class="platform-overlay">
        <v-chip
          :color="getPlatformColor(contest.platform_type)"
          size="small"
          class="platform-chip"
          variant="outlined"
        >
          <component 
            :is="getPlatformIcon(contest.platform_type)" 
            v-if="getPlatformIcon(contest.platform_type)"
            class="mr-2"
            :size="24"
          />
          {{ contest.platform_type }}
        </v-chip>
      </div>
    </div>

    <!-- Заголовок -->
    <v-card-title class="pt-3 pb-0">
      <div class="text-truncate title-text">{{ contest.title }}</div>
    </v-card-title>

    <!-- Основная информация -->
    <v-card-text class="pt-2 pb-2">
      <!-- Статус и даты -->
      <div class="d-flex align-center flex-wrap mb-2">
        <v-chip
          :color="getStatusColor(contest.status)"
          size="x-small"
          class="mr-2"
        >
          {{ getStatusText(contest.status) }}
        </v-chip>
        <div class="d-flex align-center">
          <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
          <span class="text-caption">
            {{ formatDate(contest.start_date) }} - {{ formatDate(contest.end_date) }}
          </span>
        </div>
      </div>

      <!-- Участники -->
      <div class="d-flex align-center mb-2">
        <v-icon size="small" class="mr-1">mdi-account-group</v-icon>
        <span class="text-caption">
          {{ getParticipantsText(contest.participants_count || 0) }}
        </span>
      </div>

      <!-- Описание -->
      <div class="text-body-2 description-text">
        {{ contest.description }}
      </div>

      <!-- Теги -->
      <div v-if="contest.tags_list?.length" class="mt-2">
        <v-chip
          v-for="tag in contest.tags_list"
          :key="tag"
          size="x-small"
          class="mr-1 mb-1"
          variant="outlined"
        >
          {{ tag }}
        </v-chip>
      </div>
    </v-card-text>

    <v-divider />

    <!-- Действия -->
    <v-card-actions>
      <v-chip
        :color="getStatusColor(contest.status)"
        size="small"
        class="text-none"
      >
        {{ getStatusText(contest.status) }}
      </v-chip>
      <v-spacer />
      <v-tooltip location="top" text="Добавить в избранное">
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            variant="text"
            v-bind="props"
            :color="contest.is_favorite ? 'warning' : undefined"
            :disabled="loading"
            @click.stop="$emit('toggle-favorite')"
          >
            <v-icon>
              {{ contest.is_favorite ? 'mdi-star' : 'mdi-star-outline' }}
            </v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip location="top" text="Поделиться">
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            variant="text"
            v-bind="props"
            :disabled="loading"
            @click.stop="$emit('share')"
          >
            <v-icon>mdi-share-variant</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { formatDate, formatPrize } from '@/utils/formatters'
import { getStatusText } from '@/utils/constants'
import YouTubeIcon from '@/components/icons/YouTubeIcon.vue'
import InstagramIcon from '@/components/icons/InstagramIcon.vue'
import TelegramIcon from '@/components/icons/TelegramIcon.vue'
import VKIcon from '@/components/icons/VKIcon.vue'

// Props
const props = defineProps({
  contest: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Эмиты
defineEmits(['click', 'toggle-favorite', 'share'])

// Методы
const getPlatformIcon = (platform) => {
  if (!platform) return null
  const icons = {
    youtube: YouTubeIcon,
    instagram: InstagramIcon,
    telegram: TelegramIcon,
    vk: VKIcon
  }
  return icons[platform.toLowerCase()]
}

const getPlatformColor = (platform) => {
  const colors = {
    youtube: 'red',
    instagram: 'purple',
    telegram: 'blue',
    vk: 'blue-darken-2'
  }
  return colors[platform?.toLowerCase()] || 'grey'
}

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    completed: 'info',
    cancelled: 'error'
  }
  return colors[status] || 'grey'
}

const getDateIcon = (status) => {
  switch (status) {
    case 'active': return 'mdi-timer-sand'
    case 'completed': return 'mdi-calendar-check'
    case 'cancelled': return 'mdi-calendar-remove'
    default: return 'mdi-calendar'
  }
}

const getDateText = (startDate, endDate, status) => {
  const start = formatDate(startDate)
  const end = formatDate(endDate)

  switch (status) {
    case 'active':
      return `До ${end}`
    case 'completed':
      return `Завершён ${end}`
    case 'cancelled':
      return `Отменён ${end}`
    default:
      return `${start} - ${end}`
  }
}

const getParticipantsText = (count) => {
  return `${count} ${count === 1 ? 'участник' : count < 5 ? 'участника' : 'участников'}`
}
</script>

<style scoped>
.contest-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--v-theme-surface);
}

.contest-image {
  position: relative;
  background-color: var(--v-theme-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  min-height: 200px;
}

.platform-logo {
  width: 120px !important;
  height: 120px !important;
}

.contest-image :deep(img) {
  object-fit: contain !important;
  width: 100% !important;
  height: 100% !important;
  margin: auto;
}

.prize-overlay {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1;
}

.platform-overlay {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 1;
}

.platform-chip {
  background-color: var(--v-theme-surface) !important;
  border: 1px solid var(--v-border-color);
}

.description-text {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-chip {
  min-width: 110px;
  justify-content: center;
}

.title-text {
  font-size: 1.1rem;
  line-height: 1.4;
  max-height: 2.8em;
  overflow: hidden;
  display: -webkit-box;
  display: box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  box-orient: vertical;
}
</style> 
