<!-- 
  ContestList.vue
  Компонент для отображения списка конкурсов в виде сетки или списка
-->
<template>
  <div class="contest-list">
    <!-- Переключатель вида -->
    <div class="d-flex justify-end mb-4">
      <v-btn-toggle
        v-model="viewMode"
        density="comfortable"
        color="primary"
      >
        <v-btn value="grid" :disabled="loading">
          <v-icon>mdi-grid</v-icon>
        </v-btn>
        <v-btn value="list" :disabled="loading">
          <v-icon>mdi-format-list-bulleted</v-icon>
        </v-btn>
      </v-btn-toggle>
    </div>

    <!-- Список конкурсов -->
    <div v-if="contests?.length">
      <!-- Сетка конкурсов -->
      <v-row v-if="viewMode === 'grid'">
        <v-col
          v-for="contest in contests"
          :key="contest.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
          class="contest-item"
        >
          <contest-card
            :contest="contest"
            :loading="loading"
            @click="$emit('select', contest)"
            @toggle-favorite="$emit('toggle-favorite', contest)"
            @share="$emit('share', contest)"
          />
        </v-col>
      </v-row>

      <!-- Список конкурсов -->
      <div v-else class="list-view">
        <v-list>
          <v-list-item
            v-for="contest in contests"
            :key="contest.id"
            :active="false"
            class="mb-2"
          >
            <template v-slot:prepend>
              <v-avatar size="48" rounded="lg" class="mr-3">
                <v-img
                  :src="contest.image || getDefaultImage(contest.platform_type)"
                  :alt="contest.title"
                  cover
                />
              </v-avatar>
            </template>

            <v-list-item-title class="text-subtitle-1 mb-1">
              {{ contest.title }}
            </v-list-item-title>

            <v-list-item-subtitle>
              <div class="d-flex align-center">
                <v-chip
                  size="x-small"
                  :color="getPlatformColor(contest.platform_type)"
                  class="mr-2"
                >
                  {{ contest.platform_type }}
                </v-chip>
                <v-chip
                  size="x-small"
                  :color="getStatusColor(contest.status)"
                  class="mr-2"
                >
                  {{ contest.status }}
                </v-chip>
                <v-icon size="x-small" class="mr-1">mdi-calendar</v-icon>
                <span class="text-caption mr-2">
                  {{ formatDate(contest.start_date) }}
                </span>
                <v-icon size="x-small" class="mr-1">mdi-account-group</v-icon>
                <span class="text-caption">
                  {{ contest.participants_count || 0 }}
                </span>
              </div>
            </v-list-item-subtitle>

            <template v-slot:append>
              <div class="d-flex align-center">
                <v-btn
                  icon="mdi-star"
                  variant="text"
                  size="small"
                  :color="contest.is_favorite ? 'warning' : undefined"
                  @click.stop="$emit('toggle-favorite', contest)"
                />
                <v-btn
                  icon="mdi-chevron-right"
                  variant="text"
                  size="small"
                  @click="$emit('select', contest)"
                />
              </div>
            </template>
          </v-list-item>
        </v-list>
      </div>
    </div>

    <!-- Сообщение об отсутствии результатов -->
    <v-alert
      v-else-if="!loading"
      type="info"
      variant="tonal"
      class="mt-4"
    >
      Конкурсов пока нет
    </v-alert>

    <!-- Индикатор загрузки -->
    <div v-if="loading" class="d-flex justify-center my-4">
      <v-progress-circular
        indeterminate
        color="primary"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { formatDate } from '@/utils/formatters'
import ContestCard from './ContestCard.vue'

// Props
const props = defineProps({
  contests: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Эмиты
const emit = defineEmits(['select', 'toggle-favorite', 'share'])

// Состояние
const viewMode = ref('grid')

// Вспомогательные функции
const getDefaultImage = (platform) => {
  const images = {
    youtube: '/images/platforms/youtube.png',
    instagram: '/images/platforms/instagram.png',
    telegram: '/images/platforms/telegram.png',
    vk: '/images/platforms/vk.png'
  }
  return images[platform] || '/images/platforms/default.png'
}

const getPlatformColor = (platform) => {
  const colors = {
    youtube: 'error',
    instagram: 'purple',
    telegram: 'info',
    vk: 'primary-darken-2'
  }
  return colors[platform] || 'grey'
}

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    draft: 'grey',
    completed: 'primary',
    cancelled: 'error'
  }
  return colors[status] || 'grey'
}
</script>

<style scoped>
.contest-list {
  min-height: 200px;
}

.contest-item {
  transition: transform 0.2s;
}

.contest-item:hover {
  transform: translateY(-4px);
}
</style> 