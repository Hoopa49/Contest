<!-- 
  FavoritesList.vue
  Компонент для отображения списка избранных конкурсов.
  Включает функции сортировки, фильтрации и удаления из избранного.
-->
<template>
  <div class="favorites-list">
    <!-- Панель управления -->
    <div class="d-flex align-center flex-wrap gap-4 mb-4">
      <!-- Поиск -->
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Поиск по названию"
        density="comfortable"
        hide-details
        class="favorites-search"
        clearable
      />

      <!-- Фильтр по статусу -->
      <v-select
        v-model="statusFilter"
        :items="statusOptions"
        label="Статус"
        density="comfortable"
        hide-details
        class="favorites-filter"
        clearable
      />

      <!-- Сортировка -->
      <v-select
        v-model="sortBy"
        :items="sortOptions"
        label="Сортировка"
        density="comfortable"
        hide-details
        class="favorites-sort"
      />
    </div>

    <!-- Загрузка -->
    <v-skeleton-loader
      v-if="loading"
      type="card-avatar, card-avatar, card-avatar"
      class="mt-4"
    />

    <!-- Список конкурсов -->
    <template v-else>
      <div 
        v-if="filteredContests.length"
        class="favorites-grid"
      >
        <v-card
          v-for="contest in filteredContests"
          :key="contest.id"
          class="favorite-card"
        >
          <!-- Изображение -->
          <v-img
            :src="contest.image"
            :aspect-ratio="16/9"
            cover
            class="favorite-image"
          >
            <!-- Оверлей с призом -->
            <div class="prize-overlay">
              <v-chip
                color="primary"
                size="small"
              >
                {{ contest.prize }}
              </v-chip>
            </div>

            <!-- Статус -->
            <div class="status-overlay">
              <v-chip
                :color="getStatusColor(contest.status)"
                size="small"
              >
                {{ getStatusText(contest.status) }}
              </v-chip>
            </div>
          </v-img>

          <v-card-text>
            <!-- Заголовок -->
            <div class="d-flex align-center justify-space-between mb-2">
              <h3 class="text-h6 text-truncate">
                {{ contest.title }}
              </h3>
              <v-btn
                icon="mdi-heart"
                size="small"
                color="error"
                variant="text"
                @click="removeFromFavorites(contest)"
              >
                <v-tooltip activator="parent" location="top">
                  Удалить из избранного
                </v-tooltip>
              </v-btn>
            </div>

            <!-- Даты -->
            <div class="d-flex align-center text-caption text-medium-emphasis mb-2">
              <v-icon
                icon="mdi-calendar"
                size="small"
                start
                class="mr-1"
              />
              {{ formatDateRange(contest.startDate, contest.endDate) }}
            </div>

            <!-- Платформа -->
            <div class="d-flex align-center text-caption text-medium-emphasis">
              <v-icon
                :icon="getPlatformIcon(contest.platform)"
                size="small"
                start
                class="mr-1"
              />
              {{ contest.platform }}
            </div>
          </v-card-text>

          <v-divider />

          <v-card-actions>
            <v-spacer />
            <v-btn
              variant="text"
              color="primary"
              :to="'/contests/' + contest.id"
            >
              Подробнее
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>

      <!-- Нет результатов -->
      <v-alert
        v-else
        type="info"
        variant="tonal"
        class="mt-4"
      >
        <template v-slot:prepend>
          <v-icon>mdi-information</v-icon>
        </template>
        По вашему запросу ничего не найдено
      </v-alert>
    </template>

    <!-- Диалог подтверждения удаления -->
    <v-dialog
      v-model="showConfirmDialog"
      max-width="400"
    >
      <v-card>
        <v-card-title class="text-h6">
          Удаление из избранного
        </v-card-title>
        
        <v-card-text>
          Вы уверены, что хотите удалить конкурс из избранного?
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showConfirmDialog = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="error"
            @click="confirmRemove"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatDateRange } from '@/utils/formatters'

// Props
const props = defineProps({
  contests: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// События
const emit = defineEmits(['remove'])

// Состояние
const search = ref('')
const statusFilter = ref(null)
const sortBy = ref('date')
const showConfirmDialog = ref(false)
const contestToRemove = ref(null)

// Опции
const statusOptions = [
  { title: 'Активные', value: 'active' },
  { title: 'Завершенные', value: 'completed' },
  { title: 'Скоро начнутся', value: 'upcoming' }
]

const sortOptions = [
  { title: 'По дате', value: 'date' },
  { title: 'По призу', value: 'prize' },
  { title: 'По названию', value: 'title' }
]

// Вычисляемые свойства
const filteredContests = computed(() => {
  let result = [...props.contests]
  
  // Поиск
  if (search.value) {
    const query = search.value.toLowerCase()
    result = result.filter(contest => 
      contest.title.toLowerCase().includes(query)
    )
  }
  
  // Фильтр по статусу
  if (statusFilter.value) {
    result = result.filter(contest => 
      contest.status === statusFilter.value
    )
  }
  
  // Сортировка
  switch (sortBy.value) {
    case 'date':
      result.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
      break
    case 'prize':
      result.sort((a, b) => b.prizeValue - a.prizeValue)
      break
    case 'title':
      result.sort((a, b) => a.title.localeCompare(b.title))
      break
  }
  
  return result
})

// Методы
const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'success'
    case 'completed': return 'error'
    case 'upcoming': return 'warning'
    default: return 'grey'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'active': return 'Активный'
    case 'completed': return 'Завершен'
    case 'upcoming': return 'Скоро'
    default: return 'Неизвестно'
  }
}

const getPlatformIcon = (platform) => {
  switch (platform.toLowerCase()) {
    case 'vk': return 'mdi-vk'
    case 'telegram': return 'mdi-telegram'
    case 'instagram': return 'mdi-instagram'
    default: return 'mdi-web'
  }
}

const removeFromFavorites = (contest) => {
  contestToRemove.value = contest
  showConfirmDialog.value = true
}

const confirmRemove = () => {
  if (contestToRemove.value) {
    emit('remove', contestToRemove.value.id)
    showConfirmDialog.value = false
    contestToRemove.value = null
  }
}
</script>

<style scoped>
.favorites-list {
  position: relative;
}

.favorites-search {
  flex: 1;
  min-width: 200px;
}

.favorites-filter,
.favorites-sort {
  width: 200px;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.favorite-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.favorite-image {
  position: relative;
}

.prize-overlay,
.status-overlay {
  position: absolute;
  padding: 8px;
}

.prize-overlay {
  top: 0;
  right: 0;
}

.status-overlay {
  bottom: 0;
  left: 0;
}

/* Анимации */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

/* Адаптивность */
@media (width <= 600px) {
  .favorites-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .favorites-search,
  .favorites-filter,
  .favorites-sort {
    width: 100%;
  }
}
</style> 