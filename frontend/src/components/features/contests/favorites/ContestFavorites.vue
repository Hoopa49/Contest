<!-- 
  ContestFavorites.vue
  Основной компонент для управления избранными конкурсами.
  Объединяет компоненты списка и пустого состояния.
-->
<template>
  <div class="contest-favorites">
    <!-- Заголовок -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center">
        <h2 class="text-h5 mb-0">
          Избранные конкурсы
        </h2>
        <v-chip
          v-if="!loading"
          class="ml-4"
          color="primary"
          size="small"
          variant="outlined"
        >
          {{ totalContests }}
        </v-chip>
      </div>

      <v-btn
        :loading="loading"
        :disabled="loading"
        variant="text"
        prepend-icon="mdi-refresh"
        @click="loadFavorites"
      >
        Обновить
      </v-btn>
    </div>

    <!-- Загрузка -->
    <v-skeleton-loader
      v-if="loading && !error"
      type="article, paragraph, actions"
    />

    <!-- Ошибка -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      {{ error }}
      <template v-slot:append>
        <v-btn
          variant="text"
          @click="loadFavorites"
        >
          Повторить
        </v-btn>
      </template>
    </v-alert>

    <!-- Контент -->
    <template v-else>
      <!-- Список избранных -->
      <favorites-list
        v-if="favorites.length"
        :contests="favorites"
        :loading="loading"
        @remove="removeFromFavorites"
      />

      <!-- Пустое состояние -->
      <favorites-empty
        v-else
        @browse="$router.push('/contests')"
      />
    </template>

    <!-- Уведомления -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
    >
      {{ snackbarText }}
      
      <template v-slot:actions>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="showSnackbar = false"
        />
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useContestsStore } from '@/stores/contests'
import FavoritesList from './components/FavoritesList.vue'
import FavoritesEmpty from './components/FavoritesEmpty.vue'

// Состояние
const contestStore = useContestsStore()
const loading = ref(false)
const error = ref(null)
const favorites = ref([])
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Вычисляемые свойства
const totalContests = computed(() => {
  const count = favorites.value.length
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return `${count} конкурсов`
  }

  switch (lastDigit) {
    case 1:
      return `${count} конкурс`
    case 2:
    case 3:
    case 4:
      return `${count} конкурса`
    default:
      return `${count} конкурсов`
  }
})

// Методы
const loadFavorites = async () => {
  loading.value = true
  error.value = null
  
  try {
    const data = await contestStore.loadFavorites()
    favorites.value = data
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить избранные конкурсы'
    showSnackbar.value = true
    snackbarColor.value = 'error'
    snackbarText.value = error.value
  } finally {
    loading.value = false
  }
}

const removeFromFavorites = async (contestId) => {
  try {
    await contestStore.removeFromFavorites(contestId)
    
    // Удаляем из локального состояния
    const index = favorites.value.findIndex(c => c.id === contestId)
    if (index > -1) {
      favorites.value.splice(index, 1)
    }
    
    showSnackbar.value = true
    snackbarColor.value = 'success'
    snackbarText.value = 'Конкурс удален из избранного'
    
  } catch (err) {
    showSnackbar.value = true
    snackbarColor.value = 'error'
    snackbarText.value = 'Не удалось удалить конкурс из избранного'
  }
}

// Инициализация
onMounted(() => {
  loadFavorites()
})
</script>

<style scoped>
.contest-favorites {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
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
  .contest-favorites {
    padding: 16px;
  }
}
</style> 