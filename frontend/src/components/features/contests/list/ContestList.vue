<!-- 
  ContestList.vue
  Компонент для отображения списка конкурсов в виде сетки или списка
-->
<template>
  <div class="contest-list-page">
    <div class="contest-list">
      <!-- Переключатель вида -->
      <div class="d-flex justify-end mb-4">
        <div class="view-mode-toggle d-flex gap-2">
          <UiButton
            variant="ghost"
            size="small"
            :class="{ 'view-mode-toggle__button--active': viewMode === 'grid' }"
            @click="viewMode = 'grid'"
            :disabled="loading"
          >
            <template #icon>
              <v-icon>mdi-grid</v-icon>
            </template>
          </UiButton>
          <UiButton
            variant="ghost"
            size="small"
            :class="{ 'view-mode-toggle__button--active': viewMode === 'list' }"
            @click="viewMode = 'list'"
            :disabled="loading"
          >
            <template #icon>
              <v-icon>mdi-format-list-bulleted</v-icon>
            </template>
          </UiButton>
        </div>
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
                  <UiButton
                    variant="ghost"
                    size="small"
                    :class="{ 'text-warning': contest.is_favorite }"
                    @click.stop="$emit('toggle-favorite', contest)"
                  >
                    <template #icon>
                      <v-icon>mdi-star</v-icon>
                    </template>
                  </UiButton>
                  <UiButton
                    variant="ghost"
                    size="small"
                    @click="$emit('select', contest)"
                  >
                    <template #icon>
                      <v-icon>mdi-chevron-right</v-icon>
                    </template>
                  </UiButton>
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
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { formatDate } from '@/utils/formatters'
import ContestCard from './ContestCard.vue'
import UiButton from '@/components/ui/buttons/UiButton.vue'

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
const VIEW_MODE_KEY = 'contestListViewMode'
const viewMode = ref('grid')

// Инициализация режима отображения
onMounted(() => {
  const savedViewMode = localStorage.getItem(VIEW_MODE_KEY)
  if (savedViewMode && ['grid', 'list'].includes(savedViewMode)) {
    viewMode.value = savedViewMode
  }
})

// Сохранение режима отображения при изменении
watch(viewMode, (newMode) => {
  localStorage.setItem(VIEW_MODE_KEY, newMode)
})

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
.contest-list-page {
  min-height: calc(100vh - var(--navbar-height));
  padding: 1rem;
  background-color: var(--background-main);
}

.v-theme--light .contest-list-page {
  background-color: var(--background-main);
}

.v-theme--dark .contest-list-page {
  background-color: var(--background-main);
}

.contest-list {
  min-height: 200px;
}

.contest-item {
  transition: transform 0.2s;
}

.contest-item:hover {
  transform: translateY(-4px);
}

.view-mode-toggle {
  display: flex;
  padding: 4px;
  background-color: transparent !important;
  border-radius: 8px;
  gap: 0.5rem;

  .v-theme--light & {
    background-color: var(--background-form) !important;
  }

  .v-theme--dark & {
    background-color: var(--background-form) !important;
  }
}

.view-mode-toggle :deep(.ui-button) {
  background: transparent !important;
  border: none !important;

  .v-theme--light & {
    &:hover {
      background-color: rgba(var(--v-theme-on-surface), 0.04) !important;
    }
  }

  .v-theme--dark & {
    &:hover {
      background-color: rgba(var(--v-theme-on-surface), 0.1) !important;
    }
  }

  &:focus {
    outline: none !important;
    box-shadow: none !important;
  }
}

.view-mode-toggle__button--active {
  border: none !important;
  color: var(--primary-base) !important;
  background-color: var(--background-form) !important;

  :deep(.v-icon) {
    color: var(--primary-base) !important;
  }

  .v-theme--light & {
    background-color: #FFF !important;
    color: rgb(var(--v-theme-primary)) !important;

    :deep(.v-icon) {
      color: rgb(var(--v-theme-primary)) !important;
    }
  }

  .v-theme--dark & {
    background-color: rgb(42 42 54) !important;
    color: #9061FF !important;

    :deep(.v-icon) {
      color: #9061FF !important;
    }
  }

  &:hover {
    opacity: 0.9;
  }
}

.view-mode-toggle :deep(.ui-button:not(.view-mode-toggle__button--active)) {
  .v-icon {
    color: var(--text-secondary) !important;
  }
}
</style> 